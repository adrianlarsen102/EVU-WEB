-- Drop all tables in the public schema without dropping the schema itself
-- This preserves Supabase's default schema permissions

DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
    
    -- Drop all sequences
    FOR r IN (SELECT relname FROM pg_class WHERE relkind = 'S' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP 
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.relname) || ' CASCADE'; 
    END LOOP;

    -- Drop all custom functions in the public schema
    FOR r IN (
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;

    RAISE NOTICE 'All tables, sequences, and functions dropped successfully!';
END $$;

-- Notify PostgREST to reload the schema cache so it forgets the old tables
NOTIFY pgrst, 'reload schema';
