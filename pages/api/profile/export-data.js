import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', session.adminId)
      .single();

    if (userError) throw userError;

    // Get user sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('admin_id', session.adminId);

    if (sessionsError) throw sessionsError;

    // Remove sensitive data
    const userData = {
      ...user,
      password_hash: '[REDACTED FOR SECURITY]'
    };

    // Prepare export data
    const exportData = {
      export_date: new Date().toISOString(),
      export_type: 'GDPR Data Request',
      user_information: {
        id: userData.id,
        username: userData.username,
        email: userData.email || null,
        display_name: userData.display_name || null,
        bio: userData.bio || null,
        avatar_url: userData.avatar_url || null,
        role: userData.role || (userData.is_admin ? 'admin' : 'user'),
        is_admin: userData.is_admin,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        is_default_password: userData.is_default_password
      },
      active_sessions: sessions.map(s => ({
        session_id: s.id,
        created_at: s.created_at,
        expires_at: s.expires_at
      })),
      data_usage: {
        purpose: 'User authentication and profile management',
        legal_basis: 'Consent (GDPR Article 6.1.a)',
        retention_policy: 'Data retained until account deletion',
        third_party_sharing: 'None - data stored in Supabase (EU/US)'
      },
      your_rights: {
        right_to_access: 'You are currently exercising this right',
        right_to_rectification: 'You can update your profile at /profile',
        right_to_erasure: 'You can delete your account at /profile',
        right_to_data_portability: 'This export provides your data in JSON format',
        right_to_object: 'Contact administrator to object to processing',
        right_to_withdraw_consent: 'Delete your account to withdraw consent'
      }
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="my-data-${user.username}-${new Date().toISOString().split('T')[0]}.json"`);

    res.status(200).json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
}
