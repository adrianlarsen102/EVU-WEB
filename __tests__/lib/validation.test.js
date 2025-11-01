/**
 * @jest-environment node
 */

import {
  sanitizeString,
  sanitizeHTML,
  validateUsername,
  validatePassword,
  validateEmail,
  validateTextContent,
  validateUUID,
  validateInteger,
  hasSQLInjection,
  sanitizeObject
} from '../../lib/validation';

describe('validation.js - Input Validation & Sanitization', () => {

  describe('sanitizeString', () => {
    test('should encode HTML entities to prevent XSS', () => {
      expect(sanitizeString('<script>alert("XSS")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('should handle null and undefined', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });

    test('should preserve safe text', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World');
    });

    test('should trim whitespace', () => {
      expect(sanitizeString('  spaces  ')).toBe('spaces');
    });

    test('should handle ampersands', () => {
      expect(sanitizeString('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });
  });

  describe('sanitizeHTML', () => {
    test('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHTML(html);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });

    test('should remove dangerous tags', () => {
      const html = '<script>alert("XSS")</script><p>Safe content</p>';
      const result = sanitizeHTML(html);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe content');
    });

    test('should remove event handlers', () => {
      const html = '<p onclick="alert(\'XSS\')">Click me</p>';
      const result = sanitizeHTML(html);
      expect(result).not.toContain('onclick');
    });
  });

  describe('validateUsername', () => {
    test('should accept valid usernames', () => {
      expect(validateUsername('user123').valid).toBe(true);
      expect(validateUsername('john_doe').valid).toBe(true);
      expect(validateUsername('alice-bob').valid).toBe(true);
    });

    test('should reject short usernames', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('3 and 20 characters');
    });

    test('should reject long usernames', () => {
      const result = validateUsername('a'.repeat(21));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('3 and 20 characters');
    });

    test('should reject invalid characters', () => {
      const result = validateUsername('user@123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('alphanumeric');
    });

    test('should reject reserved usernames', () => {
      expect(validateUsername('admin').valid).toBe(false);
      expect(validateUsername('root').valid).toBe(false);
      expect(validateUsername('system').valid).toBe(false);
    });

    test('should be case-insensitive for reserved names', () => {
      expect(validateUsername('ADMIN').valid).toBe(false);
      expect(validateUsername('Root').valid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should accept strong passwords', () => {
      const result = validatePassword('StrongP@ss123');
      expect(result.valid).toBe(true);
      expect(result.strength).toBeGreaterThanOrEqual(4);
    });

    test('should reject short passwords', () => {
      const result = validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Password must be at least 8 characters long');
    });

    test('should score password strength correctly', () => {
      expect(validatePassword('password').strength).toBeLessThan(3);
      expect(validatePassword('Password1').strength).toBeGreaterThan(2);
      expect(validatePassword('P@ssw0rd!').strength).toBeGreaterThan(3);
    });

    test('should detect common passwords', () => {
      const result = validatePassword('password123');
      expect(result.issues).toContain('Password is too common');
    });

    test('should detect repeated characters', () => {
      const result = validatePassword('aaaaaaaaaa');
      expect(result.issues).toContain('Password contains too many repeated characters');
    });

    test('should require complexity', () => {
      const result = validatePassword('alllowercase');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('should accept valid emails', () => {
      expect(validateEmail('user@example.com').valid).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk').valid).toBe(true);
    });

    test('should reject invalid formats', () => {
      expect(validateEmail('notanemail').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
      expect(validateEmail('user@').valid).toBe(false);
      expect(validateEmail('user@.com').valid).toBe(false);
    });

    test('should reject emails with spaces', () => {
      expect(validateEmail('user @example.com').valid).toBe(false);
    });

    test('should handle null/undefined', () => {
      expect(validateEmail(null).valid).toBe(false);
      expect(validateEmail(undefined).valid).toBe(false);
    });
  });

  describe('validateTextContent', () => {
    test('should accept valid content', () => {
      const result = validateTextContent('This is a normal post.', 1, 1000);
      expect(result.valid).toBe(true);
    });

    test('should enforce minimum length', () => {
      const result = validateTextContent('Hi', 10, 1000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 10 characters');
    });

    test('should enforce maximum length', () => {
      const result = validateTextContent('a'.repeat(101), 1, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximum 100 characters');
    });

    test('should detect spam patterns', () => {
      const spam = 'BUY NOW!!! CLICK HERE!!! FREE MONEY!!!';
      const result = validateTextContent(spam);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('spam-like patterns');
    });

    test('should reject excessive URLs', () => {
      const spam = 'http://link1.com http://link2.com http://link3.com http://link4.com';
      const result = validateTextContent(spam);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateUUID', () => {
    test('should accept valid UUIDs', () => {
      expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    test('should reject invalid UUIDs', () => {
      expect(validateUUID('not-a-uuid')).toBe(false);
      expect(validateUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(validateUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
    });

    test('should handle null/undefined', () => {
      expect(validateUUID(null)).toBe(false);
      expect(validateUUID(undefined)).toBe(false);
    });
  });

  describe('validateInteger', () => {
    test('should accept valid integers in range', () => {
      expect(validateInteger(5, 0, 10).valid).toBe(true);
      expect(validateInteger('7', 0, 10).valid).toBe(true);
    });

    test('should reject non-integers', () => {
      expect(validateInteger('abc', 0, 10).valid).toBe(false);
      expect(validateInteger(3.14, 0, 10).valid).toBe(false);
    });

    test('should enforce minimum value', () => {
      const result = validateInteger(5, 10, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 10');
    });

    test('should enforce maximum value', () => {
      const result = validateInteger(150, 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at most 100');
    });
  });

  describe('hasSQLInjection', () => {
    test('should detect SQL injection patterns', () => {
      expect(hasSQLInjection("'; DROP TABLE users; --")).toBe(true);
      expect(hasSQLInjection("1' OR '1'='1")).toBe(true);
      expect(hasSQLInjection("admin'--")).toBe(true);
      expect(hasSQLInjection("UNION SELECT * FROM passwords")).toBe(true);
    });

    test('should allow safe input', () => {
      expect(hasSQLInjection("Hello World")).toBe(false);
      expect(hasSQLInjection("user@example.com")).toBe(false);
      expect(hasSQLInjection("It's a nice day")).toBe(false);
    });

    test('should handle null/undefined', () => {
      expect(hasSQLInjection(null)).toBe(false);
      expect(hasSQLInjection(undefined)).toBe(false);
    });
  });

  describe('sanitizeObject', () => {
    test('should sanitize all string values in object', () => {
      const obj = {
        name: '<script>XSS</script>',
        bio: 'Normal text',
        nested: {
          field: '<b>Bold</b>'
        }
      };
      const result = sanitizeObject(obj);
      expect(result.name).not.toContain('<script>');
      expect(result.bio).toBe('Normal text');
      expect(result.nested.field).not.toContain('<b>');
    });

    test('should preserve non-string values', () => {
      const obj = {
        count: 42,
        active: true,
        tags: ['tag1', 'tag2']
      };
      const result = sanitizeObject(obj);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });

    test('should handle arrays', () => {
      const obj = {
        items: ['<script>test</script>', 'safe text']
      };
      const result = sanitizeObject(obj);
      expect(result.items[0]).not.toContain('<script>');
      expect(result.items[1]).toBe('safe text');
    });

    test('should handle null/undefined', () => {
      expect(sanitizeObject(null)).toBeNull();
      expect(sanitizeObject(undefined)).toBeUndefined();
    });
  });
});
