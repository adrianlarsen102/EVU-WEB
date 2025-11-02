import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { requireCSRFToken } from '../../lib/csrf';
import { getSupabaseClient } from '../../lib/database';
import { testDiscordWebhook, getEventTypes } from '../../lib/discordWebhook';
import { auditLog, getClientIP, getUserAgent, AuditEventTypes, AuditSeverity } from '../../lib/auditLog';

// Initialize Supabase client
const supabase = getSupabaseClient();

/**
 * GET /api/discord-settings - Get Discord webhook configuration
 * POST /api/discord-settings - Update Discord webhook configuration
 */
export default async function handler(req, res) {

  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check admin permission
  if (!session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      // Get Discord settings
      const { data, error } = await supabase
        .from('discord_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // Get available event types
      const eventTypes = getEventTypes();

      // Return settings with event types
      res.status(200).json({
        enabled: data?.enabled || false,
        webhook_url: data?.webhook_url || '',
        bot_avatar_url: data?.bot_avatar_url || '',
        event_config: data?.event_config || {},
        updated_at: data?.updated_at || null,
        availableEventTypes: eventTypes
      });

    } catch {
      console.error('Discord settings fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Discord settings' });
    }

  } else if (req.method === 'POST') {
    // CSRF protection
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
    }

    try {
      const { enabled, webhook_url, bot_avatar_url, event_config } = req.body;

      // Validate webhook URL if provided
      if (enabled && webhook_url) {
        // Basic URL validation
        try {
          new URL(webhook_url);
          if (!webhook_url.includes('discord.com/api/webhooks/')) {
            return res.status(400).json({
              error: 'Invalid Discord webhook URL format'
            });
          }
        } catch (e) {
          return res.status(400).json({
            error: 'Invalid webhook URL'
          });
        }
      }

      // Validate event_config structure if provided
      if (event_config && typeof event_config !== 'object') {
        return res.status(400).json({
          error: 'event_config must be an object'
        });
      }

      // Update or insert Discord settings
      const updateData = {
        enabled: enabled || false,
        webhook_url: webhook_url || null,
        bot_avatar_url: bot_avatar_url || null,
        event_config: event_config || {},
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('discord_settings')
        .upsert({ id: 1, ...updateData }, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      // Audit log
      try {
        await auditLog(
          AuditEventTypes.SYSTEM_SETTINGS_UPDATED,
          session.adminId,
          {
            settingType: 'discord_webhook',
            enabled: enabled,
            hasWebhookUrl: !!webhook_url,
            userAgent: getUserAgent(req)
          },
          AuditSeverity.INFO,
          getClientIP(req)
        );
      } catch (auditError) {
        console.error('Audit log failed (non-critical):', auditError);
      }

      res.status(200).json({
        success: true,
        message: 'Discord settings updated successfully'
      });

    } catch {
      console.error('Discord settings update error:', error);
      res.status(500).json({ error: 'Failed to update Discord settings' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
