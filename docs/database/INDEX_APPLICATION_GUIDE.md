# Database Index Application Guide

**Purpose**: Step-by-step guide to apply performance indexes to your Supabase database
**File**: `add-performance-indexes.sql`
**Version**: 2.14.0 (Fixed)

---

## 🔧 Quick Start

### Option 1: Apply All Indexes at Once

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Paste SQL**
   - Open `docs/database/add-performance-indexes.sql`
   - Copy ALL contents
   - Paste into SQL Editor

4. **Run Query**
   - Click "Run" button
   - Wait for completion (30-60 seconds)

5. **Verify Success**
   ```sql
   SELECT
     schemaname,
     tablename,
     indexname,
     indexdef
   FROM pg_indexes
   WHERE schemaname = 'public'
   AND indexname LIKE 'idx_%'
   ORDER BY tablename, indexname;
   ```

---

## 📋 What Gets Created

### High Priority Indexes (10)
✅ Sessions expiry and admin lookups
✅ Admin role and username lookups
✅ Forum topics by category and author
✅ Forum comments by topic and author
✅ Support tickets by user, status, priority
✅ Support replies by ticket

### Medium Priority Indexes (8)
✅ Timestamp-based sorting (created_at, updated_at)
✅ Forum pinned topics
✅ Platform metrics time-series

### Composite Indexes (4)
✅ Forum topics category + status
✅ Support tickets user + status
✅ Support tickets status + priority
✅ Sessions admin + expiry

### Full-Text Search Indexes (5)
✅ Forum topics title search
✅ Forum topics content search
✅ Forum comments content search
✅ Support tickets subject search
✅ Admins name search

**Total: 30+ indexes**

---

## ⚠️ Fixed Issues

### Error: column "user_id" does not exist

**Problem**: Original SQL used `user_id` but actual schema uses `author_id`

**Fixed Lines**:
```sql
-- Before (WRONG):
CREATE INDEX idx_forum_topics_user_id ON forum_topics(user_id);
CREATE INDEX idx_forum_comments_user_id ON forum_comments(user_id);

-- After (CORRECT):
CREATE INDEX idx_forum_topics_author_id ON forum_topics(author_id);
CREATE INDEX idx_forum_comments_author_id ON forum_comments(author_id);
```

**Status**: ✅ Fixed in current version

---

## 🧪 Testing Index Performance

### Before Applying Indexes

Run these queries and note the execution time:

```sql
-- Test 1: Dashboard user stats
EXPLAIN ANALYZE
SELECT COUNT(*) FROM admins WHERE role_id IS NOT NULL;

-- Test 2: Forum topic listing
EXPLAIN ANALYZE
SELECT * FROM forum_topics
WHERE category_id = 1
ORDER BY is_pinned DESC, created_at DESC
LIMIT 20;

-- Test 3: Active sessions
EXPLAIN ANALYZE
SELECT COUNT(*) FROM sessions WHERE expires_at > NOW();

-- Test 4: Open support tickets
EXPLAIN ANALYZE
SELECT COUNT(*) FROM support_tickets WHERE status = 'open';
```

### After Applying Indexes

Run the same queries - you should see:
- ✅ "Index Scan" instead of "Seq Scan"
- ✅ 50-90% reduction in execution time
- ✅ Lower "cost" values

---

## 📊 Monitor Index Usage

### Check Which Indexes Are Being Used

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as rows_read,
  idx_tup_fetch as rows_returned
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

### Find Unused Indexes (after 1 week)

```sql
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 🗑️ Rollback (if needed)

If you need to remove all indexes:

```sql
-- WARNING: This removes ALL custom indexes
-- Only run if you need to start over

