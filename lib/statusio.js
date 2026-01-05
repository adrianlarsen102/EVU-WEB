/**
 * Status.io API Client
 * Integrates with Status.io for incident reporting and status page updates
 *
 * API Documentation: https://kb.status.io/developers/api/
 */

import crypto from 'crypto';

/**
 * Status.io incident statuses
 */
export const IncidentStatus = {
  INVESTIGATING: 100,
  IDENTIFIED: 200,
  MONITORING: 300,
  RESOLVED: 400
};

/**
 * Status.io component statuses
 */
export const ComponentStatus = {
  OPERATIONAL: 100,
  DEGRADED_PERFORMANCE: 300,
  PARTIAL_OUTAGE: 400,
  MAJOR_OUTAGE: 500,
  MAINTENANCE: 600
};

/**
 * Status.io maintenance statuses
 */
export const MaintenanceStatus = {
  SCHEDULED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2
};

/**
 * Status.io API Client
 */
export class StatusIOClient {
  constructor(apiId, apiKey, statusPageId) {
    this.apiId = apiId;
    this.apiKey = apiKey;
    this.statusPageId = statusPageId;
    this.baseUrl = 'https://api.status.io/v2';
  }

  /**
   * Generate authentication headers for Status.io API
   */
  getAuthHeaders() {
    return {
      'x-api-id': this.apiId,
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated request to Status.io API
   */
  async request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;

    const options = {
      method,
      headers: this.getAuthHeaders()
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message ||
          responseData.error ||
          `Status.io API error: ${response.status}`
        );
      }

      return responseData;
    } catch (error) {
      console.error('Status.io API request failed:', error);
      throw error;
    }
  }

  /**
   * Get status page summary
   */
  async getSummary() {
    return this.request(`/status/${this.statusPageId}`);
  }

  /**
   * List all components on the status page
   */
  async listComponents() {
    return this.request(`/component/list/${this.statusPageId}`);
  }

  /**
   * Update component status
   * @param {string} componentId - Component ID from Status.io
   * @param {number} status - Status code (100=operational, 300=degraded, 400=partial outage, 500=major outage)
   * @param {string} details - Optional details about the status
   */
  async updateComponentStatus(componentId, status, details = '') {
    return this.request(`/component/status/update`, 'PATCH', {
      statuspage_id: this.statusPageId,
      components: [componentId],
      containers: [], // Leave empty to update all containers
      details: details,
      current_status: status
    });
  }

  /**
   * Create a new incident
   * @param {Object} incident - Incident details
   * @param {string} incident.name - Incident title
   * @param {string} incident.message - Incident description
   * @param {number} incident.status - Incident status (100=investigating, 200=identified, 300=monitoring, 400=resolved)
   * @param {Array<string>} incident.components - Array of affected component IDs
   * @param {number} incident.currentStatus - Current component status
   * @param {boolean} incident.notifySubscribers - Whether to notify subscribers
   */
  async createIncident(incident) {
    const {
      name,
      message,
      status = IncidentStatus.INVESTIGATING,
      components = [],
      currentStatus = ComponentStatus.MAJOR_OUTAGE,
      notifySubscribers = false
    } = incident;

    return this.request(`/incident/create`, 'POST', {
      statuspage_id: this.statusPageId,
      incident_name: name,
      incident_details: message,
      current_status: status,
      current_state: currentStatus,
      notify_email: notifySubscribers ? 1 : 0,
      notify_sms: 0,
      notify_webhook: 0,
      social: 0,
      irc: 0,
      hipchat: 0,
      slack: 0,
      components: components,
      containers: []
    });
  }

  /**
   * Update an existing incident
   * @param {string} incidentId - Incident ID
   * @param {Object} update - Update details
   * @param {string} update.message - Update message
   * @param {number} update.status - Incident status
   * @param {number} update.currentStatus - Component status
   * @param {boolean} update.notifySubscribers - Whether to notify subscribers
   */
  async updateIncident(incidentId, update) {
    const {
      message,
      status = IncidentStatus.INVESTIGATING,
      currentStatus = ComponentStatus.MAJOR_OUTAGE,
      notifySubscribers = false
    } = update;

    return this.request(`/incident/update`, 'PATCH', {
      statuspage_id: this.statusPageId,
      incident_id: incidentId,
      incident_details: message,
      current_status: status,
      current_state: currentStatus,
      notify_email: notifySubscribers ? 1 : 0,
      notify_sms: 0,
      notify_webhook: 0,
      social: 0
    });
  }

  /**
   * Resolve an incident
   * @param {string} incidentId - Incident ID
   * @param {string} message - Resolution message
   * @param {boolean} notifySubscribers - Whether to notify subscribers
   */
  async resolveIncident(incidentId, message, notifySubscribers = false) {
    return this.updateIncident(incidentId, {
      message,
      status: IncidentStatus.RESOLVED,
      currentStatus: ComponentStatus.OPERATIONAL,
      notifySubscribers
    });
  }

  /**
   * List all active incidents
   */
  async listIncidents() {
    return this.request(`/incident/list/${this.statusPageId}`);
  }

  /**
   * Create a scheduled maintenance
   * @param {Object} maintenance - Maintenance details
   * @param {string} maintenance.name - Maintenance title
   * @param {string} maintenance.message - Maintenance description
   * @param {Array<string>} maintenance.components - Affected component IDs
   * @param {Date} maintenance.dateFrom - Start date
   * @param {Date} maintenance.dateTo - End date
   * @param {boolean} maintenance.notifySubscribers - Whether to notify subscribers
   */
  async createMaintenance(maintenance) {
    const {
      name,
      message,
      components = [],
      dateFrom,
      dateTo,
      notifySubscribers = true
    } = maintenance;

    // Convert dates to Unix timestamps
    const dateFromUnix = Math.floor(dateFrom.getTime() / 1000);
    const dateToUnix = Math.floor(dateTo.getTime() / 1000);

    return this.request(`/maintenance/schedule`, 'POST', {
      statuspage_id: this.statusPageId,
      maintenance_name: name,
      maintenance_details: message,
      components: components,
      containers: [],
      date_planned_start: dateFromUnix,
      date_planned_end: dateToUnix,
      maintenance_notify_now: notifySubscribers ? 1 : 0,
      maintenance_notify_1_hr: 0,
      maintenance_notify_24_hr: 0,
      maintenance_notify_72_hr: 0,
      all_infrastructure_affected: components.length === 0 ? 1 : 0
    });
  }

  /**
   * Start a scheduled maintenance
   * @param {string} maintenanceId - Maintenance ID
   * @param {string} message - Start message
   */
  async startMaintenance(maintenanceId, message) {
    return this.request(`/maintenance/start`, 'PATCH', {
      statuspage_id: this.statusPageId,
      maintenance_id: maintenanceId,
      maintenance_details: message
    });
  }

  /**
   * Complete a maintenance
   * @param {string} maintenanceId - Maintenance ID
   * @param {string} message - Completion message
   */
  async completeMaintenance(maintenanceId, message) {
    return this.request(`/maintenance/finish`, 'PATCH', {
      statuspage_id: this.statusPageId,
      maintenance_id: maintenanceId,
      maintenance_details: message
    });
  }

  /**
   * List all maintenances
   */
  async listMaintenances() {
    return this.request(`/maintenance/list/${this.statusPageId}`);
  }

  /**
   * Get subscriber count
   */
  async getSubscriberCount() {
    return this.request(`/subscriber/count/${this.statusPageId}`);
  }
}

