import crypto from 'crypto';

/**
 * Hash an email address using SHA-256 for privacy-preserving lookups
 * @param {string} email - The email address to hash
 * @returns {string} - The SHA-256 hash of the email (lowercase, trimmed)
 */
export const hashEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email provided for hashing');
  }
  
  // Normalize email: lowercase and trim
  const normalizedEmail = email.toLowerCase().trim();
  
  // Create SHA-256 hash
  const hash = crypto.createHash('sha256').update(normalizedEmail).digest('hex');
  
  return hash;
};

/**
 * Validate email format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default { hashEmail, isValidEmail };
