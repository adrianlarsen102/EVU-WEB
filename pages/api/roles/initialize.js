import { createClient } from '@supabase/supabase-js';
import { ALL_PERMISSIONS } from './index';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Initialize default system roles
 * This endpoint should only be called once during setup
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if roles already exist
    const { data: existingRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      console.error('Error checking roles:', checkError);
      return res.status(500).json({ error: 'Failed to check existing roles' });
    }

    if (existingRoles && existingRoles.length > 0) {
      return res.status(400).json({ error: 'Roles already initialized' });
    }

    // Define default system roles
    const defaultRoles = [
      {
        name: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: Object.keys(ALL_PERMISSIONS),
        is_system: true
      },
      {
        name: 'Moderator',
        description: 'Forum and support moderation with limited admin access',
        permissions: [
          'content.view',
          'users.view',
          'forum.view',
          'forum.post',
          'forum.edit',
          'forum.delete',
          'forum.moderate',
          'support.view',
          'support.create',
          'support.respond',
          'support.manage',
          'dashboard.view'
        ],
        is_system: true
      },
      {
        name: 'Support Agent',
        description: 'Handle support tickets and respond to user inquiries',
        permissions: [
          'support.view',
          'support.create',
          'support.respond',
          'users.view',
          'forum.view',
          'forum.post'
        ],
        is_system: true
      },
      {
        name: 'Content Manager',
        description: 'Manage website content and settings',
        permissions: [
          'content.view',
          'content.edit',
          'forum.view',
          'forum.post',
          'forum.edit',
          'dashboard.view'
        ],
        is_system: true
      },
      {
        name: 'User',
        description: 'Standard user with basic permissions',
        permissions: [
          'forum.view',
          'forum.post',
          'support.view',
          'support.create'
        ],
        is_system: true
      }
    ];

    // Insert default roles
    const { data: insertedRoles, error: insertError } = await supabase
      .from('user_roles')
      .insert(defaultRoles)
      .select();

    if (insertError) {
      console.error('Error inserting roles:', insertError);
      return res.status(500).json({ error: 'Failed to create default roles', details: insertError.message });
    }

    // Get Administrator role ID
    const adminRole = insertedRoles.find(r => r.name === 'Administrator');
    const userRole = insertedRoles.find(r => r.name === 'User');

    if (!adminRole || !userRole) {
      return res.status(500).json({ error: 'Failed to find created roles' });
    }

    // Update existing users to have roles
    // Users with is_admin=true get Administrator role
    await supabase
      .from('admins')
      .update({ role_id: adminRole.id })
      .or('is_admin.eq.true,role.eq.admin');

    // Users with is_admin=false or role='user' get User role
    await supabase
      .from('admins')
      .update({ role_id: userRole.id })
      .or('is_admin.eq.false,role.eq.user')
      .is('role_id', null);

    res.status(200).json({
      success: true,
      message: 'Default roles created successfully',
      roles: insertedRoles,
      migratedUsers: true
    });
  } catch (error) {
    console.error('Role initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize roles', details: error.message });
  }
}
