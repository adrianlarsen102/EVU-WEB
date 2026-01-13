/**
 * Encryption Utility for Sensitive Data
 * Uses AES-256-GCM for symmetric encryption
 */

import crypto from 'crypto';

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is 12-16 bytes
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment variable
 * Falls back to a warning if not set (development only)
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // SECURITY: In production, this should throw an error
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY environment variable must be set in production');
    }

    // Development fallback (NOT secure, just for testing)
    console.warn('WARNING: ENCRYPTION_KEY not set. Using insecure fallback for development.');
    return crypto.scryptSync('dev-fallback-key-DO-NOT-USE-IN-PRODUCTION', 'salt', 32);
  }

  // Derive a 32-byte key from the environment variable using scrypt
  return crypto.scryptSync(key, 'evu-web-encryption-salt-v1', 32);
}

/**
 * Encrypt sensitive data
 * @param {string} plaintext - Data to encrypt
 * @returns {string} Encrypted data in format: iv:authTag:encrypted
 */
export function encrypt(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encrypted (all in hex)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Data in format: iv:authTag:encrypted
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedData) {
  if (!encryptedData || typeof encryptedData !== 'string') {
    return null;
  }

  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if a string is encrypted (has our format)
 * @param {string} data - String to check
 * @returns {boolean}
 */
export function isEncrypted(data) {
  if (!data || typeof data !== 'string') {
    return false;
  }

  // Check for our format: hex:hex:hex
  const parts = data.split(':');
  if (parts.length !== 3) {
    return false;
  }

  // Check that each part is valid hex
  const hexRegex = /^[0-9a-f]+$/i;
  return parts.every(part => hexRegex.test(part) && part.length > 0);
}

/**
 * Generate a random encryption key for ENCRYPTION_KEY environment variable
 * Run this once and add to .env files
 * @returns {string} 64-character hex string
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

// For testing/setup only
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log('Generated ENCRYPTION_KEY (add this to your .env file):');
  console.log(generateEncryptionKey());

  // Test encryption/decryption
  console.log('\nTesting encryption...');
  const testData = 'my-secret-password-123';
  const encrypted = encrypt(testData);
  console.log('Encrypted:', encrypted);
  const decrypted = decrypt(encrypted);
  console.log('Decrypted:', decrypted);
  console.log('Match:', testData === decrypted ? 'SUCCESS ✓' : 'FAILED ✗');
}
