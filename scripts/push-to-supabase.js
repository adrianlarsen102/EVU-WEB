/**
 * Automatically Push SQL Migrations to Supabase
 *
 * This script executes SQL files directly on your Supabase database
 * using the Supabase REST API.
 *
 * Usage: node scripts/push-to-supabase.js [migration-file.sql]
 * Example: node scripts/push-to-supabase.js scripts/create-error-logs-table.sql
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

/**
 * Execute SQL on Supabase using REST API
 */
async function executeSQLOnSupabase(sql) {
  try {
    // Supabase uses PostgreSQL's REST API via PostgREST
    // We need to use the /rest/v1/rpc endpoint or direct SQL execution

    // Method: Use Supabase's REST API to execute raw SQL
    // This requires the SQL to be sent as a function call

    console.log('🚀 Executing SQL on Supabase...\n');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();

      // Skip comments and empty statements
      if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      console.log(`[${i + 1}/${statements.length}] Executing...`);

      try {
        // Use Supabase's query endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            query: statement + ';'
          })
        });

        if (response.ok) {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        } else {
          const errorText = await response.text();

          // Check if it's a "already exists" error (acceptable)
          if (errorText.includes('already exists') || errorText.includes('duplicate')) {
            console.log(`⚠️  Statement ${i + 1}: Resource already exists (OK)`);
            successCount++;
          } else {
            console.error(`❌ Statement ${i + 1} failed: ${response.status}`);
            console.error(`   ${errorText}`);
            errors.push({ statement: i + 1, error: errorText });
            errorCount++;
          }
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} exception: ${err.message}`);
        errors.push({ statement: i + 1, error: err.message });
        errorCount++;
      }

      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '═'.repeat(70));
    console.log('📊 Execution Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('═'.repeat(70));

    if (errorCount > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(({ statement, error }) => {
        console.log(`   Statement ${statement}: ${error}`);
      });
      console.log('\n💡 Note: If the error is "function exec does not exist", you need to:');
      console.log('   1. Use the Supabase Dashboard SQL Editor for this migration, OR');
      console.log('   2. Use the Supabase CLI: supabase db push');
      return false;
    }

    console.log('\n🎉 All migrations applied successfully!\n');
    return true;

  } catch (err) {
    console.error('❌ Error executing SQL:');
    console.error(err.message);
    return false;
  }
}

/**
 * Alternative: Execute using pg library (if available)
 */
async function executeSQLDirectly(sql) {
  console.log('🔄 Attempting direct PostgreSQL execution...\n');

  try {
    // Extract connection details from Supabase URL
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];

    if (!projectRef) {
      throw new Error('Could not extract project reference from Supabase URL');
    }

    // Connection string format for Supabase
    const connectionString = `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;

    console.log('📡 Connecting to Supabase PostgreSQL...');

    // Try using node-postgres if available
    const pg = await import('pg').catch(() => null);

    if (!pg) {
      console.log('⚠️  pg library not installed. Install with: npm install pg');
      console.log('   Falling back to REST API method...\n');
      return await executeSQLOnSupabase(sql);
    }

    const { Client } = pg.default || pg;
    const client = new Client({ connectionString });

    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Execute SQL
    await client.query(sql);
    console.log('✅ SQL executed successfully!\n');

    await client.end();
    return true;

  } catch (err) {
    console.log(`⚠️  Direct connection failed: ${err.message}`);
    console.log('   Falling back to REST API method...\n');
    return await executeSQLOnSupabase(sql);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\n🚀 Supabase Auto-Migration Tool\n');
    console.log('Usage: node scripts/push-to-supabase.js <migration-file.sql>\n');
    console.log('Available migrations:');
    console.log('  • scripts/create-error-logs-table.sql - Error logging system\n');
    console.log('Example:');
    console.log('  node scripts/push-to-supabase.js scripts/create-error-logs-table.sql\n');
    console.log('Or use npm script:');
    console.log('  npm run db:push scripts/create-error-logs-table.sql\n');
    process.exit(1);
  }

  const sqlFile = resolve(__dirname, '..', args[0]);

  console.log('\n🔧 Supabase Auto-Migration Tool');
  console.log('═'.repeat(70));
  console.log(`📍 Project: ${supabaseUrl}`);
  console.log(`📁 SQL File: ${sqlFile}`);
  console.log('═'.repeat(70) + '\n');

  if (!existsSync(sqlFile)) {
    console.error('❌ Error: SQL file not found!');
    console.error(`   File: ${sqlFile}`);
    process.exit(1);
  }

  const sql = readFileSync(sqlFile, 'utf-8');

  console.log('📄 SQL Migration Preview:');
  console.log('─'.repeat(70));
  console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
  console.log('─'.repeat(70) + '\n');

  // Try direct execution first, fallback to REST API
  const success = await executeSQLDirectly(sql);

  if (!success) {
    console.log('\n❌ Auto-migration failed. Please use manual method:');
    console.log('   npm run db:migrate scripts/create-error-logs-table.sql\n');
    process.exit(1);
  }
}

main();
