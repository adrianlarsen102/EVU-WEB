/**
 * Server Status Monitor
 * Monitors server health and reports to Status.io when configured
 */

import { updateServerStatus, reportServerOutage } from './statusio.js';
import { getSupabaseClient } from './database.js';

/**
 * Track server outages to avoid duplicate reports
 */
const outageTracker = new Map();

/**
 * Report server status change to Status.io if configured
 * @param {string} serverType - 'minecraft' or 'fivem'
 * @param {boolean} isOnline - Whether server is online
 * @param {Object} statusData - Server status data
 */
export async function reportStatusChange(serverType, isOnline, statusData = {}) {
  try {
    // Check if Status.io is enabled and configured
    const supabase = getSupabaseClient();
    const { data: settings } = await supabase
      .from('statusio_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (!settings || !settings.enabled || !settings.auto_report_outages) {
      return; // Status.io disabled or auto-reporting disabled
    }

    const outageKey = `${serverType}-outage`;
    const wasOffline = outageTracker.get(outageKey);

    if (!isOnline && !wasOffline) {
      // Server just went offline - report outage
      console.log(`[Status Monitor] ${serverType} went offline, reporting to Status.io`);

      const details = statusData.error || `${serverType} server is not responding`;

      await reportServerOutage(serverType, details);

      // Mark as offline
      outageTracker.set(outageKey, {
        reportedAt: new Date(),
        details
      });
    } else if (isOnline && wasOffline) {
      // Server came back online - update status to operational
      console.log(`[Status Monitor] ${serverType} came back online, updating Status.io`);

      const uptime = statusData.uptime || 'Unknown';
      const details = `${serverType} server is back online. Uptime: ${uptime}`;

      await updateServerStatus(serverType, true, details);

      // Clear outage tracking
      outageTracker.delete(outageKey);
    } else if (isOnline) {
      // Server is online - update component status periodically
      const playerInfo = statusData.players
        ? `${statusData.players.online}/${statusData.players.max} players`
        : '';

      await updateServerStatus(serverType, true, playerInfo);
    }
  } catch (error) {
    console.error(`[Status Monitor] Error reporting ${serverType} status:`, error);
    // Don't throw - status monitoring should not break server status checks
  }
}

/**
 * Check if server has been offline long enough to report
 * @param {string} serverType - 'minecraft' or 'fivem'
 * @returns {boolean} - True if threshold exceeded
 */
export async function hasExceededOutageThreshold(serverType) {
  const outageKey = `${serverType}-outage`;
  const outage = outageTracker.get(outageKey);

  if (!outage) return false;

  try {
    const supabase = getSupabaseClient();
    const { data: settings } = await supabase
      .from('statusio_settings')
      .select('outage_threshold_minutes')
      .eq('id', 1)
      .single();

    const thresholdMinutes = settings?.outage_threshold_minutes || 5;
    const thresholdMs = thresholdMinutes * 60 * 1000;

    const outageTime = Date.now() - outage.reportedAt.getTime();

    return outageTime >= thresholdMs;
  } catch (error) {
    console.error('Error checking outage threshold:', error);
    return false;
  }
}

/**
 * Get current outage status for all servers
 * @returns {Object} - Outage status for each server
 */
export function getOutageStatus() {
  const status = {};

  for (const [key, value] of outageTracker.entries()) {
    const serverType = key.replace('-outage', '');
    status[serverType] = {
      offline: true,
      since: value.reportedAt,
      details: value.details
    };
  }

  return status;
}

/**
 * Clear outage tracking (for testing/reset)
 */
export function clearOutageTracking() {
  outageTracker.clear();
}

export default {
  reportStatusChange,
  hasExceededOutageThreshold,
  getOutageStatus,
  clearOutageTracking
};
