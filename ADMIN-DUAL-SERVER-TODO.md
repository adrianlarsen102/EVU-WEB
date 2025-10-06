# Admin Panel Dual-Server Update TODO

## Current Structure
The admin panel currently manages a single-server setup with these tabs:
- Server Info (name, title, subtitle, version)
- Features (list of features)
- Join Info (server IP, Discord link)
- Changelog (version history)
- Forum (forum categories)
- Users (user management)

## Required Updates for Dual-Server Support

### 1. Add Server Selector
Add a dropdown/tabs at the top of admin panel to switch between:
- General Settings (shared: Discord, website title)
- Minecraft Server
- FiveM Server

### 2. Update Each Tab

#### Server Info Tab
- Split into Minecraft and FiveM sections
- Each server should have:
  - name (e.g., "EVU Minecraft")
  - title (hero title)
  - subtitle (hero subtitle)
  - version (e.g., "1.20.4" or "QBCore v1.0")
  - serverIP (e.g., "play.server.com" or "connect cfx.re/join/xxxxx")
  - port (for Minecraft, e.g., "25565")
  - isOnline (toggle)
  - maxPlayers (number)
  - currentPlayers (number)
  - uptime (percentage)
  - enabled (toggle to show/hide server)

#### Features Tab
- Split into Minecraft and FiveM feature lists
- Each feature has: icon, title, description
- Separate management for each server

#### Join Info Tab
- Combine into General Settings
- Manage Discord link (shared)
- Manage website title and welcome message

#### Forum Tab
- Add serverType field to each category (minecraft/fivem/all)
- Filter/organize by server type

#### Changelog & Users Tabs
- Keep as-is (these are shared across servers)

### 3. New Data Structure

The content should follow the structure in `supabase-dual-server-migration.sql`:

```json
{
  "servers": {
    "minecraft": { ...config },
    "fivem": { ...config }
  },
  "general": {
    "discordLink": "...",
    "websiteTitle": "...",
    "welcomeMessage": "..."
  },
  "changelog": [...],
  "forumCategories": [...]
}
```

### 4. Implementation Steps

1. Add server selector state (general/minecraft/fivem)
2. Update Server Info tab to show selected server config
3. Update Features tab to show selected server features
4. Update Join Info to General Settings
5. Add serverType selector to Forum category editor
6. Update save function to preserve new structure
7. Add migration helper to convert old structure to new

### 5. Backward Compatibility

The admin panel should:
- Detect if using old structure (no `servers` field)
- Offer to migrate to new structure
- Still work with old structure for viewing

## Priority

This is a significant refactor. For now, admins can:
1. Run the SQL migration manually in Supabase
2. Edit content directly in Supabase dashboard
3. Use the admin panel for changelog, forum, and user management

A future update should implement the full dual-server admin interface.
