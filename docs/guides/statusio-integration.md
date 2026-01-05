# Status.io Integration Guide

Complete guide to integrating Status.io with your EVU-WEB gaming network for automated status page updates and incident reporting.

---

## 📋 Table of Contents

- [What is Status.io?](#what-is-statusio)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Configuration](#configuration)
- [Component Mapping](#component-mapping)
- [Testing the Integration](#testing-the-integration)
- [Automatic Incident Reporting](#automatic-incident-reporting)
- [Manual Incident Management](#manual-incident-management)
- [Troubleshooting](#troubleshooting)

---

## What is Status.io?

**Status.io** is a hosted status page service that allows you to:
- Display real-time server status to your community
- Automatically report incidents and outages
- Send notifications to subscribers
- Maintain transparency during downtime
- Track historical uptime metrics

---

## Features

EVU-WEB's Status.io integration provides:

✅ **Automatic Incident Reporting**
- Detects server outages automatically
- Creates incidents on your Status.io status page
- Updates incidents when servers come back online

✅ **Component Status Updates**
- Updates Minecraft server status in real-time
- Updates FiveM server status in real-time
- Customizable status thresholds

✅ **Subscriber Notifications**
- Configurable subscriber notifications
- Email alerts for outages and recoveries
- Optional notifications for maintenance windows

✅ **Admin Dashboard**
- Configure Status.io settings from admin panel
- Test connection before going live
- View component mappings
- Monitor integration status

---

## Prerequisites

Before setting up Status.io integration, you need:

1. **Status.io Account**
   - Sign up at [status.io](https://status.io)
   - Create a status page for your gaming network
   - Get your API credentials

2. **Status.io API Credentials**
   - API ID
   - API Key
   - Status Page ID

3. **Components Created in Status.io**
   - Create components for each server (Minecraft, FiveM, Website, etc.)
   - Note down the Component IDs

---

## Initial Setup

### Step 1: Database Setup

Run the SQL migration to create the `statusio_settings` table:

```bash
# Navigate to your project directory
cd c:\Github\EVU-WEB

# Run the SQL setup script in your Supabase dashboard
# SQL Editor → New Query → Paste contents of:
docs/database/statusio-setup.sql
```

Alternatively, run the SQL directly:

```sql
CREATE TABLE IF NOT EXISTS statusio_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT false,
  api_id TEXT,
  api_key TEXT,
  statuspage_id TEXT,
  component_mapping JSONB DEFAULT '{}',
  auto_report_outages BOOLEAN NOT NULL DEFAULT true,
  auto_report_maintenance BOOLEAN NOT NULL DEFAULT false,
  notify_subscribers_on_outage BOOLEAN NOT NULL DEFAULT true,
  notify_subscribers_on_recovery BOOLEAN NOT NULL DEFAULT true,
  outage_threshold_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);
```

### Step 2: Get Status.io API Credentials

1. Log in to [status.io](https://status.io)
2. Go to **Settings** → **API**
3. Copy your:
   - **API ID** (looks like: `a1b2c3d4e5f6`)
   - **API Key** (looks like: `1234567890abcdef...`)
   - **Status Page ID** (looks like: `507f1f77bcf86cd799439011`)

---

## Configuration

### Admin Panel Configuration

1. **Navigate to Admin Panel**
   ```
   https://yoursite.com/admin
   ```

2. **Go to Status.io Settings Tab**
   - Click on the "Status.io" tab (new tab added)

3. **Enter API Credentials**
   ```
   API ID: [Your API ID]
   API Key: [Your API Key]
   Status Page ID: [Your Status Page ID]
   ```

4. **Configure Options**
   - **Enable Status.io**: Toggle ON
   - **Auto-report Outages**: ON (recommended)
   - **Notify Subscribers on Outage**: ON (optional)
   - **Notify Subscribers on Recovery**: ON (optional)
   - **Outage Threshold**: 5 minutes (default)

5. **Save Settings**
   - Click "Save Settings"
   - You should see a success message

---

## Component Mapping

Component mapping links your servers to Status.io components.

### Step 1: Get Component IDs from Status.io

1. In Status.io dashboard, go to **Components**
2. Create components for your servers:
   - `Minecraft Server`
   - `FiveM Server`
   - `Website` (optional)

3. Copy each Component ID
   - Click on a component
   - Copy the ID from the URL or component details

### Step 2: Map Components in Admin Panel

In the Status.io settings tab, configure component mapping:

```json
{
  "minecraft": "component-abc123",
  "fivem": "component-def456",
  "website": "component-ghi789"
}
```

**Component Mapping Format:**
```json
{
  "[server-type]": "[status-io-component-id]"
}
```

**Available Server Types:**
- `minecraft` - Your Minecraft server
- `fivem` - Your FiveM server
- `website` - Your EVU-WEB website (optional)

---

## Testing the Integration

### Test Connection

1. **Navigate to Admin Panel** → **Status.io Tab**

2. **Click "Test Connection"**
   - This will verify your API credentials
   - Shows your status page name
   - Shows number of components

3. **Expected Result:**
   ```
   ✅ Successfully connected to Status.io!
   Status Page: EVU Gaming Network
   Components: 3
   ```

### Test Component List

Click "List Components" to see all available components:

```json
{
  "success": true,
  "components": [
    {
      "id": "component-abc123",
      "name": "Minecraft Server",
      "status": "operational"
    },
    {
      "id": "component-def456",
      "name": "FiveM Server",
      "status": "operational"
    }
  ]
}
```

### Test Incident Creation (Optional)

⚠️ **Warning:** This creates a real incident on your status page!

Click "Test Incident" to create a test incident:
- Creates a test incident marked as "Resolved"
- Visible on your public status page
- Subscribers will NOT be notified
- You can delete it manually from Status.io dashboard

---

## Automatic Incident Reporting

When enabled, EVU-WEB will automatically:

### 1. Monitor Server Status

- Checks Minecraft server every time `/api/servers/minecraft-status` is called
- Checks FiveM server every time `/api/servers/fivem-status` is called
- Tracks outage duration

### 2. Report Outages

When a server goes offline:

```
1. Outage detected
2. Wait for threshold (default: 5 minutes)
3. Create incident on Status.io
4. Update component status to "Major Outage"
5. Notify subscribers (if enabled)
```

**Incident Details:**
- **Title**: `MINECRAFT Server Outage` or `FIVEM Server Outage`
- **Status**: Investigating
- **Message**: Error details from server check
- **Affected Components**: Mapped component only

### 3. Report Recovery

When server comes back online:

```
1. Server online detected
2. Update incident status to "Resolved"
3. Update component status to "Operational"
4. Notify subscribers (if enabled)
```

---

## Manual Incident Management

### Using the Status.io Client Library

```javascript
import { initializeStatusIOClient, IncidentStatus, ComponentStatus } from '../lib/statusio';

// Initialize client
const client = await initializeStatusIOClient();

// Create incident
const incident = await client.createIncident({
  name: 'Database Maintenance',
  message: 'Performing scheduled database maintenance',
  status: IncidentStatus.IDENTIFIED,
  components: ['component-id-123'],
  currentStatus: ComponentStatus.MAINTENANCE,
  notifySubscribers: true
});

// Update incident
await client.updateIncident(incident.result.incident_id, {
  message: 'Maintenance in progress, 50% complete',
  status: IncidentStatus.MONITORING
});

// Resolve incident
await client.resolveIncident(
  incident.result.incident_id,
  'Maintenance completed successfully',
  true // notify subscribers
);
```

### Status Codes

**Incident Status:**
- `100` - Investigating
- `200` - Identified
- `300` - Monitoring
- `400` - Resolved

**Component Status:**
- `100` - Operational
- `300` - Degraded Performance
- `400` - Partial Outage
- `500` - Major Outage
- `600` - Maintenance

---

## Troubleshooting

### Connection Failed

**Error:** `Failed to connect to Status.io`

**Solutions:**
1. Verify API credentials are correct
2. Check API ID, API Key, and Status Page ID
3. Ensure Status.io account is active
4. Check if API key has necessary permissions

### Component Not Found

**Error:** `No Status.io component mapped for [server-type]`

**Solutions:**
1. Add component mapping in admin panel
2. Verify component IDs are correct
3. Check component exists in Status.io dashboard

### Incidents Not Creating

**Possible Causes:**
1. Status.io integration disabled
2. Auto-report outages disabled
3. Outage threshold not met (default: 5 minutes)
4. Component mapping missing
5. API credentials invalid

**Debug Steps:**
```bash
# Check Status.io settings
SELECT * FROM statusio_settings;

# Should show:
# enabled: true
# auto_report_outages: true
# component_mapping: {server mappings}
```

### Rate Limiting

Status.io has API rate limits. If you hit the limit:

1. **Error:** `429 Too Many Requests`
2. **Solution:** Reduce frequency of status checks
3. **Recommendation:** Check status every 5 minutes minimum

---

## Best Practices

### 1. Outage Threshold

Set an appropriate outage threshold:
- **Too Low (< 2 minutes)**: May create false incidents from brief network hiccups
- **Recommended (5 minutes)**: Good balance
- **Too High (> 10 minutes)**: Users may notice outage before status page updates

### 2. Subscriber Notifications

- Enable for major outages only
- Test notifications thoroughly before enabling
- Don't spam subscribers with minor issues

### 3. Component Organization

Create separate components for:
- Minecraft Server
- FiveM Server
- Website/API
- Database (if separate)
- Discord Bot (if applicable)

### 4. Incident Messages

Write clear, user-friendly incident messages:

**Good:**
```
"Minecraft server is experiencing connectivity issues.
Our team is investigating. ETA: 30 minutes."
```

**Bad:**
```
"ECONNREFUSED: Connection refused at 192.168.1.1:25565"
```

---

## API Endpoints

### GET /api/statusio-settings
Fetch current Status.io configuration

**Requires:** `settings.view` permission

### POST /api/statusio-settings
Update Status.io configuration

**Requires:** `settings.edit` permission + CSRF token

### POST /api/test-statusio
Test Status.io connection

**Requires:** `settings.edit` permission + CSRF token

**Request Body:**
```json
{
  "testType": "connection" | "listComponents" | "testIncident"
}
```

---

## Security

### API Key Storage

- API keys are stored encrypted in Supabase
- Keys are never sent to the client (masked as `••••••••`)
- CSRF protection on all settings updates
- Audit logging for all configuration changes

### Permissions

Only admins with `settings.edit` permission can:
- View Status.io settings
- Update Status.io configuration
- Test Status.io connection

---

## Support

**Need Help?**

1. Check [Status.io API Documentation](https://kb.status.io/developers/api/)
2. Review error logs in browser console
3. Check Supabase logs for API errors
4. Contact Status.io support for API issues

---

**Version:** 3.1.0
**Last Updated:** 2025-01-05
**Integration Tested:** Status.io API v2
