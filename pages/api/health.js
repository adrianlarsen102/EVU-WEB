import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Check environment variables
  health.checks.env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    status: (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) ? 'ok' : 'error'
  };

  // Check database connection
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data, error } = await supabase
        .from('site_content')
        .select('id')
        .limit(1);

      health.checks.database = {
        status: error ? 'error' : 'ok',
        connected: !error,
        error: error ? error.message : undefined
      };

      if (error) {
        health.status = 'degraded';
      }
    } catch {
      health.checks.database = {
        status: 'error',
        connected: false,
        error: error.message
      };
      health.status = 'degraded';
    }
  } else {
    health.checks.database = {
      status: 'error',
      connected: false,
      error: 'Environment variables not configured'
    };
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 503 : 500;
  return res.status(statusCode).json(health);
}
