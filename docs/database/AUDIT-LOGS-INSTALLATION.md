# Audit Logs Installation Guide

## Quick Installation

### Step 1: Run SQL in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire contents of `audit-logs-setup.sql`
5. Click **Run** or press `Ctrl+Enter`

### Step 2: Verify Installation

After running the SQL, you should see:
```
status: "Audit logs table created successfully!"
initial_entries: 1
```

### Step 3: Test Audit Logging

Create a test log entry:
```sql
INSERT INTO audit_logs (event_type, user_id, metadata, severity)
VALUES (
  'TEST_EVENT',
  '1',
  '{"test": true, "environment": "development"}'::jsonb,
  'info'
);

-- View the log
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 5;
```

## What Gets Created

✅ **Table:** `audit_logs`
- Stores all administrative actions
- Immutable (cannot be updated or deleted by users)
- Automatic timestamps

✅ **Indexes:** 6 indexes for optimal query performance
- event_type
- user_id
- severity
- timestamp (descending)
- created_at (descending)
- composite user_id + timestamp

✅ **RLS Policies:**
- Service role can read and insert
- No one can update or delete (immutable audit trail)

✅ **Cleanup Function:** `cleanup_old_audit_logs(retention_days)`
- Deletes logs older than specified days (default 90)
- Run manually or schedule via cron

## Verification Queries

### Check table structure
```sql
\d audit_logs
```

### View all columns
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;
```

### Check indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'audit_logs';
```

### View RLS policies
```sql
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'audit_logs';
```

## Testing Audit Logs in Your App

Once installed, audit logs will automatically start recording:

### User Management Events
```javascript
// Creating a user triggers audit log
POST /api/users
{
  "username": "testuser",
  "password": "SecurePass123!",
  "role": "user"
}

// Check the log
SELECT * FROM audit_logs
WHERE event_type = 'USER_CREATED'
ORDER BY timestamp DESC
LIMIT 1;
```

### Content Updates
```javascript
// Updating site content triggers audit log
POST /api/content
{
  "servers": { ... }
}

// Check the log
SELECT * FROM audit_logs
WHERE event_type = 'CONTENT_UPDATED'
ORDER BY timestamp DESC
LIMIT 1;
```

## Cleanup Old Logs

### Manual Cleanup
```sql
-- Delete logs older than 90 days
SELECT cleanup_old_audit_logs(90);

-- Delete logs older than 30 days
SELECT cleanup_old_audit_logs(30);
```

### Scheduled Cleanup (Optional)
If you have pg_cron enabled:
```sql
-- Run cleanup monthly
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 0 1 * *',
  'SELECT cleanup_old_audit_logs(90)'
);
```

## Viewing Audit Logs

### Recent activity
```sql
SELECT
  event_type,
  user_id,
  severity,
  metadata,
  timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 20;
```

### By user
```sql
SELECT
  event_type,
  metadata,
  timestamp
FROM audit_logs
WHERE user_id = '1'  -- Replace with your user ID
ORDER BY timestamp DESC;
```

### By event type
```sql
SELECT
  user_id,
  metadata,
  timestamp
FROM audit_logs
WHERE event_type = 'USER_DELETED'
ORDER BY timestamp DESC;
```

### By severity
```sql
SELECT
  event_type,
  user_id,
  metadata,
  timestamp
FROM audit_logs
WHERE severity IN ('error', 'critical')
ORDER BY timestamp DESC;
```

### Today's activity
```sql
SELECT
  event_type,
  COUNT(*) as count
FROM audit_logs
WHERE timestamp >= CURRENT_DATE
GROUP BY event_type
ORDER BY count DESC;
```

## Troubleshooting

### Error: "relation 'audit_logs' does not exist"
**Solution:** Run the SQL setup script in Supabase SQL Editor

### Error: "permission denied for table audit_logs"
**Solution:** Make sure you're using the service role key in your API (SUPABASE_SERVICE_ROLE_KEY)

### No logs appearing
**Check:**
1. SQL script ran successfully
2. Service role key is correct in `.env.local`
3. Code is calling `auditLog()` function
4. Check console for any errors

### View function to debug
```sql
-- Check if audit logging is working
SELECT
  'Total logs' as metric,
  COUNT(*) as value
FROM audit_logs
UNION ALL
SELECT
  'Logs today',
  COUNT(*)
FROM audit_logs
WHERE timestamp >= CURRENT_DATE;
```

## Event Types Reference

All available event types are defined in `lib/auditLog.js`:

**Authentication:**
- LOGIN_SUCCESS
- LOGIN_FAILURE
- LOGOUT
- PASSWORD_CHANGED

**User Management:**
- USER_CREATED
- USER_DELETED
- USER_UPDATED
- USER_ROLE_CHANGED

**Content Management:**
- CONTENT_UPDATED
- CONTENT_DELETED

**Forum Moderation:**
- TOPIC_DELETED
- COMMENT_DELETED
- TOPIC_LOCKED

**Settings:**
- EMAIL_SETTINGS_UPDATED
- SYSTEM_SETTINGS_UPDATED

**Roles & Permissions:**
- ROLE_CREATED
- ROLE_UPDATED
- ROLE_DELETED

**Security Events:**
- UNAUTHORIZED_ACCESS_ATTEMPT
- CSRF_TOKEN_INVALID
- RATE_LIMIT_EXCEEDED

**Support:**
- TICKET_STATUS_CHANGED
- TICKET_DELETED

## Data Retention

Default retention: **90 days**

To change:
```sql
-- Keep logs for 180 days
SELECT cleanup_old_audit_logs(180);
```

For compliance requirements (GDPR, HIPAA, etc.), adjust retention period accordingly.

## Security Notes

✅ **Immutable Logs** - Cannot be modified after creation
✅ **RLS Protected** - Only service role can access
✅ **Timestamped** - Automatic UTC timestamps
✅ **IP Tracking** - Records originating IP address
✅ **User Agent** - Captures browser/client information

## Support

If you encounter issues:
1. Check Supabase logs
2. Verify service role key
3. Test with manual INSERT
4. Check RLS policies

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
