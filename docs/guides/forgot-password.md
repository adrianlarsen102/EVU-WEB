# Forgot Password Feature

Complete password reset functionality with email tokens.

## Overview

Users can reset their password if they forget it by receiving a secure reset link via email.

## User Flow

1. User clicks "Forgot your password?" on login page
2. User enters their email address
3. System sends reset link to email (if account exists)
4. User clicks link in email
5. User enters new password
6. Password is reset and user can log in

## Security Features

✅ **Token Hashing**: Tokens are SHA256 hashed before storage
✅ **Time-Limited**: Reset links expire after 1 hour
✅ **Single-Use**: Tokens can only be used once
✅ **No User Enumeration**: Same response whether email exists or not
✅ **Rate Limiting**: 3 requests per hour per IP
✅ **Strong Password Validation**: Enforces password strength requirements
✅ **Session Invalidation**: All sessions invalidated after password reset

## Database Setup

Run the SQL migration to create the `password_reset_tokens` table:

```sql
-- See docs/database/password-reset-tokens-table.sql
```

Or use the Supabase dashboard:
1. Go to SQL Editor
2. Run the migration file
3. Verify table was created in Tables view

## Email Configuration

Ensure email settings are configured in Admin Panel:

1. Go to `/admin`
2. Click "Email Settings" tab
3. Configure either:
   - **Resend** (recommended): Add API key
   - **SMTP**: Configure host, port, credentials
4. Test email functionality

## Environment Variables

Required for production:

```env
# Base URL for reset links
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Email configuration (in admin panel or env)
RESEND_API_KEY=re_xxxxx (if using Resend)
```

## API Endpoints

### Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** (always 200 to prevent enumeration):
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully..."
}
```

## Pages

- `/forgot-password` - Request reset link
- `/reset-password?token=xxx` - Set new password

## Email Template

The password reset email includes:
- User's username
- Clickable reset button
- Plain text link (for email clients that don't support HTML)
- Expiry time (1 hour)
- Security notice

## Security Best Practices

1. **Never reveal** if an email exists in the system
2. **Always use HTTPS** in production (reset links contain tokens)
3. **Monitor** failed reset attempts for suspicious activity
4. **Clean up** expired tokens periodically
5. **Rate limit** reset requests aggressively
6. **Log** all password reset events to audit log

## Maintenance

### Clean Up Expired Tokens

Run periodically (e.g., daily cron job):

```sql
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() - INTERVAL '24 hours';
```

Or use Supabase edge function for automatic cleanup.

### Monitor Reset Activity

Check audit logs for suspicious patterns:

```sql
SELECT * FROM audit_logs
WHERE event_type IN ('PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED')
ORDER BY timestamp DESC
LIMIT 100;
```

## Troubleshooting

### Emails Not Sending

1. Check email configuration in admin panel
2. Test email using "Send Test Email" button
3. Verify API keys/SMTP credentials
4. Check spam folder
5. Review server logs for errors

### Reset Link Not Working

1. Check if token has expired (1 hour limit)
2. Verify token hasn't been used already
3. Ensure database table exists
4. Check browser console for errors

### Token Expired Immediately

1. Verify server time is correct
2. Check timezone configuration
3. Ensure database timestamp functions work

## Code Files

- `pages/api/auth/forgot-password.js` - Request reset
- `pages/api/auth/reset-password.js` - Reset password
- `pages/forgot-password.js` - Request UI
- `pages/reset-password.js` - Reset UI
- `docs/database/password-reset-tokens-table.sql` - Database schema

## Future Enhancements

- [ ] Add 2FA recovery codes
- [ ] SMS password reset option
- [ ] Security questions fallback
- [ ] Admin notification of password resets
- [ ] Reset attempt tracking and alerts
