import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { getSupabaseClient } from '../../lib/database';
import { requireCSRFToken } from '../../lib/csrf';
import { hasPermission } from '../../lib/permissions';
import { auditLog, AuditEventTypes, AuditSeverity } from '../../lib/auditLog';
import { sanitizeString } from '../../lib/validation';

const supabase = getSupabaseClient();

/**
 * GET /api/statusio-settings
 * Fetch Status.io integration settings
 */
async function handleGet(req, res, session) {
  // Check permission
  if (!hasPermission(session.permissions, 'settings.view')) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  try {
    const { data, error } = await supabase
      .from('statusio_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Status.io settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    // Return default settings if none exist
    const settings = data || {
      id: 1,
      enabled: false,
      api_id: '',
      api_key: '',
      statuspage_id: '',
      component_mapping: {},
      auto_report_outages: true,
      auto_report_maintenance: false,
      notify_subscribers_on_outage: true,
      notify_subscribers_on_recovery: true,
      outage_threshold_minutes: 5
    };

    // Don't send API key to client (security)
    const safeSettings = { ...settings };
    if (safeSettings.api_key) {
      safeSettings.api_key = '••••••••';
    }

    res.status(200).json(safeSettings);
  } catch (error) {
    console.error('Status.io settings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/statusio-settings
 * Update Status.io integration settings
 */
async function handlePost(req, res, session) {
  // Check permission
  if (!hasPermission(session.permissions, 'settings.edit')) {
    await auditLog(
      AuditEventTypes.UNAUTHORIZED_ACCESS_ATTEMPT,
      session.adminId,
      { action: 'update_statusio_settings' },
      AuditSeverity.WARNING,
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    );
    return res.status(403).json({ error: 'Permission denied' });
  }

  // Validate CSRF token
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const csrfCheck = requireCSRFToken(req, res, sessionId);
  if (csrfCheck !== true) {
    await auditLog(
      AuditEventTypes.CSRF_TOKEN_INVALID,
      session.adminId,
      { endpoint: '/api/statusio-settings' },
      AuditSeverity.WARNING,
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    );
    return res.status(csrfCheck.status).json({ error: csrfCheck.error });
  }

  try {
    const {
      enabled,
      api_id,
      api_key,
      statuspage_id,
      component_mapping,
      auto_report_outages,
      auto_report_maintenance,
      notify_subscribers_on_outage,
      notify_subscribers_on_recovery,
      outage_threshold_minutes
    } = req.body;

    // Build update object (only include changed fields)
    const updates = {
      enabled: enabled === true,
      auto_report_outages: auto_report_outages !== false,
      auto_report_maintenance: auto_report_maintenance === true,
      notify_subscribers_on_outage: notify_subscribers_on_outage !== false,
      notify_subscribers_on_recovery: notify_subscribers_on_recovery !== false,
      updated_at: new Date().toISOString()
    };

    if (api_id !== undefined && api_id !== '') {
      updates.api_id = sanitizeString(api_id);
    }

    // Only update API key if it's not the masked value
    if (api_key && api_key !== '••••••••') {
      updates.api_key = api_key;
    }

    if (statuspage_id !== undefined) {
      updates.statuspage_id = sanitizeString(statuspage_id);
    }

    if (component_mapping !== undefined) {
      updates.component_mapping = component_mapping;
    }

    if (outage_threshold_minutes !== undefined) {
      const threshold = parseInt(outage_threshold_minutes, 10);
      if (!isNaN(threshold) && threshold >= 1 && threshold <= 60) {
        updates.outage_threshold_minutes = threshold;
      }
    }

    // Upsert settings
    const { data, error } = await supabase
      .from('statusio_settings')
      .upsert({ id: 1, ...updates }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating Status.io settings:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    // Audit log
    await auditLog(
      AuditEventTypes.SETTINGS_UPDATED,
      session.adminId,
      {
        settingsType: 'statusio',
        enabled: updates.enabled,
        auto_report_outages: updates.auto_report_outages
      },
      AuditSeverity.INFO,
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    );

    // Return safe settings (mask API key)
    const safeData = { ...data };
    if (safeData.api_key) {
      safeData.api_key = '••••••••';
    }

    res.status(200).json({
      success: true,
      message: 'Status.io settings updated successfully',
      settings: safeData
    });
  } catch (error) {
    console.error('Status.io settings update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req, res) {
  // Validate session
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, session);
    case 'POST':
      return handlePost(req, res, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
