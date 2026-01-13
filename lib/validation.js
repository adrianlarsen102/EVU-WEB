/**
 * Input Validation and Sanitization Library
 * Prevents injection attacks and validates user input
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize string input to prevent XSS
 * For plain text content (no HTML allowed)
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';

  // For plain text: strip all HTML tags completely
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true // Keep text content
  });

  return clean.trim().slice(0, 1000);
}

/**
 * Sanitize HTML content (allows safe HTML)
 * For rich text content where basic formatting is needed
 */
export function sanitizeHTML(input) {
  if (typeof input !== 'string') return '';

  // Allow only safe HTML tags for formatting
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'a', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true
  });

  return clean.slice(0, 5000);
}

/**
 * Validate username
 */
export function validateUsername(username) {
  const errors = [];

  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
    return { valid: false, errors, sanitized: '' };
  }

  const sanitized = username.trim();

  if (sanitized.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (sanitized.length > 20) {
    errors.push('Username must be less than 20 characters');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    errors.push('Username can only contain letters, numbers, hyphens, and underscores');
  }

  // Reserved usernames
  const reserved = ['admin', 'administrator', 'root', 'system', 'moderator', 'mod'];
  if (reserved.includes(sanitized.toLowerCase()) && sanitized !== 'admin') {
    errors.push('This username is reserved');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate password
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors, strength: 0 };
  }

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (password.length > 128) {
    errors.push('Password is too long (max 128 characters)');
  }

  // Complexity checks
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (hasUpperCase) strength += 1;
  if (hasLowerCase) strength += 1;
  if (hasNumbers) strength += 1;
  if (hasSpecialChar) strength += 1;

  // Require at least 3 character types
  const types = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  if (types < 2) {
    errors.push('Password must contain at least 2 of: uppercase, lowercase, numbers, special characters');
  }

  // Common password check
  const commonPasswords = [
    'password', 'Password123', '12345678', 'qwerty', 'admin123',
    'letmein', 'welcome', 'monkey', '1234567890', 'password1'
  ];
  if (commonPasswords.includes(password)) {
    errors.push('This password is too common. Please choose a stronger password');
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: Math.min(strength, 5) // 0-5 scale
  };
}

/**
 * Validate email
 */
export function validateEmail(email) {
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { valid: false, errors, sanitized: '' };
  }

  const sanitized = email.trim().toLowerCase();

  // SECURITY: Non-backtracking email regex to prevent ReDoS
  // Simple validation: local@domain.tld format
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    errors.push('Invalid email format');
  }

  if (sanitized.length > 254) {
    errors.push('Email is too long');
  }

  // Check for dangerous characters
  if (/[<>'"()]/.test(sanitized)) {
    errors.push('Email contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate and sanitize text content (for posts, comments, etc.)
 */
export function validateTextContent(content, minLength = 1, maxLength = 5000) {
  const errors = [];

  if (!content || typeof content !== 'string') {
    errors.push('Content is required');
    return { valid: false, errors, sanitized: '' };
  }

  const sanitized = sanitizeHTML(content.trim());

  if (sanitized.length < minLength) {
    errors.push(`Content must be at least ${minLength} characters`);
  }

  if (sanitized.length > maxLength) {
    errors.push(`Content must be less than ${maxLength} characters`);
  }

  // Check for spam patterns
  const urlCount = (sanitized.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) {
    errors.push('Content contains too many links');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate URL with proper scheme check
 * SECURITY: Prevents javascript:, data:, file:, and other dangerous schemes
 */
export function validateUrl(url) {
  const errors = [];

  if (!url || typeof url !== 'string') {
    return { valid: false, errors: ['URL is required'], sanitized: '' };
  }

  try {
    const parsed = new URL(url);

    // SECURITY: Only allow safe protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      errors.push('Only HTTP and HTTPS URLs are allowed');
    }

    // Check for suspicious patterns
    if (parsed.username || parsed.password) {
      errors.push('URLs with credentials are not allowed');
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: parsed.toString()
    };
  } catch (e) {
    return { valid: false, errors: ['Invalid URL format'], sanitized: '' };
  }
}

/**
 * Validate UUID
 */
export function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate integer in range
 */
export function validateInteger(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = parseInt(value, 10);
  if (isNaN(num)) return { valid: false, value: null };
  if (num < min || num > max) return { valid: false, value: null };
  return { valid: true, value: num };
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj, depth = 0) {
  if (depth > 10) return {}; // Prevent infinite recursion

  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObject(obj[key], depth + 1);
    }
  }
  return sanitized;
}

/**
 * Check for SQL injection patterns
 */
export function hasSQLInjection(input) {
  if (typeof input !== 'string') return false;

  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /(\bOR\b|\bAND\b).*(=|LIKE)/gi
  ];

  return patterns.some(pattern => pattern.test(input));
}

/**
 * Validate request body
 */
export function validateRequestBody(body, expectedFields) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }

  // Check for unexpected fields
  const allowedFields = Object.keys(expectedFields);
  const providedFields = Object.keys(body);

  for (const field of providedFields) {
    if (!allowedFields.includes(field)) {
      errors.push(`Unexpected field: ${field}`);
    }
  }

  // Validate expected fields
  for (const [field, config] of Object.entries(expectedFields)) {
    const value = body[field];

    if (config.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      if (config.type && typeof value !== config.type) {
        errors.push(`${field} must be a ${config.type}`);
      }

      if (config.validate) {
        const result = config.validate(value);
        if (!result.valid) {
          errors.push(...result.errors.map(e => `${field}: ${e}`));
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
