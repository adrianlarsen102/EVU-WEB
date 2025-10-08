# EVU-WEB Security Guide

**Comprehensive security documentation for the EVU Gaming Network platform**

---

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication & Sessions](#authentication--sessions)
- [Rate Limiting](#rate-limiting)
- [Input Validation](#input-validation)
- [CSRF Protection](#csrf-protection)
- [XSS Prevention](#xss-prevention)
- [SQL Injection Prevention](#sql-injection-prevention)
- [Password Security](#password-security)
- [Security Logging](#security-logging)
- [Content Security Policy](#content-security-policy)
- [Security Headers](#security-headers)
- [IP Blocking](#ip-blocking)
- [Best Practices](#best-practices)
- [Incident Response](#incident-response)

---

## Security Overview

EVU-WEB implements **defense-in-depth** security with multiple layers of protection:

### Security Layers

```
┌─────────────────────────────────────────┐
│   Layer 1: Network (Vercel Edge)       │
├─────────────────────────────────────────┤
│   Layer 2: Rate Limiting                │
├─────────────────────────────────────────┤
│   Layer 3: Input Validation             │
├─────────────────────────────────────────┤
│   Layer 4: Authentication & CSRF        │
├─────────────────────────────────────────┤
│   Layer 5: Application Logic            │
├─────────────────────────────────────────┤
│   Layer 6: Database (Supabase RLS)      │
└─────────────────────────────────────────┘
```

### Threat Model

**Protected Against:**
- ✅ Brute force attacks
- ✅ SQL injection
- ✅ XSS (Cross-Site Scripting)
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ Session hijacking
- ✅ Timing attacks
- ✅ Path traversal
- ✅ Credential stuffing
- ✅ Common password attacks

---

## Authentication & Sessions

### Session Management

**Implementation**: [lib/database.js](../../lib/database.js)

```javascript
// Secure session creation
const sessionId = crypto.randomBytes(32).toString('hex'); // 64-char hex
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
```

**Features:**
- 64-character cryptographically random session IDs
- 24-hour expiration
- HttpOnly cookies (JavaScript cannot access)
- SameSite=Strict (CSRF protection)
- Secure flag in production (HTTPS only)
- Automatic cleanup of expired sessions

### Cookie Security

**Login API**: [pages/api/login.js](../../pages/api/login.js:40)

```javascript
const cookieOptions = [
  `sessionId=${sessionId}`,
  'Path=/',
  'HttpOnly',                    // Prevents JavaScript access
  'SameSite=Strict',             // CSRF protection
  process.env.NODE_ENV === 'production' ? 'Secure' : '',  // HTTPS only
  'Max-Age=86400'                // 24 hours
].filter(Boolean).join('; ');
```

### Password Hashing

**Algorithm**: bcrypt with 10 salt rounds

```javascript
const SALT_ROUNDS = 10;
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
```

**Why bcrypt?**
- Computationally expensive (prevents brute force)
- Automatic salt generation
- Timing attack resistant
- Industry standard

---

## Rate Limiting

### Implementation

**File**: [lib/rateLimit.js](../../lib/rateLimit.js)

### Rate Limit Policies

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/login` | 5 requests | 15 minutes | Prevent brute force |
| `/api/register` | 3 requests | 1 hour | Prevent spam accounts |
| `/api/change-password` | 5 requests | 1 hour | Prevent abuse |
| `/api/*` (general) | 30 requests | 1 minute | API abuse prevention |
| Public content | 100 requests | 1 minute | DDoS protection |

### Rate Limit Headers

Clients receive these headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2025-01-15T10:30:00.000Z
Retry-After: 900
```

### Response on Rate Limit

```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": 900
}
```

**Status Code**: `429 Too Many Requests`

---

## Input Validation

### Validation Library

**File**: [lib/validation.js](../../lib/validation.js)

### Validation Functions

#### Username Validation

```javascript
validateUsername(username)
// Returns: { valid: boolean, errors: string[], sanitized: string }
```

**Rules:**
- Length: 3-20 characters
- Allowed: letters, numbers, hyphens, underscores
- Sanitized: trimmed, lowercase
- Blocked: Reserved usernames (admin, root, system, etc.)

#### Password Validation

```javascript
validatePassword(password)
// Returns: { valid: boolean, errors: string[], strength: 0-5 }
```

**Requirements:**
- Minimum 8 characters
- Maximum 128 characters
- At least 2 of: uppercase, lowercase, numbers, special characters
- Not a common password
- No repeated characters (aaa, 111, etc.)

**Strength Scale:**
- 0-1: Weak
- 2-3: Medium
- 4-5: Strong

#### Email Validation

```javascript
validateEmail(email)
// Returns: { valid: boolean, errors: string[], sanitized: string }
```

**Rules:**
- Valid email format
- Maximum 254 characters
- No dangerous characters (`<`, `>`, `'`, `"`, `(`, `)`)
- Normalized to lowercase

### Sanitization

#### String Sanitization

```javascript
sanitizeString(input)
// Removes: <, >, javascript:, event handlers
// Limits: 1000 characters
```

#### HTML Sanitization

```javascript
sanitizeHTML(input)
// Converts: <, >, ", ' to HTML entities
// Limits: 5000 characters
```

#### SQL Injection Detection

```javascript
hasSQLInjection(input)
// Detects: SELECT, INSERT, UPDATE, DELETE, --, ;, /*, etc.
```

---

## CSRF Protection

### Implementation

**File**: [lib/security.js](../../lib/security.js)

### Token Generation

```javascript
const token = crypto.randomBytes(32).toString('hex'); // 64-char hex
```

**Token Lifetime**: 1 hour

### Usage

#### Generate Token (Backend)

```javascript
import { generateCSRFToken } from '../../lib/security';

const csrfToken = generateCSRFToken(sessionId);
// Send to client
```

#### Validate Token (Backend)

```javascript
import { validateCSRFToken } from '../../lib/security';

const isValid = validateCSRFToken(token, sessionId);
```

#### Send Token (Frontend)

```javascript
fetch('/api/content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

### Protected Endpoints

CSRF protection is **skipped** for:
- GET requests (read-only)
- HEAD requests
- OPTIONS requests
- Public endpoints (`/api/login`, `/api/register`)

CSRF protection is **required** for:
- All POST/PUT/DELETE requests
- Admin operations
- User profile updates

---

## XSS Prevention

### Multiple Layers

#### 1. Content Security Policy

```javascript
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-cdns.com;
style-src 'self' 'unsafe-inline';
```

#### 2. Input Sanitization

All user input is sanitized before storage:

```javascript
const sanitized = sanitizeHTML(userInput);
// Converts < > " ' to HTML entities
```

#### 3. Output Encoding

React automatically escapes output:

```jsx
<p>{userInput}</p>  // Automatically escaped
```

#### 4. HttpOnly Cookies

Session cookies cannot be accessed by JavaScript:

```javascript
HttpOnly; // Prevents document.cookie access
```

---

## SQL Injection Prevention

### Parameterized Queries

**Supabase** uses parameterized queries internally:

```javascript
// SAFE: Parameters are escaped
const { data } = await supabase
  .from('admins')
  .select('*')
  .eq('username', username);  // Automatically parameterized
```

### Input Validation

Additional validation layer:

```javascript
if (hasSQLInjection(input)) {
  securityLog('SQL_INJECTION_ATTEMPT', { input, ip });
  return res.status(400).json({ error: 'Invalid input' });
}
```

**Detects patterns like:**
- `SELECT * FROM users WHERE...`
- `'; DROP TABLE users; --`
- `UNION SELECT * FROM passwords`

---

## Password Security

### Password Policy

**Requirements:**
- ✅ Minimum 8 characters
- ✅ At least 2 character types (uppercase, lowercase, numbers, special)
- ✅ Not a common password
- ✅ No repeated characters
- ✅ Not the default password (admin123)

### Common Passwords Blocked

```javascript
const blockedPasswords = [
  'password', 'Password123', '12345678', 'qwerty',
  'admin123', 'letmein', 'welcome', 'monkey'
];
```

### Password Strength Indicator

```javascript
validatePassword(password)
// Returns strength: 0-5

// Frontend displays:
0-1: "Weak" (red)
2-3: "Medium" (yellow)
4-5: "Strong" (green)
```

### Forced Password Change

Default passwords **must** be changed on first login:

```javascript
if (admin.isDefaultPassword) {
  // Force password change modal
  setShowPasswordChange(true);
}
```

---

## Security Logging

### Event Logging

**File**: [lib/security.js](../../lib/security.js)

### Log Severity Levels

| Level | Events | Action |
|-------|--------|--------|
| **Critical** | SQL injection, XSS, Unauthorized access | Console warn + Store |
| **High** | Rate limit exceeded, CSRF failed, Failed login | Console warn + Store |
| **Medium** | Invalid input, Session expired, Password change | Store only |
| **Low** | General events | Store only |

### Logged Events

```javascript
securityLog('event', {
  userId: 'uuid',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  details: {...}
});
```

**Common Events:**
- `Successful login`
- `Failed login attempt`
- `New user registration`
- `Password change`
- `Rate limit exceeded`
- `CSRF validation failed`
- `SQL_INJECTION_ATTEMPT`
- `XSS_ATTEMPT`
- `Suspicious activity detected`

### Audit Trail

All important actions are logged:

```javascript
auditLog('action', userId, details);
```

**Examples:**
- User created
- Password changed
- Content updated
- Admin access granted
- User deleted

### Retrieving Logs

```javascript
import { getSecurityEvents } from '../../lib/security';

// Get last 100 high-severity events
const events = getSecurityEvents(100, 'high');
```

---

## Content Security Policy

### Full CSP Header

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://web.cmp.usercentrics.eu https://cdn.vercel-insights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com wss://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### CSP Directives Explained

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Only load resources from same origin |
| `script-src` | Trusted CDNs | Allow scripts from specific sources |
| `style-src` | `'self' 'unsafe-inline'` | Allow inline styles (for styled-jsx) |
| `img-src` | `'self' data: https:` | Allow images from anywhere |
| `connect-src` | Supabase, Vercel | Allow API calls |
| `frame-ancestors` | `'none'` | Prevent clickjacking |
| `form-action` | `'self'` | Forms can only submit to same origin |

---

## Security Headers

### Complete Header Set

**File**: [vercel.json](../../vercel.json) + [next.config.js](../../next.config.js)

```javascript
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "...",
  "X-DNS-Prefetch-Control": "on"
}
```

### Header Explanations

**X-Content-Type-Options: nosniff**
- Prevents MIME-type sniffing
- Browsers must respect declared content types

**X-Frame-Options: DENY**
- Prevents page from being embedded in iframe
- Clickjacking protection

**X-XSS-Protection: 1; mode=block**
- Enables browser's built-in XSS filter
- Blocks page if XSS attack detected

**Strict-Transport-Security**
- Forces HTTPS for 1 year
- Includes all subdomains

**Permissions-Policy**
- Disables camera, microphone, geolocation
- Privacy protection

---

## IP Blocking

### Automatic Blocking

**Implementation**: [lib/security.js](../../lib/security.js)

### Violation Tracking

IPs are tracked for suspicious activity:

```javascript
trackIPViolation(ip, violation)
```

**Violation Types:**
- `FAILED_LOGIN` (5+ failures = block)
- `RATE_LIMIT_EXCEEDED`
- `SQL_INJECTION_ATTEMPT`
- `XSS_ATTEMPT`
- `SUSPICIOUS_REGISTRATION`

### Auto-Block Policy

**Threshold**: 10 violations within 1 hour
**Block Duration**: 24 hours
**Auto-Unblock**: Yes (after 24 hours)

### Manual Blocking

```javascript
import { blockedIPs } from '../../lib/security';

// Block IP
blockedIPs.add('192.168.1.100');

// Unblock IP
blockedIPs.delete('192.168.1.100');
```

---

## Best Practices

### For Developers

#### ✅ Do

- **Always validate input** on the server side
- **Use parameterized queries** (Supabase does this)
- **Sanitize user content** before storage
- **Log security events** with proper severity
- **Use HTTPS** in production
- **Keep dependencies updated**
- **Follow least privilege** principle
- **Review security logs** regularly

#### ❌ Don't

- **Never trust client input**
- **Never expose sensitive data** in errors
- **Never log passwords** or tokens
- **Never disable security features** in production
- **Never hardcode secrets** in code
- **Never use `eval()`** or similar
- **Never skip input validation**

### For Administrators

#### Security Checklist

- [ ] Change default admin password immediately
- [ ] Use strong, unique passwords
- [ ] Enable 2FA (if available)
- [ ] Review user accounts monthly
- [ ] Monitor security logs weekly
- [ ] Update dependencies monthly
- [ ] Run security audits quarterly
- [ ] Test backup restoration annually

### For Users

#### Account Security

- [ ] Use a strong, unique password
- [ ] Don't share your account
- [ ] Log out after use
- [ ] Report suspicious activity
- [ ] Don't click suspicious links
- [ ] Verify URLs before login

---

## Incident Response

### Security Incident Workflow

```
1. Detect
   ↓
2. Contain
   ↓
3. Investigate
   ↓
4. Remediate
   ↓
5. Document
   ↓
6. Post-Mortem
```

### 1. Detect

**Sources:**
- Security logs (`getSecurityEvents()`)
- User reports
- Automated monitoring
- Failed login spikes

### 2. Contain

**Immediate Actions:**
- Block malicious IPs
- Revoke compromised sessions
- Disable affected accounts
- Enable maintenance mode (if needed)

```javascript
// Emergency IP block
blockedIPs.add('attacker-ip');

// Revoke all sessions for user
await supabase
  .from('sessions')
  .delete()
  .eq('admin_id', userId);
```

### 3. Investigate

**Review:**
- Security logs
- Database audit trail
- Supabase logs
- Vercel logs

```javascript
// Get critical events
const criticalEvents = getSecurityEvents(1000, 'critical');
```

### 4. Remediate

**Actions:**
- Patch vulnerabilities
- Update dependencies
- Reset compromised credentials
- Improve security controls

### 5. Document

**Record:**
- Timeline of events
- Actions taken
- Root cause
- Affected users/data
- Lessons learned

### 6. Post-Mortem

**Review:**
- What went wrong?
- What went right?
- How to prevent?
- Security improvements needed

---

## Security Testing

### Manual Testing

#### Test Rate Limiting

```bash
# Test login rate limit (5 attempts per 15 min)
for i in {1..6}; do
  curl -X POST https://yoursite.com/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
done
# 6th request should return 429
```

#### Test CSRF Protection

```bash
# Request without CSRF token (should fail)
curl -X POST https://yoursite.com/api/content \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
# Should return 403
```

#### Test SQL Injection

```bash
# Attempt SQL injection (should be blocked)
curl -X POST https://yoursite.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"test"}'
# Should return 400 or 401, not 500
```

### Automated Testing

#### Security Scanning

```bash
# OWASP ZAP scan
zap-cli quick-scan https://yoursite.com

# Snyk dependency scan
npm install -g snyk
snyk test

# npm audit
npm audit --production
```

---

## Compliance

### GDPR Compliance

✅ **Right to Access**: Users can view their data
✅ **Right to Delete**: Accounts can be deleted
✅ **Data Minimization**: Only collect necessary data
✅ **Consent**: Cookie consent banner
✅ **Security**: Encryption at rest and in transit
✅ **Breach Notification**: Incident response plan

### OWASP Top 10 (2021)

| Risk | Status | Mitigation |
|------|--------|------------|
| A01: Broken Access Control | ✅ Protected | Session validation, role checks |
| A02: Cryptographic Failures | ✅ Protected | bcrypt, HTTPS, secure cookies |
| A03: Injection | ✅ Protected | Input validation, parameterized queries |
| A04: Insecure Design | ✅ Protected | Security by design, defense in depth |
| A05: Security Misconfiguration | ✅ Protected | Secure defaults, security headers |
| A06: Vulnerable Components | ⚠️ Monitor | Regular updates, npm audit |
| A07: Auth Failures | ✅ Protected | Strong passwords, rate limiting |
| A08: Data Integrity | ✅ Protected | Validation, sanitization |
| A09: Logging Failures | ✅ Protected | Security logging, audit trail |
| A10: SSRF | ✅ Protected | No user-controlled URLs |

---

## Resources

### Internal Documentation
- [Rate Limiting Library](../../lib/rateLimit.js)
- [Validation Library](../../lib/validation.js)
- [Security Utilities](../../lib/security.js)
- [Database Layer](../../lib/database.js)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Last Updated**: 2025-10-08
**Security Version**: 2.0.0
**Maintained By**: EVU Security Team
