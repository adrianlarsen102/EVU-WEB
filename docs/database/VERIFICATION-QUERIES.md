# Audit Logs Verification Queries

Run these queries in Supabase SQL Editor to verify everything is working correctly.

## ✅ Step 1: Verify Table Structure

```sql
-- Check all columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;
```

**Expected columns:**
- id (bigint)
- event_type (text)
- user_id (text)
- metadata (jsonb)
- severity (text)
- ip_address (text)
- user_agent (text)
- timestamp (timestamp with time zone)
- created_at (timestamp with time zone)

## ✅ Step 2: Verify Indexes

```sql
-- Check all indexes are created
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'audit_logs'
ORDER BY indexname;
```

**Expected 7 indexes:**
1. audit_logs_pkey (PRIMARY KEY)
2. idx_audit_logs_created_at
3. idx_audit_logs_event_type
4. idx_audit_logs_severity
5. idx_audit_logs_timestamp
6. idx_audit_logs_user_id
7. idx_audit_logs_user_timestamp

## ✅ Step 3: Verify RLS Policies

```sql
-- Check RLS policies
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'audit_logs'
ORDER BY policyname;
```

**Expected 4 policies:**
1. "Audit logs are immutable" (UPDATE)
2. "Audit logs cannot be deleted by users" (DELETE)
3. "Service role can insert audit logs" (INSERT)
4. "Service role can view audit logs" (SELECT)

## ✅ Step 4: Verify Initial Entry

```sql
-- Check the initial log entry was created
SELECT
  event_type,
  user_id,
  metadata,
  severity,
  timestamp
FROM audit_logs
WHERE event_type = 'SYSTEM_INITIALIZED'
ORDER BY timestamp DESC
LIMIT 1;
```

**Expected result:**
- event_type: SYSTEM_INITIALIZED
- user_id: NULL
- metadata: {"table": "audit_logs", "action": "created"}
- severity: info
- timestamp: (current timestamp)

## ✅ Step 5: Test Insert Permissions

```sql
-- Test inserting a new audit log
INSERT INTO audit_logs (event_type, user_id, metadata, severity, ip_address)
VALUES (
  'TEST_EVENT',
  '1',
  '{"test": true, "source": "verification"}'::jsonb,
  'info',
  '127.0.0.1'
);

-- Verify it was inserted
SELECT * FROM audit_logs
WHERE event_type = 'TEST_EVENT'
ORDER BY timestamp DESC
LIMIT 1;
```

**Expected:** Row inserted successfully

## ✅ Step 6: Test Immutability (Should Fail)

```sql
-- Try to update an audit log (should fail due to RLS)
UPDATE audit_logs
SET metadata = '{"modified": true}'::jsonb
WHERE event_type = 'TEST_EVENT';
```

**Expected:** Error or 0 rows affected (immutability enforced)

## ✅ Step 7: Test Delete Protection (Should Fail)

```sql
-- Try to delete an audit log (should fail due to RLS)
DELETE FROM audit_logs
WHERE event_type = 'TEST_EVENT';
```

**Expected:** Error or 0 rows affected (delete protection enforced)

## ✅ Step 8: Test Cleanup Function

```sql
-- Test the cleanup function (won't delete recent logs)
SELECT cleanup_old_audit_logs(90);
```

**Expected:** Returns 0 (no logs older than 90 days)

## ✅ Step 9: View All Current Logs

```sql
-- See all audit logs created so far
SELECT
  id,
  event_type,
  user_id,
  severity,
  timestamp,
  metadata
FROM audit_logs
ORDER BY timestamp DESC;
```

## ✅ Step 10: Check Statistics

```sql
-- Get statistics about audit logs
SELECT
  COUNT(*) as total_logs,
  COUNT(DISTINCT event_type) as unique_event_types,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(timestamp) as oldest_log,
  MAX(timestamp) as newest_log
FROM audit_logs;
```

## 🧹 Cleanup Test Data (Optional)

If you want to remove the test entries:

```sql
-- Remove test entries (use cleanup function with SECURITY DEFINER)
-- Note: This won't work via normal DELETE due to RLS
-- You'll need to use the cleanup function or drop/recreate table

-- Option 1: Keep only last 0 days (deletes everything)
SELECT cleanup_old_audit_logs(0);

-- Then re-insert the initial entry
INSERT INTO audit_logs (event_type, user_id, metadata, severity, timestamp)
VALUES (
  'SYSTEM_INITIALIZED',
  NULL,
  '{"table": "audit_logs", "action": "created"}'::jsonb,
  'info',
  NOW()
);
```

---

## ✅ All Checks Passed?

If all queries above work as expected, your audit logging system is **fully operational**! 🎉

Next steps:
1. Deploy your updated code to Vercel
2. Test creating a user or updating content
3. Check audit_logs table to see the events being logged
4. Set up CRON_SECRET and CSRF_SECRET environment variables

---

**Created:** 2025-10-24
**Status:** Ready for Production
