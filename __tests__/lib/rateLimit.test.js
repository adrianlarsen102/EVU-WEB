/**
 * @jest-environment node
 */

import { createRateLimiter, rateLimiters } from '../../lib/rateLimit';

describe('rateLimit.js - Rate Limiting', () => {

  describe('createRateLimiter Function', () => {
    test('should create a rate limiter function', () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });
      expect(typeof limiter).toBe('function');
    });

    test('should use default options when not provided', () => {
      const limiter = createRateLimiter();
      expect(typeof limiter).toBe('function');
    });
  });

  describe('Predefined Rate Limiters', () => {
    test('should have login limiter configured', () => {
      expect(rateLimiters.login).toBeDefined();
      expect(typeof rateLimiters.login).toBe('function');
    });

    test('should have register limiter configured', () => {
      expect(rateLimiters.register).toBeDefined();
      expect(typeof rateLimiters.register).toBe('function');
    });

    test('should have password limiter configured', () => {
      expect(rateLimiters.password).toBeDefined();
      expect(typeof rateLimiters.password).toBe('function');
    });

    test('should have API limiter configured', () => {
      expect(rateLimiters.api).toBeDefined();
      expect(typeof rateLimiters.api).toBe('function');
    });

    test('should have content limiter configured', () => {
      expect(rateLimiters.content).toBeDefined();
      expect(typeof rateLimiters.content).toBe('function');
    });

    test('should have read limiter configured', () => {
      expect(rateLimiters.read).toBeDefined();
      expect(typeof rateLimiters.read).toBe('function');
    });

    test('should have profile limiter configured', () => {
      expect(rateLimiters.profile).toBeDefined();
      expect(typeof rateLimiters.profile).toBe('function');
    });

    test('should have forum limiters configured', () => {
      expect(rateLimiters.forumPost).toBeDefined();
      expect(rateLimiters.forumComment).toBeDefined();
      expect(typeof rateLimiters.forumPost).toBe('function');
      expect(typeof rateLimiters.forumComment).toBe('function');
    });

    test('should have support ticket limiter configured', () => {
      expect(rateLimiters.supportTicket).toBeDefined();
      expect(typeof rateLimiters.supportTicket).toBe('function');
    });

    test('should have upload limiter configured', () => {
      expect(rateLimiters.upload).toBeDefined();
      expect(typeof rateLimiters.upload).toBe('function');
    });

    test('should have email limiter configured', () => {
      expect(rateLimiters.email).toBeDefined();
      expect(typeof rateLimiters.email).toBe('function');
    });

    test('should have data export limiter configured', () => {
      expect(rateLimiters.dataExport).toBeDefined();
      expect(typeof rateLimiters.dataExport).toBe('function');
    });
  });

  describe('Rate Limiter Behavior', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
      mockReq = {
        method: 'POST',
        url: '/api/test',
        headers: {
          'x-real-ip': `192.168.1.${Math.floor(Math.random() * 255)}`  // Random IP to avoid conflicts
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis()
      };
    });

    test('should allow request within limit', async () => {
      const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });
      const result = await limiter(mockReq, mockRes);

      // Should return true or call next() (doesn't set response)
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should handle missing IP gracefully', async () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });
      const noIpReq = {
        method: 'POST',
        url: '/api/test',
        headers: {}
      };

      const result = await limiter(noIpReq, mockRes);

      // Should still work (logs warning but allows request)
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Options', () => {
    test('should accept custom maxRequests', () => {
      const limiter = createRateLimiter({ maxRequests: 100 });
      expect(typeof limiter).toBe('function');
    });

    test('should accept custom windowMs', () => {
      const limiter = createRateLimiter({ windowMs: 3600000 }); // 1 hour
      expect(typeof limiter).toBe('function');
    });

    test('should accept custom message', () => {
      const limiter = createRateLimiter({ message: 'Custom rate limit message' });
      expect(typeof limiter).toBe('function');
    });

    test('should accept skipSuccessfulRequests option', () => {
      const limiter = createRateLimiter({ skipSuccessfulRequests: true });
      expect(typeof limiter).toBe('function');
    });
  });
});
