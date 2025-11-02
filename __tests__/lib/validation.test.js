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
    test('should remove HTML tags to prevent XSS', () => {
      expect(sanitizeString('<script>alert("XSS")</script>'))
        .toBe('scriptalert("XSS")/script');
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

    test('should preserve ampersands', () => {
      expect(sanitizeString('Tom & Jerry')).toBe('Tom & Jerry');
    });

    test('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
    });

    test('should remove event handlers', () => {
      expect(sanitizeString('text onclick=alert(1)')).toBe('text alert(1)');
    });

    test('should limit length to 1000 characters', () => {
      const longString = 'a'.repeat(1500);
      expect(sanitizeString(longString).length).toBe(1000);
    });
  });

  describe('sanitizeHTML', () => {
    test('should encode HTML entities', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHTML(html);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).not.toContain('<p>');
    });

    test('should encode quotes', () => {
      const html = '<p class="test">text</p>';
      const result = sanitizeHTML(html);
      expect(result).toContain('&quot;');
    });

    test('should remove event handlers', () => {
      const html = '<p onclick="alert(\'XSS\')">Click me</p>';
      const result = sanitizeHTML(html);
      expect(result).not.toContain('<p>');
      expect(result).toContain('&lt;');
    });

    test('should limit length to 5000 characters', () => {
      const longHtml = 'a'.repeat(6000);
      expect(sanitizeHTML(longHtml).length).toBeLessThanOrEqual(5000);
    });
  });

  describe('validateUsername', () => {
    test('should accept valid username', () => {
      const result = validateUsername('john_doe');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('john_doe');
    });

    test('should reject short usernames', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters');
    });

    test('should reject long usernames', () => {
      const result = validateUsername('a'.repeat(21));
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Username must be less than 20 characters');
    });

    test('should reject invalid characters', () => {
      const result = validateUsername('user@123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Username can only contain letters, numbers, hyphens, and underscores');
    });

    test('should allow admin username', () => {
      // Admin is allowed as an exception
      expect(validateUsername('admin').valid).toBe(true);
    });

    test('should reject other reserved usernames', () => {
      expect(validateUsername('root').valid).toBe(false);
      expect(validateUsername('system').valid).toBe(false);
      expect(validateUsername('moderator').valid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should accept strong password', () => {
      const result = validatePassword('MyP@ssw0rd!');
      expect(result.valid).toBe(true);
      expect(result.strength).toBeGreaterThan(3);
    });

    test('should reject short passwords', () => {
      const result = validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    test('should score password strength correctly', () => {
      const weak = validatePassword('password');
      const strong = validatePassword('MyP@ssw0rd123!');
      expect(strong.strength).toBeGreaterThan(weak.strength);
    });

    test('should detect common passwords', () => {
      const result = validatePassword('password123');
      expect(result.errors).toContain('Password is too common');
    });

    test('should detect repeated characters', () => {
      const result = validatePassword('aaaaaaaaaa');
      expect(result.errors).toContain('Password contains too many repeated characters');
    });

    test('should require complexity', () => {
      const result = validatePassword('simplepass');
      expect(result.strength).toBeLessThan(4);
    });
  });

  describe('validateEmail', () => {
    test('should accept valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    test('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });

    test('should handle null and undefined', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('validateTextContent', () => {
    test('should accept valid text', () => {
      const result = validateTextContent('This is valid content');
      expect(result.valid).toBe(true);
    });

    test('should enforce minimum length', () => {
      const result = validateTextContent('Hi', 10, 1000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text must be at least 10 characters long');
    });

    test('should enforce maximum length', () => {
      const result = validateTextContent('a'.repeat(101), 1, 100);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text cannot exceed 100 characters');
    });

    test('should detect spam patterns', () => {
      const spam = 'BUY NOW!!! CLICK HERE!!! FREE MONEY!!!';
      const result = validateTextContent(spam);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text contains spam-like patterns');
    });

    test('should accept normal text', () => {
      const result = validateTextContent('This is a normal forum post about gaming.');
      expect(result.valid).toBe(true);
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
      expect(validateUUID('')).toBe(false);
    });
  });

  describe('validateInteger', () => {
    test('should accept valid integers', () => {
      expect(validateInteger(5, 0, 10).valid).toBe(true);
      expect(validateInteger('7', 0, 10).valid).toBe(true);
    });

    test('should reject non-integers', () => {
      expect(validateInteger('abc', 0, 10).valid).toBe(false);
    });

    test('should reject floats', () => {
      expect(validateInteger(3.14, 0, 10).valid).toBe(false);
    });

    test('should enforce minimum value', () => {
      const result = validateInteger(5, 10, 100);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Value must be at least 10');
    });

    test('should enforce maximum value', () => {
      const result = validateInteger(150, 0, 100);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Value cannot exceed 100');
    });
  });

  describe('hasSQLInjection', () => {
    test('should detect SQL injection patterns', () => {
      expect(hasSQLInjection("'; DROP TABLE users--")).toBe(true);
      expect(hasSQLInjection("1' OR '1'='1")).toBe(true);
      expect(hasSQLInjection("admin'--")).toBe(true);
    });

    test('should allow normal text', () => {
      expect(hasSQLInjection('normal username')).toBe(false);
      expect(hasSQLInjection("It's a normal sentence")).toBe(false);
    });
  });

  describe('sanitizeObject', () => {
    test('should sanitize object values', () => {
      const input = {
        name: '<script>alert(1)</script>',
        bio: 'Normal text'
      };
      const result = sanitizeObject(input);
      expect(result.name).toBe('scriptalert(1)/script');
      expect(result.bio).toBe('Normal text');
    });

    test('should handle nested objects', () => {
      const input = {
        user: {
          name: '<b>Test</b>'
        }
      };
      const result = sanitizeObject(input);
      expect(result.user.name).toBe('bTest/b');
    });

    test('should handle arrays', () => {
      const input = {
        tags: ['<script>xss</script>', 'normal']
      };
      const result = sanitizeObject(input);
      expect(result.tags[0]).toBe('scriptxss/script');
      expect(result.tags[1]).toBe('normal');
    });
  });
});
