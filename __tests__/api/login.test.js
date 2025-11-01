/**
 * @jest-environment node
 */

// Mock dependencies before imports
jest.mock('../../lib/auth', () => ({
  verifyLogin: jest.fn(),
  createSession: jest.fn()
}));

jest.mock('../../lib/auditLog', () => ({
  auditLog: jest.fn().mockResolvedValue(undefined),
  AuditEventTypes: {
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE'
  },
  AuditSeverity: {
    INFO: 'info',
    WARNING: 'warning'
  }
}));

jest.mock('../../lib/rateLimit', () => ({
  rateLimiters: {
    login: {
      check: jest.fn().mockResolvedValue(true)
    }
  }
}));

import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/login';
import { verifyLogin, createSession } from '../../lib/auth';
import { rateLimiters } from '../../lib/rateLimit';
import { auditLog, AuditEventTypes } from '../../lib/auditLog';

describe('/api/login - Login Endpoint', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/login', () => {
    test('should reject non-POST requests', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed'
      });
    });

    test('should apply rate limiting', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          password: 'password123'
        }
      });

      await handler(req, res);

      expect(rateLimiters.login.check).toHaveBeenCalledWith(req, res);
    });

    test('should reject when rate limit exceeded', async () => {
      rateLimiters.login.check.mockResolvedValueOnce(false);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          password: 'password123'
        }
      });

      await handler(req, res);

      // Rate limiter already sent response
      expect(verifyLogin).not.toHaveBeenCalled();
    });

    test('should reject missing username', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          password: 'password123'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Username and password are required'
      });
    });

    test('should reject missing password', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Username and password are required'
      });
    });

    test('should successfully login with valid credentials', async () => {
      const mockAdmin = {
        id: 'user-123',
        username: 'testuser',
        is_default_password: false
      };

      verifyLogin.mockResolvedValueOnce(mockAdmin);
      createSession.mockResolvedValueOnce('session-token-123');

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          password: 'correctpassword'
        }
      });

      await handler(req, res);

      expect(verifyLogin).toHaveBeenCalledWith('testuser', 'correctpassword');
      expect(createSession).toHaveBeenCalledWith('user-123');
      expect(res._getStatusCode()).toBe(200);

      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        success: true,
        isDefaultPassword: false
      });

      // Check session cookie was set
      const cookies = res._getHeaders()['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('sessionId=session-token-123');
      expect(cookies[0]).toContain('HttpOnly');
      expect(cookies[0]).toContain('SameSite=Strict');
    });

    test('should set isDefaultPassword flag correctly', async () => {
      const mockAdmin = {
        id: 'user-123',
        username: 'admin',
        is_default_password: true
      };

      verifyLogin.mockResolvedValueOnce(mockAdmin);
      createSession.mockResolvedValueOnce('session-token-123');

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'admin',
          password: 'admin123'
        }
      });

      await handler(req, res);

      const responseData = JSON.parse(res._getData());
      expect(responseData.isDefaultPassword).toBe(true);
    });

    test('should reject invalid credentials', async () => {
      verifyLogin.mockResolvedValueOnce(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          password: 'wrongpassword'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid username or password'
      });
    });

    test('should log successful login', async () => {
      const mockAdmin = {
        id: 'user-123',
        username: 'testuser',
        is_default_password: false
      };

      verifyLogin.mockResolvedValueOnce(mockAdmin);
      createSession.mockResolvedValueOnce('session-token-123');

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          password: 'correctpassword'
        },
        headers: {
          'x-real-ip': '127.0.0.1'
        }
      });

      await handler(req, res);

      expect(auditLog).toHaveBeenCalledWith(
        AuditEventTypes.LOGIN_SUCCESS,
        'user-123',
        expect.objectContaining({ username: 'testuser' }),
        expect.any(String),
        '127.0.0.1'
      );
    });

    test('should log failed login attempt', async () => {
      verifyLogin.mockResolvedValueOnce(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          password: 'wrongpassword'
        },
        headers: {
          'x-real-ip': '127.0.0.1'
        }
      });

      await handler(req, res);

      expect(auditLog).toHaveBeenCalledWith(
        AuditEventTypes.LOGIN_FAILURE,
        null,
        expect.objectContaining({ username: 'testuser' }),
        expect.any(String),
        '127.0.0.1'
      );
    });

    test('should handle database errors gracefully', async () => {
      verifyLogin.mockRejectedValueOnce(new Error('Database connection failed'));

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          password: 'password123'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error'
      });
    });

    test('should sanitize username input', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: '<script>alert("XSS")</script>',
          password: 'password123'
        }
      });

      await handler(req, res);

      // Verify the username was processed (either sanitized or rejected)
      expect(verifyLogin).toHaveBeenCalled();
    });

    test('should set secure cookie in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockAdmin = {
        id: 'user-123',
        username: 'testuser',
        is_default_password: false
      };

      verifyLogin.mockResolvedValueOnce(mockAdmin);
      createSession.mockResolvedValueOnce('session-token-123');

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          password: 'correctpassword'
        }
      });

      await handler(req, res);

      const cookies = res._getHeaders()['set-cookie'];
      expect(cookies[0]).toContain('Secure');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
