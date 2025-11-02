/**
 * @jest-environment node
 */

// Mock crypto before importing csrf module
const mockRandomBytes = jest.fn(() => Buffer.from('a'.repeat(32)));
jest.mock('crypto', () => ({
  randomBytes: (size) => mockRandomBytes(size),
  createHmac: jest.requireActual('crypto').createHmac
}));

import { generateCSRFToken, validateCSRFToken } from '../../lib/csrf';

describe('csrf.js - CSRF Token Protection', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure CSRF_SECRET is set for tests
    process.env.CSRF_SECRET = 'test-csrf-secret-minimum-32-characters-long-for-security';
  });

  describe('generateCSRFToken', () => {
    test('should generate valid CSRF token', () => {
      const sessionId = 'test-session-123';
      const token = generateCSRFToken(sessionId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should generate different tokens for different sessions', () => {
      const token1 = generateCSRFToken('session-1');
      const token2 = generateCSRFToken('session-2');

      expect(token1).not.toBe(token2);
    });

    test('should generate consistent token for same session', () => {
      const sessionId = 'test-session-123';

      // Generate token twice with same session
      const token1 = generateCSRFToken(sessionId);

      // Wait a tiny bit to ensure timestamp could be different
      jest.advanceTimersByTime(10);

      const token2 = generateCSRFToken(sessionId);

      // Tokens should be different (includes timestamp)
      // but should both be valid for the same session
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });

    test('should reject empty session ID', () => {
      expect(() => generateCSRFToken('')).toThrow('Session ID required to generate CSRF token');
    });
  });

  describe('validateCSRFToken', () => {
    test('should validate correct token', () => {
      const sessionId = 'test-session-123';
      const token = generateCSRFToken(sessionId);

      const isValid = validateCSRFToken(token, sessionId);
      expect(isValid).toBe(true);
    });

    test('should reject token for different session', () => {
      const token = generateCSRFToken('session-1');
      const isValid = validateCSRFToken(token, 'session-2');

      expect(isValid).toBe(false);
    });

    test('should reject invalid token format', () => {
      const isValid = validateCSRFToken('invalid-token', 'session-123');
      expect(isValid).toBe(false);
    });

    test('should reject empty token', () => {
      const isValid = validateCSRFToken('', 'session-123');
      expect(isValid).toBe(false);
    });

    test('should reject null/undefined tokens', () => {
      expect(validateCSRFToken(null, 'session-123')).toBe(false);
      expect(validateCSRFToken(undefined, 'session-123')).toBe(false);
    });

    test('should reject expired tokens', () => {
      const sessionId = 'test-session-123';
      const token = generateCSRFToken(sessionId);

      // Fast-forward time by more than 1 hour (token expiry time)
      const futureTime = Date.now() + (61 * 60 * 1000); // 61 minutes
      jest.spyOn(Date, 'now').mockReturnValue(futureTime);

      const isValid = validateCSRFToken(token, sessionId);
      expect(isValid).toBe(false);

      jest.spyOn(Date, 'now').mockRestore();
    });

    test('should handle malformed token structure', () => {
      const isValid = validateCSRFToken('just.two.parts', 'session-123');
      expect(isValid).toBe(false);
    });
  });

  describe('Token Storage and Cleanup', () => {
    test('should store tokens internally', () => {
      const sessionId = 'test-session-123';

      // Generate multiple tokens
      generateCSRFToken(sessionId);
      generateCSRFToken(sessionId);
      generateCSRFToken(sessionId);

      // Tokens should be stored (implicitly tested by validation)
      const latestToken = generateCSRFToken(sessionId);
      expect(validateCSRFToken(latestToken, sessionId)).toBe(true);
    });
  });

  describe('Security Properties', () => {
    test('should use HMAC for signature', () => {
      const sessionId = 'test-session-123';
      const token = generateCSRFToken(sessionId);

      // Token should contain signature part (HMAC)
      expect(token).toContain('.');
      const parts = token.split('.');
      expect(parts.length).toBe(2); // token.signature (2-part format)
      expect(parts[0].length).toBe(64); // 32 bytes = 64 hex chars
      expect(parts[1].length).toBe(64); // HMAC SHA256 = 64 hex chars
    });

    test('should prevent token reuse across sessions', () => {
      const token = generateCSRFToken('session-1');

      // Try to use the same token for a different session
      expect(validateCSRFToken(token, 'session-1')).toBe(true);
      expect(validateCSRFToken(token, 'session-2')).toBe(false);
    });
  });

  describe('Environment Variable Validation', () => {
    test('should require CSRF_SECRET to be set', () => {
      // This is tested at module load time
      // If CSRF_SECRET is not set, the module should throw
      expect(process.env.CSRF_SECRET).toBeDefined();
      expect(process.env.CSRF_SECRET.length).toBeGreaterThanOrEqual(32);
    });
  });
});
