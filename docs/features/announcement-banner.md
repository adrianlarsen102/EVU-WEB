## Announcement Banner System

**Version**: v3.2.3+
**Added**: 2025-01-15

### Overview

The Announcement Banner System allows administrators to display site-wide notifications and alerts to users. Banners can be targeted to specific servers (Minecraft/FiveM) or shown globally, and include priority-based styling for different message types.

---

### Features

✅ **Site-wide Notifications** - Display important messages across all pages
✅ **Server-Specific Targeting** - Show announcements only to Minecraft or FiveM users
✅ **Priority Levels** - Info, Warning, Error, Success with distinct visual styling
✅ **Scheduling** - Set start and end dates for time-bound announcements
✅ **Dismissible** - Users can dismiss announcements (stored in localStorage)
✅ **Rich Text Support** - HTML formatting for links and styling
✅ **Auto-Refresh** - Announcements update automatically every 5 minutes
✅ **Responsive Design** - Mobile-friendly with accessible controls
✅ **Audit Logging** - All announcement changes are logged

---

### Database Schema

**Table**: `announcements`

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',        -- 'info', 'warning', 'error', 'success'
  target TEXT NOT NULL DEFAULT 'all',       -- 'all', 'minecraft', 'fivem'
  start_date TIMESTAMP WITH TIME ZONE,      -- When to start showing
  end_date TIMESTAMP WITH TIME ZONE,        -- When to stop showing
  enabled BOOLEAN DEFAULT true,             -- Admin toggle
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Setup**: Run [docs/database/announcements-table.sql](../database/announcements-table.sql)

---

### API Endpoints

#### GET `/api/announcements?target={all|minecraft|fivem}`

**Public endpoint** - No authentication required

**Query Parameters**:
- `target` (optional) - Filter by server: `all`, `minecraft`, or `fivem`

**Response**:
```json
{
  "announcements": [
    {
      "id": "uuid",
      "title": "Welcome!",
      "message": "Thanks for visiting EVU Gaming!",
      "type": "info",
      "target": "all",
      "start_date": null,
      "end_date": null,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Example**:
```javascript
fetch('/api/announcements?target=minecraft')
  .then(res => res.json())
  .then(data => console.log(data.announcements));
```

---

#### POST `/api/announcements`

**Admin only** - Requires `settings.edit` permission + CSRF token

**Request Body**:
```json
{
  "title": "Maintenance Notice",
  "message": "Server will be down for maintenance.",
  "type": "warning",
  "target": "minecraft",
  "startDate": "2025-01-20T00:00:00Z",
  "endDate": "2025-01-20T02:00:00Z",
  "enabled": true
}
```

**Response**:
```json
{
  "success": true,
  "announcement": { ...announcement object... }
}
```

---

#### PUT `/api/announcements`

**Admin only** - Requires `settings.edit` permission + CSRF token

**Request Body**:
```json
{
  "id": "announcement-uuid",
  "title": "Updated Title",
  "enabled": false
}
```

Only include fields you want to update.

---

#### DELETE `/api/announcements`

**Admin only** - Requires `settings.edit` permission + CSRF token

**Request Body**:
```json
{
  "id": "announcement-uuid"
}
```

---

### Frontend Usage

#### Basic Implementation

Add the component to your page layout:

```jsx
import AnnouncementBanner from '../components/AnnouncementBanner';

export default function HomePage() {
  return (
    <>
      <AnnouncementBanner target="all" />
      <main>
        {/* Page content */}
      </main>
    </>
  );
}
```

#### Server-Specific Banners

```jsx
// Show only Minecraft announcements
<AnnouncementBanner target="minecraft" />

// Show only FiveM announcements
<AnnouncementBanner target="fivem" />

// Show all announcements (default)
<AnnouncementBanner target="all" />
```

#### In Layout Component

Add to `components/Layout.js` for site-wide display:

```jsx
import AnnouncementBanner from './AnnouncementBanner';

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <AnnouncementBanner target="all" />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

---

### Admin Panel Integration

Add an "Announcements" tab to the admin panel for easy management.

**Recommended UI**:

```
┌─────────────────────────────────────┐
│ Create New Announcement             │
├─────────────────────────────────────┤
│ Title: [                         ]  │
│ Message: [                       ]  │
│         (supports HTML)            │
│ Type: [ Info ▼ ]                   │
│ Target: [ All Servers ▼ ]          │
│ Start Date: [Optional]             │
│ End Date: [Optional]               │
│ Enabled: [✓]                       │
│ [Create Announcement]              │
└─────────────────────────────────────┘

Active Announcements:
┌─────────────────────────────────────┐
│ ⚠️  Maintenance Notice              │
│ Server will be down tomorrow        │
│ Type: warning | Target: minecraft   │
│ [Edit] [Disable] [Delete]          │
└─────────────────────────────────────┘
```

**Implementation Example**:

```javascript
// In admin panel
async function createAnnouncement(formData) {
  const csrfToken = await fetch('/api/csrf-token').then(r => r.json()).then(d => d.csrfToken);

  const response = await fetch('/api/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(formData)
  });

  return response.json();
}
```

---

### Announcement Types

#### 🔵 Info (Blue gradient)
- General information
- Welcome messages
- Feature announcements
- Updates and news

```json
{ "type": "info", "title": "New Feature!", "message": "Check out our new forum!" }
```

---

#### ⚠️ Warning (Pink/Red gradient)
- Scheduled maintenance
- Upcoming changes
- Important notices
- Temporary issues

```json
{ "type": "warning", "title": "Maintenance", "message": "Server downtime tomorrow 2-4 AM UTC" }
```

---

#### ❌ Error (Red/Yellow gradient)
- Critical alerts
- Service outages
- Emergency notifications
- Security alerts

```json
{ "type": "error", "title": "Service Disruption", "message": "Login issues detected" }
```

---

#### ✅ Success (Cyan/Pink gradient)
- Resolved issues
- Successful updates
- Positive announcements
- Achievement notifications

```json
{ "type": "success", "title": "All Systems Operational", "message": "Issues resolved!" }
```

---

### Scheduling Announcements

#### Immediate Display
Omit `startDate` and `endDate`:
```json
{
  "title": "Welcome!",
  "message": "Immediate announcement",
  "start_date": null,
  "end_date": null
}
```

#### Future Announcement
Set `startDate` in the future:
```json
{
  "title": "Scheduled Event",
  "message": "Starts tomorrow at 8 PM",
  "start_date": "2025-01-16T20:00:00Z",
  "end_date": null
}
```

#### Time-Limited Announcement
Set both dates:
```json
{
  "title": "Limited Offer",
  "message": "Double XP weekend!",
  "start_date": "2025-01-20T00:00:00Z",
  "end_date": "2025-01-21T23:59:59Z"
}
```

---

### Targeting

| Target Value | Display Location | Use Case |
|-------------|------------------|----------|
| `all` | Everywhere | General site announcements |
| `minecraft` | Minecraft pages only | Minecraft-specific news |
| `fivem` | FiveM pages only | FiveM-specific news |

**Note**: Announcements with `target: 'all'` are shown alongside server-specific ones.

---

### User Dismissal

Users can dismiss announcements by clicking the ✕ button. Dismissed IDs are stored in `localStorage`:

```javascript
// Stored in localStorage
{
  "dismissedAnnouncements": ["uuid1", "uuid2", "uuid3"]
}
```

**Clearing Dismissals**:
```javascript
localStorage.removeItem('dismissedAnnouncements');
```

**Note**: Dismissals are per-browser. Users see announcements again if:
- They use a different browser
- They clear localStorage
- The announcement is updated (new ID)

---

### Rich Text Formatting

Announcements support HTML in the `message` field:

**Bold/Italic**:
```json
{ "message": "<strong>Important:</strong> <em>Read carefully</em>" }
```

**Links**:
```json
{ "message": "Join our <a href='https://discord.gg/evu'>Discord</a>" }
```

**Lists**:
```json
{ "message": "<ul><li>Feature 1</li><li>Feature 2</li></ul>" }
```

**Security**: Messages are sanitized with `sanitizeHTML()` to prevent XSS attacks.

---

### Performance

**Caching**:
- Announcements refresh every 5 minutes in the browser
- Use PostgreSQL function `get_active_announcements()` for efficient queries
- Database indexes optimize date range and target filtering