DROP INDEX IF EXISTS idx_sessions_expires_at;
DROP INDEX IF EXISTS idx_sessions_admin_id;
DROP INDEX IF EXISTS idx_admins_role_id;
DROP INDEX IF EXISTS idx_admins_username;
DROP INDEX IF EXISTS idx_forum_topics_category_id;
DROP INDEX IF EXISTS idx_forum_topics_author_id;
DROP INDEX IF EXISTS idx_forum_comments_topic_id;
DROP INDEX IF EXISTS idx_forum_comments_author_id;
DROP INDEX IF EXISTS idx_support_tickets_user_id;
DROP INDEX IF EXISTS idx_support_tickets_status;
DROP INDEX IF EXISTS idx_support_tickets_priority;
DROP INDEX IF EXISTS idx_support_replies_ticket_id;
DROP INDEX IF EXISTS idx_admins_created_at;
DROP INDEX IF EXISTS idx_forum_topics_created_at;
DROP INDEX IF EXISTS idx_forum_topics_updated_at;
DROP INDEX IF EXISTS idx_forum_topics_pinned;
DROP INDEX IF EXISTS idx_forum_comments_created_at;
DROP INDEX IF EXISTS idx_support_tickets_created_at;
DROP INDEX IF EXISTS idx_support_tickets_updated_at;
DROP INDEX IF EXISTS idx_platform_metrics_recorded_at;
DROP INDEX IF EXISTS idx_forum_topics_category_status;
DROP INDEX IF EXISTS idx_support_tickets_user_status;
DROP INDEX IF EXISTS idx_support_tickets_status_priority;
DROP INDEX IF EXISTS idx_sessions_admin_expires;
DROP INDEX IF EXISTS idx_forum_topics_title_search;
DROP INDEX IF EXISTS idx_forum_topics_content_search;
DROP INDEX IF EXISTS idx_forum_comments_content_search;
DROP INDEX IF EXISTS idx_support_tickets_subject_search;
DROP INDEX IF EXISTS idx_admins_name_search;
```

---

## 📈 Expected Performance Improvements

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Dashboard load | 1000ms | 250ms | 75% faster |
| Forum page load | 2000ms | 300ms | 85% faster |
| Session validation | 150ms | 10ms | 93% faster |
| Search queries | 500ms | 50ms | 90% faster |

---

## ✅ Verification Checklist

After applying indexes:

- [ ] All 30+ indexes created successfully
- [ ] No error messages in SQL output
- [ ] `ANALYZE` command completed for all tables
- [ ] Test queries show "Index Scan" in EXPLAIN
- [ ] Dashboard API response time improved
- [ ] Forum page loads faster
- [ ] No application errors after deployment

---

## 🆘 Troubleshooting

### Error: "relation does not exist"

**Problem**: Table hasn't been created yet

**Solution**:
1. Check if the table exists: `SELECT * FROM your_table LIMIT 1;`
2. If missing, run the appropriate schema file first:
   - Forum: `docs/database/forum-schema-fixed.sql`
   - Support: Run support ticket schema
   - Metrics: Run metrics schema

### Error: "permission denied"

**Problem**: Insufficient database permissions

**Solution**:
- Use Supabase SQL Editor (has admin rights)
- Or grant permissions: `GRANT ALL ON ALL TABLES IN SCHEMA public TO your_role;`

### Indexes Not Being Used

**Problem**: Query planner not using indexes

**Solutions**:
1. Run `ANALYZE table_name;` to update statistics
2. Check query structure matches index columns
3. Wait - PostgreSQL may need time to learn usage patterns
4. For small tables (<1000 rows), sequential scans are often faster

---

## 📝 Maintenance

### Weekly

```sql
-- Update table statistics
ANALYZE admins;
ANALYZE sessions;
ANALYZE forum_topics;
ANALYZE forum_comments;
ANALYZE support_tickets;
```

### Monthly

```sql
-- Vacuum and analyze (cleanup + statistics)
VACUUM ANALYZE admins;
VACUUM ANALYZE sessions;
VACUUM ANALYZE forum_topics;
VACUUM ANALYZE forum_comments;
VACUUM ANALYZE support_tickets;
```

### Monitor Disk Space

```sql
-- Check index sizes
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 🎯 Next Steps

1. ✅ Apply indexes using this guide
2. ✅ Verify with test queries
3. ✅ Monitor performance improvements
4. ✅ Check index usage after 1 week
5. ✅ Run weekly `ANALYZE` maintenance

**Questions?** Check the [Performance Audit Report](../reports/performance-audit.md)

---

**Last Updated**: 2025-10-23
**Status**: Ready for production use
