#!/usr/bin/env node

/**
 * Breach Data Ingestion Script
 * 
 * This script ingests breach data from CSV or JSON files into the Supabase database.
 * 
 * Usage:
 *   node ingestBreach.js --name "Company Name" --file path/to/emails.csv --date 2024-01-15 --description "Description"
 *   node ingestBreach.js --name "Company Name" --file path/to/emails.json --date 2024-01-15
 * 
 * CSV Format: One email per line
 * JSON Format: Array of objects with "email" field or array of email strings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
};

const breachName = getArg('--name');
const filePath = getArg('--file');
const breachDate = getArg('--date');
const description = getArg('--description') || '';
const dataClasses = getArg('--data-classes')?.split(',') || ['email-addresses'];

// Validate required arguments
if (!breachName || !filePath) {
  console.error('Usage: node ingestBreach.js --name "Breach Name" --file path/to/file --date YYYY-MM-DD [--description "..."] [--data-classes "email,passwords"]');
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase configuration. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Hash an email using SHA-256
 */
function hashEmail(email) {
  const normalized = email.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Read and parse the breach data file
 */
function readBreachFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');
  
  let emails = [];
  
  if (ext === '.json') {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      emails = data.map(item => 
        typeof item === 'string' ? item : item.email
      ).filter(Boolean);
    }
  } else if (ext === '.csv' || ext === '.txt') {
    emails = content.split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes('@'));
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .json, .csv, or .txt`);
  }
  
  return emails;
}

/**
 * Main ingestion function
 */
async function ingestBreach() {
  try {
    console.log('=== CredWatch Breach Ingestion ===');
    console.log(`Breach Name: ${breachName}`);
    console.log(`File: ${filePath}`);
    console.log(`Date: ${breachDate || 'Not specified'}`);
    console.log('');

    // Read emails from file
    console.log('Reading breach file...');
    const emails = readBreachFile(filePath);
    console.log(`Found ${emails.length} email addresses`);

    // Create breach record
    console.log('\nCreating breach record in database...');
    const { data: breach, error: breachError } = await supabase
      .from('breaches')
      .insert([{
        name: breachName,
        breach_date: breachDate || null,
        description,
        data_classes: dataClasses,
      }])
      .select()
      .single();

    if (breachError) {
      throw new Error(`Failed to create breach: ${breachError.message}`);
    }

    console.log(`Breach created with ID: ${breach.id}`);

    // Hash emails and prepare breach records
    console.log('\nHashing emails and preparing records...');
    const hashedEmails = new Set(); // Use Set to avoid duplicates
    emails.forEach(email => {
      hashedEmails.add(hashEmail(email));
    });

    const breachRecords = Array.from(hashedEmails).map(hash => ({
      breach_id: breach.id,
      email_hash: hash,
    }));

    console.log(`Prepared ${breachRecords.length} unique hashed records`);

    // Insert in batches to avoid hitting limits
    const batchSize = 1000;
    let inserted = 0;

    console.log('\nInserting breach records...');
    for (let i = 0; i < breachRecords.length; i += batchSize) {
      const batch = breachRecords.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('breach_records')
        .insert(batch);

      if (insertError) {
        throw new Error(`Failed to insert batch: ${insertError.message}`);
      }

      inserted += batch.length;
      const progress = ((inserted / breachRecords.length) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${inserted}/${breachRecords.length} (${progress}%)`);
    }

    console.log('\n\n=== Ingestion Complete ===');
    console.log(`Total emails processed: ${emails.length}`);
    console.log(`Unique hashes inserted: ${breachRecords.length}`);
    console.log(`Breach ID: ${breach.id}`);
    
  } catch (error) {
    console.error('\n❌ Error during ingestion:', error.message);
    process.exit(1);
  }
}

// Run the ingestion
ingestBreach();
