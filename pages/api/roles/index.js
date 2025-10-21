import { createClient } from '@supabase/supabase-js';
import { validateSession, getSessionFromCookie } from '../../../lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Default permissions available in the system
export const ALL_PERMISSIONS = {
  // Content Management
  'content.view': 'View site content',
  'content.edit': 'Edit site content',

  // User Management
  'users.view': 'View user list',
  'users.create': 'Create new users',
  'users.edit': 'Edit user details',
  'users.delete': 'Delete users',

  // Role Management
  'roles.view': 'View roles',
  'roles.create': 'Create new roles',
  'roles.edit': 'Edit existing roles',
  'roles.delete': 'Delete roles',

  // Forum Management
  'forum.view': 'View forum',
  'forum.post': 'Create forum posts',
  'forum.edit': 'Edit forum posts',
  'forum.delete': 'Delete forum posts',
  'forum.moderate': 'Moderate forum (edit/delete any post)',

  // Support Tickets
  'support.view': 'View support tickets',
  'support.create': 'Create support tickets',
  'support.respond': 'Respond to tickets',
  'support.manage': 'Manage all tickets',

  // Dashboard & Analytics
  'dashboard.view': 'View admin dashboard',
  'analytics.view': 'View analytics and metrics',

  // System Settings
  'settings.view': 'View system settings',
  'settings.edit': 'Edit system settings',

  // Email Settings
  'email.view': 'View email settings',
  'email.edit': 'Edit email settings',
  'email.send': 'Send emails'
};

export default async function handler(req, res) {
  // Validate session
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user has role management permission
  const hasRolePermission = await checkPermission(session.adminId, 'roles.view');
  if (!hasRolePermission) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to manage roles' });
  }

  if (req.method === 'GET') {
    // Get all roles
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ error: 'Failed to fetch roles' });
      }

      res.status(200).json({
        roles: roles || [],
        availablePermissions: ALL_PERMISSIONS
      });
    } catch (error) {
      console.error('Roles fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  } else if (req.method === 'POST') {
    // Create new role
    const canCreate = await checkPermission(session.adminId, 'roles.create');
    if (!canCreate) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to create roles' });
    }

    const { name, description, permissions, isSystem } = req.body;

    if (!name || !permissions) {
      return res.status(400).json({ error: 'Name and permissions are required' });
    }

    // Validate permissions
    const invalidPerms = permissions.filter(p => !ALL_PERMISSIONS[p]);
    if (invalidPerms.length > 0) {
      return res.status(400).json({ error: `Invalid permissions: ${invalidPerms.join(', ')}` });
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          name,
          description: description || '',
          permissions,
          is_system: isSystem || false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating role:', error);
        return res.status(500).json({ error: 'Failed to create role' });
      }

      res.status(201).json({ success: true, role: data });
    } catch (error) {
      console.error('Role creation error:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  } else if (req.method === 'PUT') {
    // Update existing role
    const canEdit = await checkPermission(session.adminId, 'roles.edit');
    if (!canEdit) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to edit roles' });
    }

    const { roleId, name, description, permissions } = req.body;

    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    // Check if role is system role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('is_system')
      .eq('id', roleId)
      .single();

    if (existingRole?.is_system) {
      return res.status(400).json({ error: 'Cannot modify system roles' });
    }

    try {
      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (permissions) {
        // Validate permissions
        const invalidPerms = permissions.filter(p => !ALL_PERMISSIONS[p]);
        if (invalidPerms.length > 0) {
          return res.status(400).json({ error: `Invalid permissions: ${invalidPerms.join(', ')}` });
        }
        updates.permissions = permissions;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .update(updates)
        .eq('id', roleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating role:', error);
        return res.status(500).json({ error: 'Failed to update role' });
      }

      res.status(200).json({ success: true, role: data });
    } catch (error) {
      console.error('Role update error:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  } else if (req.method === 'DELETE') {
    // Delete role
    const canDelete = await checkPermission(session.adminId, 'roles.delete');
    if (!canDelete) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to delete roles' });
    }

    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    try {
      // Check if role is system role
      const { data: role } = await supabase
        .from('user_roles')
        .select('is_system, name')
        .eq('id', roleId)
        .single();

      if (role?.is_system) {
        return res.status(400).json({ error: 'Cannot delete system roles' });
      }

      // Check if any users have this role
      const { data: usersWithRole } = await supabase
        .from('admins')
        .select('id')
        .eq('role_id', roleId);

      if (usersWithRole && usersWithRole.length > 0) {
        return res.status(400).json({
          error: `Cannot delete role: ${usersWithRole.length} user(s) are assigned to this role. Please reassign them first.`
        });
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        console.error('Error deleting role:', error);
        return res.status(500).json({ error: 'Failed to delete role' });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Role deletion error:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Helper function to check if user has a specific permission
async function checkPermission(userId, permission) {
  try {
    // Get user's role
    const { data: user } = await supabase
      .from('admins')
      .select('role_id')
      .eq('id', userId)
      .single();

    if (!user || !user.role_id) {
      return false;
    }

    // Get role permissions
    const { data: role } = await supabase
      .from('user_roles')
      .select('permissions')
      .eq('id', user.role_id)
      .single();

    if (!role || !role.permissions) {
      return false;
    }

    return role.permissions.includes(permission);
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}
