/**
 * Discord Webhook Notification System
 *
 * Sends rich embedded messages to Discord via webhooks for various platform events
 * Supports user actions, forum activity, support tickets, security events, and more
 */

/**
 * Discord color codes for different event types
 */
const DISCORD_COLORS = {
  SUCCESS: 0x00ff88,    // Green
  INFO: 0x6b46c1,       // Purple
  WARNING: 0xf59e0b,    // Orange
  ERROR: 0xef4444,      // Red
  CRITICAL: 0xdc2626,   // Dark red
  USER: 0x3b82f6,       // Blue
  FORUM: 0x8b5cf6,      // Purple
  SUPPORT: 0x10b981,    // Teal
  SECURITY: 0xff0000,   // Red
  ADMIN: 0xfbbf24       // Yellow
};

/**
 * Event type to webhook mapping configuration
 */
const WEBHOOK_EVENT_TYPES = {
  // User Management
  USER_REGISTERED: { color: DISCORD_COLORS.SUCCESS, icon: '👤', enabled: true },
  USER_CREATED: { color: DISCORD_COLORS.USER, icon: '➕', enabled: true },
  USER_UPDATED: { color: DISCORD_COLORS.INFO, icon: '✏️', enabled: false }, // Too verbose
  USER_DELETED: { color: DISCORD_COLORS.WARNING, icon: '🗑️', enabled: true },
  USER_ROLE_CHANGED: { color: DISCORD_COLORS.USER, icon: '🔄', enabled: true },

  // Authentication & Security
  LOGIN_SUCCESS: { color: DISCORD_COLORS.INFO, icon: '🔓', enabled: false }, // Too verbose
  LOGIN_FAILURE: { color: DISCORD_COLORS.WARNING, icon: '⚠️', enabled: true },
  PASSWORD_CHANGED: { color: DISCORD_COLORS.SUCCESS, icon: '🔐', enabled: false },
  UNAUTHORIZED_ACCESS_ATTEMPT: { color: DISCORD_COLORS.SECURITY, icon: '🚨', enabled: true },
  CSRF_TOKEN_INVALID: { color: DISCORD_COLORS.SECURITY, icon: '🛡️', enabled: true },
  RATE_LIMIT_EXCEEDED: { color: DISCORD_COLORS.WARNING, icon: '⏱️', enabled: true },

  // Forum Activity
  TOPIC_CREATED: { color: DISCORD_COLORS.FORUM, icon: '💬', enabled: true },
  TOPIC_DELETED: { color: DISCORD_COLORS.WARNING, icon: '🗑️', enabled: true },
  TOPIC_LOCKED: { color: DISCORD_COLORS.WARNING, icon: '🔒', enabled: true },
  COMMENT_DELETED: { color: DISCORD_COLORS.WARNING, icon: '🗑️', enabled: false },

  // Support Tickets
  TICKET_CREATED: { color: DISCORD_COLORS.SUPPORT, icon: '🎫', enabled: true },
  TICKET_STATUS_CHANGED: { color: DISCORD_COLORS.INFO, icon: '📋', enabled: true },
  TICKET_REPLIED: { color: DISCORD_COLORS.SUPPORT, icon: '💬', enabled: false },
  TICKET_DELETED: { color: DISCORD_COLORS.WARNING, icon: '🗑️', enabled: true },

  // Role Management
  ROLE_CREATED: { color: DISCORD_COLORS.ADMIN, icon: '🎭', enabled: true },
  ROLE_UPDATED: { color: DISCORD_COLORS.INFO, icon: '✏️', enabled: false },
  ROLE_DELETED: { color: DISCORD_COLORS.WARNING, icon: '🗑️', enabled: true },

  // Settings & Content
  CONTENT_UPDATED: { color: DISCORD_COLORS.INFO, icon: '📝', enabled: false },
  EMAIL_SETTINGS_UPDATED: { color: DISCORD_COLORS.INFO, icon: '📧', enabled: true },
  SYSTEM_SETTINGS_UPDATED: { color: DISCORD_COLORS.ADMIN, icon: '⚙️', enabled: true }
};

/**
 * Send a Discord webhook notification
 * @param {string} eventType - The type of event (from WEBHOOK_EVENT_TYPES)
 * @param {object} data - Event data to include in the notification
 * @param {string} webhookUrl - Discord webhook URL (optional, uses env var if not provided)
 * @returns {Promise<boolean>} - True if sent successfully, false otherwise
 */
