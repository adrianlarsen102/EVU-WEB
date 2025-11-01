/**
 * Migration Helper Script
 *
 * This script displays SQL migrations and provides instructions for applying them to Supabase.
 *
 * Usage: node scripts/apply-migrations.js [migration-file.sql]
 * Example: node scripts/apply-migrations.js scripts/create-error-logs-table.sql
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

/**
 * Display SQL file contents and instructions
 */
function displayMigration(filePath) {
  try {
    console.log('\n🔧 Supabase Migration Helper');
    console.log('═'.repeat(70));
    console.log(`📁 Migration File: ${filePath}`);
    console.log(`📍 Supabase Project: ${supabaseUrl || 'Not configured'}`);
    console.log('═'.repeat(70));

    if (!existsSync(filePath)) {
      console.error('\n❌ Error: SQL file not found!');
      console.error(`   File: ${filePath}`);
      process.exit(1);
    }

    const sql = readFileSync(filePath, 'utf-8');

    console.log('\n📄 SQL Migration Content:');
    console.log('─'.repeat(70));
    console.log(sql);
    console.log('─'.repeat(70));

    console.log('\n📋 How to Apply This Migration:\n');
    console.log('  Method 1: Supabase Dashboard (Easiest)');
    console.log('  ─────────────────────────────────────');
    console.log('  1. Go to your Supabase Dashboard');
    console.log('  2. Navigate to "SQL Editor" in the left sidebar');
    console.log('  3. Create a new query');
    console.log('  4. Copy the SQL above and paste it');
    console.log('  5. Click "Run" to execute\n');

    console.log('  Method 2: Supabase CLI');
    console.log('  ──────────────────────');
    console.log('  1. Install CLI: npm install -g supabase');
    console.log('  2. Login: supabase login');
    console.log('  3. Link project: supabase link --project-ref <your-ref>');
    console.log('  4. Run: supabase db push --include-all\n');

    if (supabaseUrl) {
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];
      if (projectRef) {
        console.log('  🔗 Quick Links:');
        console.log(`     Dashboard: https://supabase.com/dashboard/project/${projectRef}`);
        console.log(`     SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
      }
    }

    console.log('═'.repeat(70));
    console.log('✅ Migration file ready to apply!\n');

  } catch (err) {
    console.error('❌ Error reading migration file:');
    console.error(err.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('\n📚 Supabase Migration Helper\n');
    console.log('Usage: node scripts/apply-migrations.js <migration-file.sql>\n');
    console.log('Available migrations:');
    console.log('  • scripts/create-error-logs-table.sql - Error logging system\n');
    console.log('Example:');
    console.log('  node scripts/apply-migrations.js scripts/create-error-logs-table.sql\n');
    process.exit(1);
  }

  const sqlFile = resolve(__dirname, '..', args[0]);
  displayMigration(sqlFile);
}

main();
