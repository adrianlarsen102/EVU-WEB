# Database Migration Scripts

This directory contains scripts for managing SQL migrations to your Supabase database.

## 📚 Available Commands

### 1. **Automatic Push** (Recommended) ⚡
Automatically pushes SQL migrations directly to your Supabase database.

```bash
npm run db:push scripts/create-error-logs-table.sql
```

**Requirements:**
- Add `SUPABASE_DB_PASSWORD` to your `.env.local` file
- Find your database password in: Supabase Dashboard → Project Settings → Database → Connection Info

**Pros:**
- ✅ Fully automatic
- ✅ No manual copy/paste needed
- ✅ Runs all statements in order
- ✅ Shows detailed progress

---

### 2. **Manual Migration Helper**
Displays SQL content and provides instructions for manual execution.

```bash
npm run db:migrate scripts/create-error-logs-table.sql
```

**Use this when:**
- You don't have direct database access
- You prefer to review SQL before execution
- The automatic push fails

**Output:**
- Shows the complete SQL
- Provides step-by-step instructions
- Includes direct links to Supabase Dashboard

---

## 🗂️ Available Migrations

### Error Logging System
```bash
npm run db:push scripts/create-error-logs-table.sql
```

**What it creates:**
- `error_logs` table with error tracking
- Indexes for performance
- Row-Level Security policies
- Comments for documentation

---

## 🔧 Setup Instructions

### Step 1: Add Database Password to `.env.local`

```env
# Find this in: Supabase Dashboard > Project Settings > Database > Connection Info
SUPABASE_DB_PASSWORD=your-database-password-here
```

### Step 2: Run the migration

```bash
npm run db:push scripts/create-error-logs-table.sql
```

### Step 3: Verify in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Table Editor**
3. Check if `error_logs` table exists

---

## 🛠️ Creating New Migrations

1. Create a new `.sql` file in the `scripts/` directory:
   ```sql
   -- scripts/create-my-new-table.sql
   CREATE TABLE IF NOT EXISTS my_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. Run it:
   ```bash
   npm run db:push scripts/create-my-new-table.sql
   ```

---

## ⚠️ Troubleshooting

### "pg library not installed"
The script will fall back to REST API method automatically. No action needed.

### "Connection failed"
Make sure your `SUPABASE_DB_PASSWORD` is correct in `.env.local`.

### "Already exists" errors
These are safe to ignore - it means the resource is already in your database.

### Automatic push not working?
Use the manual method:
```bash
npm run db:migrate scripts/create-error-logs-table.sql
```
Then copy/paste the SQL into Supabase Dashboard.

---

## 📖 Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