export async function sendDiscordNotification(eventType, data, webhookUrl = null) {
  try {
    // Get webhook URL from environment or parameter
    const url = webhookUrl || process.env.DISCORD_WEBHOOK_URL;

    if (!url) {
      console.log('[Discord] Webhook URL not configured, skipping notification');
      return false;
    }

    // Check if this event type is configured
    const eventConfig = WEBHOOK_EVENT_TYPES[eventType];
    if (!eventConfig) {
      console.log(`[Discord] Unknown event type: ${eventType}`);
      return false;
    }

    // Check if this event type is enabled
    if (!eventConfig.enabled) {
      console.log(`[Discord] Event type ${eventType} is disabled`);
      return false;
    }

    // Build the Discord embed
    const embed = buildEmbed(eventType, data, eventConfig);

    // Send to Discord
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'EVU Server Bot',
        avatar_url: process.env.DISCORD_BOT_AVATAR_URL || undefined,
        embeds: [embed]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Discord] Webhook request failed:', response.status, errorText);
      return false;
    }

    console.log(`[Discord] Notification sent successfully for ${eventType}`);
    return true;

  } catch (error) {
    console.error('[Discord] Failed to send notification:', error);
    return false;
  }
}

/**
 * Build a Discord embed object from event data
 * @param {string} eventType - The type of event
 * @param {object} data - Event data
 * @param {object} eventConfig - Event configuration
 * @returns {object} - Discord embed object
 */
function buildEmbed(eventType, data, eventConfig) {
  const embed = {
    title: `${eventConfig.icon} ${formatEventTitle(eventType)}`,
    color: eventConfig.color,
    timestamp: new Date().toISOString(),
    fields: []
  };

  // Add event-specific fields
  switch (eventType) {
    case 'USER_REGISTERED':
    case 'USER_CREATED':
      embed.fields.push(
        { name: 'Username', value: data.username || 'Unknown', inline: true },
        { name: 'Role', value: data.role || 'User', inline: true }
      );
      if (data.email) {
        embed.fields.push({ name: 'Email', value: data.email, inline: true });
      }
      break;

    case 'USER_DELETED':
      embed.fields.push(
        { name: 'Username', value: data.deletedUsername || data.username || 'Unknown', inline: true },
        { name: 'Deleted By', value: data.adminUsername || data.deletedBy || 'System', inline: true }
      );
      break;

    case 'USER_UPDATED':
      embed.fields.push(
        { name: 'Username', value: data.username || 'Unknown', inline: true },
        { name: 'Updated By', value: data.adminUsername || 'Self', inline: true }
      );
      if (data.updatedFields && data.updatedFields.length > 0) {
        embed.fields.push({ name: 'Fields Updated', value: data.updatedFields.join(', '), inline: false });
      }
      break;

    case 'USER_ROLE_CHANGED':
      embed.fields.push(
        { name: 'Username', value: data.username || 'Unknown', inline: true },
        { name: 'Previous Role', value: data.oldRole || 'Unknown', inline: true },
        { name: 'New Role', value: data.newRole || 'Unknown', inline: true }
      );
      break;

    case 'LOGIN_FAILURE':
      embed.fields.push(
        { name: 'Username Attempted', value: data.username || 'Unknown', inline: true },
        { name: 'IP Address', value: data.ipAddress || 'Unknown', inline: true }
      );
      if (data.reason) {
        embed.fields.push({ name: 'Reason', value: data.reason, inline: false });
      }
      break;

    case 'UNAUTHORIZED_ACCESS_ATTEMPT':
    case 'CSRF_TOKEN_INVALID':
      embed.fields.push(
        { name: 'User', value: data.username || 'Anonymous', inline: true },
        { name: 'IP Address', value: data.ipAddress || 'Unknown', inline: true },
        { name: 'Endpoint', value: data.endpoint || 'Unknown', inline: false }
      );
      break;

    case 'RATE_LIMIT_EXCEEDED':
      embed.fields.push(
        { name: 'IP Address', value: data.ipAddress || 'Unknown', inline: true },
        { name: 'Endpoint', value: data.endpoint || 'Unknown', inline: true },
        { name: 'Limit Type', value: data.limitType || 'Unknown', inline: true }
      );
      break;

    case 'TOPIC_CREATED':
      embed.fields.push(
        { name: 'Title', value: truncate(data.title || 'Untitled', 256), inline: false },
        { name: 'Author', value: data.author || 'Unknown', inline: true },
        { name: 'Category', value: data.category || 'General', inline: true }
      );
      if (data.topicUrl) {
        embed.fields.push({ name: 'Link', value: data.topicUrl, inline: false });
      }
      break;

    case 'TOPIC_DELETED':
    case 'TOPIC_LOCKED':
      embed.fields.push(
        { name: 'Title', value: truncate(data.title || 'Unknown', 256), inline: false },
        { name: 'Action By', value: data.moderator || data.admin || 'System', inline: true }
      );
      if (data.reason) {
        embed.fields.push({ name: 'Reason', value: truncate(data.reason, 1024), inline: false });
      }
      break;

    case 'TICKET_CREATED':
      embed.fields.push(
        { name: 'Subject', value: truncate(data.subject || 'No Subject', 256), inline: false },
        { name: 'Created By', value: data.username || 'Unknown', inline: true },
        { name: 'Priority', value: data.priority || 'Medium', inline: true }
      );
      if (data.ticketId) {
        embed.fields.push({ name: 'Ticket ID', value: data.ticketId, inline: true });
      }
      break;

    case 'TICKET_STATUS_CHANGED':
      embed.fields.push(
        { name: 'Ticket ID', value: data.ticketId || 'Unknown', inline: true },
        { name: 'Old Status', value: data.oldStatus || 'Unknown', inline: true },
        { name: 'New Status', value: data.newStatus || 'Unknown', inline: true }
      );
      if (data.changedBy) {
        embed.fields.push({ name: 'Changed By', value: data.changedBy, inline: true });
      }
      break;

    case 'ROLE_CREATED':
      embed.fields.push(
        { name: 'Role Name', value: data.roleName || 'Unknown', inline: true },
        { name: 'Created By', value: data.createdBy || 'System', inline: true }
      );
      if (data.permissionCount) {
        embed.fields.push({ name: 'Permissions', value: `${data.permissionCount} permissions`, inline: true });
      }
      break;

    case 'ROLE_DELETED':
      embed.fields.push(
        { name: 'Role Name', value: data.roleName || 'Unknown', inline: true },
        { name: 'Deleted By', value: data.deletedBy || 'System', inline: true }
      );
      break;

    case 'EMAIL_SETTINGS_UPDATED':
    case 'SYSTEM_SETTINGS_UPDATED':
      embed.fields.push(
        { name: 'Updated By', value: data.updatedBy || data.admin || 'System', inline: true }
      );
      if (data.changes) {
        embed.fields.push({ name: 'Changes', value: truncate(data.changes, 1024), inline: false });
      }
      break;

    default:
      // Generic field handling
      if (data.username) {
        embed.fields.push({ name: 'User', value: data.username, inline: true });
      }
      if (data.ipAddress) {
        embed.fields.push({ name: 'IP Address', value: data.ipAddress, inline: true });
      }
      break;
  }

  // Add footer with environment info
  const env = process.env.NODE_ENV || 'production';
  embed.footer = {
    text: `EVU Server | ${env.charAt(0).toUpperCase() + env.slice(1)}`
  };

  return embed;
}