**Optimization Tips**:
1. Limit active announcements (3-5 max recommended)
2. Set end dates for temporary announcements
3. Disable instead of deleting (preserves history)
4. Use scheduling to avoid manual enable/disable

---

### Security

✅ **Row Level Security (RLS)** - Anyone can view active announcements, only admins can manage
✅ **CSRF Protection** - All write operations require CSRF tokens
✅ **Input Sanitization** - HTML is sanitized to prevent XSS
✅ **Permission Checks** - Requires `settings.edit` permission
✅ **Audit Logging** - All changes are logged with user ID and details

---

### Common Use Cases

#### 1. Welcome Message
```json
{
  "title": "Welcome to EVU Gaming!",
  "message": "Join our <a href='/discord'>Discord</a> community!",
  "type": "info",
  "target": "all",
  "enabled": true
}
```

#### 2. Scheduled Maintenance
```json
{
  "title": "Scheduled Maintenance",
  "message": "Minecraft server will be offline tomorrow 2-4 AM UTC for updates.",
  "type": "warning",
  "target": "minecraft",
  "start_date": "2025-01-15T00:00:00Z",
  "end_date": "2025-01-16T04:00:00Z"
}
```

#### 3. Service Outage
```json
{
  "title": "Service Disruption",
  "message": "We're experiencing login issues. Our team is working on a fix.",
  "type": "error",
  "target": "all",
  "enabled": true
}
```

#### 4. Issue Resolved
```json
{
  "title": "All Systems Operational",
  "message": "Login issues have been resolved. Thank you for your patience!",
  "type": "success",
  "target": "all",
  "enabled": true
}
```

#### 5. Event Announcement
```json
{
  "title": "Double XP Weekend!",
  "message": "Earn 2x XP this weekend on FiveM!",
  "type": "success",
  "target": "fivem",
  "start_date": "2025-01-20T00:00:00Z",
  "end_date": "2025-01-21T23:59:59Z"
}
```

---

### Testing

#### Manual Testing

1. **Create announcement**:
   - Login to admin panel
   - Create announcement with each type
   - Verify styling matches type

2. **Targeting**:
   - Create `target: "minecraft"` announcement
   - Verify it only shows on Minecraft pages
   - Verify `target: "all"` shows everywhere

3. **Scheduling**:
   - Create future announcement
   - Verify it doesn't show yet
   - Update start_date to now
   - Verify it appears

4. **Dismissal**:
   - Dismiss an announcement
   - Refresh page - should stay dismissed
   - Clear localStorage
   - Verify announcement reappears

#### API Testing

```bash
# Get active announcements
curl http://localhost:3000/api/announcements?target=all

# Create announcement (requires auth + CSRF)
curl -X POST http://localhost:3000/api/announcements \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -H "Cookie: sessionId=your-session" \
  -d '{
    "title": "Test",
    "message": "Testing API",
    "type": "info",
    "target": "all"
  }'
```

---

### Troubleshooting

**Announcements not showing**:
1. Check `enabled = true`
2. Check `start_date` hasn't passed
3. Check `end_date` hasn't expired
4. Check RLS policies allow public read
5. Check browser localStorage for dismissed IDs

**Can't create announcements**:
1. Verify admin authentication
2. Check `settings.edit` permission
3. Verify CSRF token is valid
4. Check browser console for errors

**Styling issues**:
1. Verify CSS module is loaded
2. Check for CSS conflicts
3. Test in different browsers
4. Check responsive breakpoints

---

### Roadmap

Potential future enhancements:

- [ ] User-specific dismissal tracking (database)
- [ ] Announcement templates
- [ ] Recurring announcements
- [ ] Multi-language support
- [ ] In-app notification center
- [ ] Email notifications for critical announcements
- [ ] Discord integration for announcement sync
- [ ] Analytics (views, dismissals, click-through rates)

---

### Related Documentation

- [Database Setup](../database/announcements-table.sql)
- [API Reference](../api/announcements-api.md)
- [Admin Panel Guide](../guides/admin-panel.md)
- [Security Best Practices](../security/best-practices.md)

---

**Last Updated**: 2025-01-15
**Version**: v3.2.3
**Maintained By**: EVU Development Team
