import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { requireCSRFToken } from '../../lib/csrf';
import { hasPermission } from '../../lib/permissions';
import { initializeStatusIOClient } from '../../lib/statusio';
import { auditLog, AuditEventTypes, AuditSeverity } from '../../lib/auditLog';

/**
 * POST /api/test-statusio
 * Test Status.io connection and optionally send a test incident
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate session
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check permission
  if (!hasPermission(session.permissions, 'settings.edit')) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // Validate CSRF token
  const csrfCheck = requireCSRFToken(req, res, sessionId);
  if (csrfCheck !== true) {
    return res.status(csrfCheck.status).json({ error: csrfCheck.error });
  }

  try {
    const { testType = 'connection' } = req.body;

    // Initialize Status.io client
    const client = await initializeStatusIOClient();

    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Status.io is not configured. Please configure API credentials first.'
      });
    }

    // Test based on type
    let result;

    switch (testType) {
      case 'connection':
        // Test basic connection by fetching status page summary
        result = await client.getSummary();

        await auditLog(
          AuditEventTypes.SETTINGS_UPDATED,
          session.adminId,
          { action: 'test_statusio_connection', success: true },
          AuditSeverity.INFO,
          req.headers['x-forwarded-for'] || req.socket.remoteAddress
        );

        return res.status(200).json({
          success: true,
          message: 'Successfully connected to Status.io!',
          data: {
            statusPageName: result.result?.status[0]?.statuspage_name || 'Unknown',
            componentCount: result.result?.status[0]?.components?.length || 0
          }
        });

      case 'listComponents':
        // List all components
        result = await client.listComponents();

        return res.status(200).json({
          success: true,
          message: 'Successfully retrieved components',
          data: {
            components: result.result?.components || []
          }
        });

      case 'testIncident':
        // Create a test incident (will be visible on status page!)
        const testIncident = await client.createIncident({
          name: 'EVU-WEB Test Incident',
          message: 'This is a test incident created by EVU-WEB. Please ignore.',
          status: 400, // Resolved
          components: [], // No components affected
          currentStatus: 100, // Operational
          notifySubscribers: false // Don't spam subscribers
        });

        await auditLog(
          AuditEventTypes.SETTINGS_UPDATED,
          session.adminId,
          { action: 'test_statusio_incident', incidentId: testIncident.result?.incident_id },
          AuditSeverity.INFO,
          req.headers['x-forwarded-for'] || req.socket.remoteAddress
        );

        return res.status(200).json({
          success: true,
          message: 'Test incident created successfully! Check your Status.io dashboard.',
          data: {
            incidentId: testIncident.result?.incident_id
          }
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid test type'
        });
    }
  } catch (error) {
    console.error('Status.io test error:', error);

    await auditLog(
      AuditEventTypes.SETTINGS_UPDATED,
      session.adminId,
      { action: 'test_statusio_connection', success: false, error: error.message },
      AuditSeverity.ERROR,
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    );

    return res.status(500).json({
      success: false,
      message: `Failed to test Status.io: ${error.message}`
    });
  }
}