/**
 * Format event type for display
 * @param {string} eventType - Event type constant
 * @returns {string} - Human-readable event name
 */
function formatEventTitle(eventType) {
  return eventType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Truncate text to maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Test Discord webhook configuration
 * @param {string} webhookUrl - Discord webhook URL to test
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function testDiscordWebhook(webhookUrl) {
  try {
    const embed = {
      title: '🧪 Test Notification',
      description: 'This is a test notification from EVU Server. If you see this, your Discord webhook is configured correctly!',
      color: DISCORD_COLORS.SUCCESS,
      timestamp: new Date().toISOString(),
      fields: [
        { name: 'Status', value: '✅ Connected', inline: true },
        { name: 'Environment', value: process.env.NODE_ENV || 'production', inline: true }
      ],
      footer: {
        text: 'EVU Server Notification System'
      }
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'EVU Server Bot',
        avatar_url: process.env.DISCORD_BOT_AVATAR_URL || undefined,
        embeds: [embed]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get list of available event types with their configuration
 * @returns {object} - Event types configuration
 */
export function getEventTypes() {
  return WEBHOOK_EVENT_TYPES;
}

/**
 * Update event type enabled status
 * @param {string} eventType - Event type to update
 * @param {boolean} enabled - Whether the event should be enabled
 */
export function setEventEnabled(eventType, enabled) {
  if (WEBHOOK_EVENT_TYPES[eventType]) {
    WEBHOOK_EVENT_TYPES[eventType].enabled = enabled;
  }
}