/**
 * Get Status.io client from environment variables
 */
export function getStatusIOClient() {
  const { getSupabaseClient } = require('./database');

  // Client will be initialized when settings are retrieved
  return null; // Async initialization required
}

/**
 * Initialize Status.io client from database settings
 */
export async function initializeStatusIOClient() {
  try {
    const { getSupabaseClient } = await import('./database.js');
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('statusio_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      console.log('Status.io not configured');
      return null;
    }

    if (!data.enabled) {
      console.log('Status.io integration disabled');
      return null;
    }

    if (!data.api_id || !data.api_key || !data.statuspage_id) {
      console.error('Status.io configuration incomplete');
      return null;
    }

    return new StatusIOClient(
      data.api_id,
      data.api_key,
      data.statuspage_id
    );
  } catch (error) {
    console.error('Failed to initialize Status.io client:', error);
    return null;
  }
}

/**
 * Helper function to report server outage to Status.io
 */
export async function reportServerOutage(serverType, details) {
  try {
    const client = await initializeStatusIOClient();
    if (!client) return null;

    // Get component mapping from settings
    const { getSupabaseClient } = await import('./database.js');
    const supabase = getSupabaseClient();

    const { data: settings } = await supabase
      .from('statusio_settings')
      .select('component_mapping')
      .eq('id', 1)
      .single();

    const componentMapping = settings?.component_mapping || {};
    const componentId = componentMapping[serverType];

    if (!componentId) {
      console.warn(`No Status.io component mapped for ${serverType}`);
      return null;
    }

    // Create incident
    const incident = await client.createIncident({
      name: `${serverType.toUpperCase()} Server Outage`,
      message: details || `${serverType} server is currently experiencing issues and is offline.`,
      status: IncidentStatus.INVESTIGATING,
      components: [componentId],
      currentStatus: ComponentStatus.MAJOR_OUTAGE,
      notifySubscribers: true
    });

    return incident;
  } catch (error) {
    console.error('Failed to report outage to Status.io:', error);
    return null;
  }
}

/**
 * Helper function to update component status based on server health
 */
export async function updateServerStatus(serverType, isOnline, details = '') {
  try {
    const client = await initializeStatusIOClient();
    if (!client) return null;

    const { getSupabaseClient } = await import('./database.js');
    const supabase = getSupabaseClient();

    const { data: settings } = await supabase
      .from('statusio_settings')
      .select('component_mapping')
      .eq('id', 1)
      .single();

    const componentMapping = settings?.component_mapping || {};
    const componentId = componentMapping[serverType];

    if (!componentId) {
      console.warn(`No Status.io component mapped for ${serverType}`);
      return null;
    }

    const status = isOnline ? ComponentStatus.OPERATIONAL : ComponentStatus.MAJOR_OUTAGE;

    return await client.updateComponentStatus(componentId, status, details);
  } catch (error) {
    console.error('Failed to update server status on Status.io:', error);
    return null;
  }
}

export default StatusIOClient;
