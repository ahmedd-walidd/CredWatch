-- CredWatch Database Schema
-- Execute these SQL statements in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Breaches table (metadata about data breaches)
CREATE TABLE IF NOT EXISTS breaches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  breach_date DATE,
  description TEXT,
  data_classes TEXT[], -- Array of compromised data types (e.g., emails, passwords, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on breach name
CREATE INDEX IF NOT EXISTS idx_breaches_name ON breaches(name);

-- Breach records table (stores hashed emails from breaches)
CREATE TABLE IF NOT EXISTS breach_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  breach_id UUID NOT NULL REFERENCES breaches(id) ON DELETE CASCADE,
  email_hash VARCHAR(64) NOT NULL, -- SHA-256 hash is 64 hex characters
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_breach_records_email_hash ON breach_records(email_hash);
CREATE INDEX IF NOT EXISTS idx_breach_records_breach_id ON breach_records(breach_id);

-- Breach checks table (audit log of user breach checks)
CREATE TABLE IF NOT EXISTS breach_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_hash VARCHAR(64) NOT NULL,
  breaches_found INTEGER DEFAULT 0,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user's history queries
CREATE INDEX IF NOT EXISTS idx_breach_checks_user_id ON breach_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_breach_checks_checked_at ON breach_checks(checked_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE breach_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE breach_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only read their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Everyone can read breach metadata (public info)
CREATE POLICY "Breaches are publicly readable" ON breaches
  FOR SELECT USING (true);

-- Everyone can read breach records (needed for checking)
CREATE POLICY "Breach records are publicly readable" ON breach_records
  FOR SELECT USING (true);

-- Users can only view their own breach check history
CREATE POLICY "Users can view their own check history" ON breach_checks
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (for backend operations)
-- Note: Your backend uses the service role key, so it bypasses RLS

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
