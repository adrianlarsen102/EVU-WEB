import { getSupabaseClient } from '../../lib/database';
import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { requireCSRFToken } from '../../lib/csrf';
import { rateLimiters } from '../../lib/rateLimit';
import { sanitizeString, sanitizeHTML } from '../../lib/validation';
import { auditLog, AuditEventTypes, AuditSeverity } from '../../lib/auditLog';

const supabase = getSupabaseClient();

export default async function handler(req, res) {
  // GET - Public endpoint for fetching active announcements
  if (req.method === 'GET') {
    // Apply rate limiting for read operations
    const rateLimitResult = await rateLimiters.read(req, res, null);
    if (rateLimitResult !== true) return;

    try {
      const { target = 'all' } = req.query;

      // Use the PostgreSQL function for active announcements
      const { data: announcements, error } = await supabase.rpc(
        'get_active_announcements',
        { target_filter: target }
      );

      if (error) {
        console.error('Error fetching announcements:', error);
        return res.status(500).json({ error: 'Failed to fetch announcements' });
      }

      return res.status(200).json({ announcements: announcements || [] });
    } catch (error) {
      console.error('Announcements fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  }

  // All other methods require authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check admin permission for managing announcements
  const canManageAnnouncements = await hasPermission(session.adminId, 'settings.edit') || session.isAdmin;
  if (!canManageAnnouncements) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to manage announcements'
    });
  }

  // POST - Create new announcement
  if (req.method === 'POST') {
    // CSRF protection
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
    }

    try {
      const { title, message, type, target, startDate, endDate, enabled } = req.body;

      // Validate required fields
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      // Sanitize inputs
      const sanitizedTitle = sanitizeString(title);
      const sanitizedMessage = sanitizeHTML(message);

      // Validate type
      const validTypes = ['info', 'warning', 'error', 'success'];
      const announcementType = validTypes.includes(type) ? type : 'info';

      // Validate target
      const validTargets = ['all', 'minecraft', 'fivem'];
      const announcementTarget = validTargets.includes(target) ? target : 'all';

      // Create announcement
      const { data, error } = await supabase
        .from('announcements')
        .insert([
          {
            title: sanitizedTitle,
            message: sanitizedMessage,
            type: announcementType,
            target: announcementTarget,
            start_date: startDate || null,
            end_date: endDate || null,
            enabled: enabled !== undefined ? enabled : true,
            created_by: session.adminId
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating announcement:', error);
        return res.status(500).json({ error: 'Failed to create announcement' });
      }

      // Audit log
      await auditLog(
        AuditEventTypes.SYSTEM_SETTINGS_UPDATED,
        session.adminId,
        {
          action: 'announcement_created',
          announcementId: data.id,
          title: sanitizedTitle,
          type: announcementType,
          target: announcementTarget
        },
        AuditSeverity.INFO
      );

      return res.status(201).json({ success: true, announcement: data });
    } catch (error) {
      console.error('Announcement creation error:', error);
      return res.status(500).json({ error: 'Failed to create announcement' });
    }
  }

  // PUT - Update announcement
  if (req.method === 'PUT') {
    // CSRF protection
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
    }

    try {
      const { id, title, message, type, target, startDate, endDate, enabled } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Announcement ID is required' });
      }

      // Build update object
      const updates = {};

      if (title !== undefined) {
        updates.title = sanitizeString(title);
      }

      if (message !== undefined) {
        updates.message = sanitizeHTML(message);
      }

      if (type !== undefined) {
        const validTypes = ['info', 'warning', 'error', 'success'];
        updates.type = validTypes.includes(type) ? type : 'info';
      }

      if (target !== undefined) {
        const validTargets = ['all', 'minecraft', 'fivem'];
        updates.target = validTargets.includes(target) ? target : 'all';
      }

      if (startDate !== undefined) updates.start_date = startDate || null;
      if (endDate !== undefined) updates.end_date = endDate || null;
      if (enabled !== undefined) updates.enabled = enabled;

      updates.updated_at = new Date().toISOString();

      // Update announcement
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating announcement:', error);
        return res.status(500).json({ error: 'Failed to update announcement' });
      }

      // Audit log
      await auditLog(
        AuditEventTypes.SYSTEM_SETTINGS_UPDATED,
        session.adminId,
        {
          action: 'announcement_updated',
          announcementId: id,
          updatedFields: Object.keys(updates)
        },
        AuditSeverity.INFO
      );

      return res.status(200).json({ success: true, announcement: data });
    } catch (error) {
      console.error('Announcement update error:', error);
      return res.status(500).json({ error: 'Failed to update announcement' });
    }
  }

  // DELETE - Delete announcement
  if (req.method === 'DELETE') {
    // CSRF protection
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
    }

    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Announcement ID is required' });
      }

      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting announcement:', error);
        return res.status(500).json({ error: 'Failed to delete announcement' });
      }

      // Audit log
      await auditLog(
        AuditEventTypes.SYSTEM_SETTINGS_UPDATED,
        session.adminId,
        { action: 'announcement_deleted', announcementId: id },
        AuditSeverity.INFO
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Announcement deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete announcement' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
