/**
 * Centralized Error Handling Utility
 * Provides consistent error responses and logging
 */

import { auditLog, AuditEventTypes, AuditSeverity } from './auditLog.js';

/**
 * Error types for classification
 */
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST'
};

/**
 * HTTP status codes for error types
 */
const ErrorStatusCodes = {
  [ErrorTypes.VALIDATION_ERROR]: 400,
  [ErrorTypes.AUTHENTICATION_ERROR]: 401,
  [ErrorTypes.AUTHORIZATION_ERROR]: 403,
  [ErrorTypes.NOT_FOUND_ERROR]: 404,
  [ErrorTypes.RATE_LIMIT_ERROR]: 429,
  [ErrorTypes.DATABASE_ERROR]: 500,
  [ErrorTypes.INTERNAL_ERROR]: 500,
  [ErrorTypes.BAD_REQUEST]: 400
};

/**
 * User-friendly error messages (no technical details exposed)
 */
const ErrorMessages = {
  [ErrorTypes.VALIDATION_ERROR]: 'Invalid input provided',
  [ErrorTypes.AUTHENTICATION_ERROR]: 'Authentication failed',
  [ErrorTypes.AUTHORIZATION_ERROR]: 'Access denied',
  [ErrorTypes.NOT_FOUND_ERROR]: 'Resource not found',
  [ErrorTypes.RATE_LIMIT_ERROR]: 'Too many requests, please try again later',
  [ErrorTypes.DATABASE_ERROR]: 'A database error occurred',
  [ErrorTypes.INTERNAL_ERROR]: 'An internal server error occurred',
  [ErrorTypes.BAD_REQUEST]: 'Bad request'
};

/**
 * Application Error Class
 */
export class AppError extends Error {
  constructor(type, message, details = {}) {
    super(message || ErrorMessages[type]);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = ErrorStatusCodes[type] || 500;
    this.details = details;
    this.isOperational = true; // Distinguish from programming errors
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return (
    req.headers['x-vercel-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @param {string|null} userId - Optional user ID for audit logging
 */
export async function handleAPIError(error, req, res, userId = null) {
  const clientIP = getClientIP(req);

  // Handle operational errors (AppError instances)
  if (error.isOperational) {
    // Log non-validation errors to audit log
    if (error.type !== ErrorTypes.VALIDATION_ERROR) {
      await auditLog(
        AuditEventTypes.SYSTEM_ERROR,
        userId,
        {
          errorType: error.type,
          message: error.message,
          path: req.url,
          method: req.method
        },
        error.statusCode >= 500 ? AuditSeverity.ERROR : AuditSeverity.WARNING,
        clientIP
      );
    }

    return res.status(error.statusCode).json({
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && error.details
        ? { details: error.details }
        : {})
    });
  }

  // Handle unexpected errors (programming errors)
  console.error('Unexpected error:', error);

  // Log critical errors to audit log
  await auditLog(
    AuditEventTypes.SYSTEM_ERROR,
    userId,
    {
      message: 'Unexpected server error',
      path: req.url,
      method: req.method,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    AuditSeverity.CRITICAL,
    clientIP
  );

  // Never expose internal error details to client
  return res.status(500).json({
    error: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development'
      ? { message: error.message, stack: error.stack }
      : {})
  });
}

/**
 * Async handler wrapper to catch errors in API routes
 * @param {Function} handler - Async API route handler
 * @returns {Function} Wrapped handler with error catching
 */
export function asyncHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      await handleAPIError(error, req, res);
    }
  };
}

/**
 * Validate request method
 * @param {Object} req - Next.js request object
 * @param {string|string[]} allowedMethods - Allowed HTTP methods
 * @throws {AppError} If method not allowed
 */
export function validateMethod(req, allowedMethods) {
  const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];

  if (!methods.includes(req.method)) {
    throw new AppError(
      ErrorTypes.BAD_REQUEST,
      `Method ${req.method} not allowed. Allowed methods: ${methods.join(', ')}`
    );
  }
}

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @throws {AppError} If required fields are missing
 */
export function validateRequiredFields(body, requiredFields) {
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    throw new AppError(
      ErrorTypes.VALIDATION_ERROR,
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields }
    );
  }
}

/**
 * Create validation error
 * @param {string} message - Error message
 * @param {Object} details - Additional details
 * @returns {AppError}
 */
export function createValidationError(message, details = {}) {
  return new AppError(ErrorTypes.VALIDATION_ERROR, message, details);
}

/**
 * Create authentication error
 * @param {string} message - Error message
 * @returns {AppError}
 */
export function createAuthError(message = 'Authentication required') {
  return new AppError(ErrorTypes.AUTHENTICATION_ERROR, message);
}

/**
 * Create authorization error
 * @param {string} message - Error message
 * @returns {AppError}
 */
export function createAuthorizationError(message = 'Access denied') {
  return new AppError(ErrorTypes.AUTHORIZATION_ERROR, message);
}

/**
 * Create not found error
 * @param {string} resource - Resource name
 * @returns {AppError}
 */
export function createNotFoundError(resource = 'Resource') {
  return new AppError(ErrorTypes.NOT_FOUND_ERROR, `${resource} not found`);
}

/**
 * Create database error
 * @param {Error} originalError - Original database error
 * @returns {AppError}
 */
export function createDatabaseError(originalError) {
  console.error('Database error:', originalError);
  return new AppError(
    ErrorTypes.DATABASE_ERROR,
    'A database error occurred',
    { originalMessage: originalError.message }
  );
}
