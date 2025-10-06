-- =====================================================
-- EVU Website - Dual Server Migration (Minecraft + FiveM)
-- =====================================================
-- Run this SQL in Supabase SQL Editor to add support for both servers

-- Update the site_content to include both Minecraft and FiveM servers
UPDATE site_content
SET content = '{
  "servers": {
    "minecraft": {
      "enabled": true,
      "name": "EVU Minecraft",
      "title": "Welcome to EVU Minecraft Server",
      "subtitle": "Survival & Creative Minecraft Experience",
      "version": "1.20.4",
      "serverIP": "play.evu-server.com",
      "port": "25565",
      "isOnline": true,
      "maxPlayers": 100,
      "currentPlayers": 0,
      "uptime": "99.9%",
      "features": [
        {
          "icon": "⛏️",
          "title": "Survival Mode",
          "description": "Classic survival experience with custom plugins and events"
        },
        {
          "icon": "🏗️",
          "title": "Creative Building",
          "description": "Unlimited creativity with WorldEdit and custom plots"
        },
        {
          "icon": "💎",
          "title": "Economy System",
          "description": "Player-driven economy with shops and trading"
        },
        {
          "icon": "🎯",
          "title": "Mini Games",
          "description": "Various mini-games including SkyWars, BedWars, and more"
        }
      ]
    },
    "fivem": {
      "enabled": true,
      "name": "EVU FiveM",
      "title": "Welcome to EVU FiveM Server",
      "subtitle": "QBCore Roleplay Experience",
      "version": "QBCore v1.0",
      "serverIP": "connect cfx.re/join/xxxxx",
      "port": "",
      "isOnline": true,
      "maxPlayers": 64,
      "currentPlayers": 0,
      "uptime": "99.9%",
      "features": [
        {
          "icon": "🎮",
          "title": "Roleplay",
          "description": "Immersive roleplay experience with custom scripts and scenarios"
        },
        {
          "icon": "👮",
          "title": "Jobs",
          "description": "Multiple job opportunities including police, EMS, mechanics, and more"
        },
        {
          "icon": "🏪",
          "title": "Economy",
          "description": "Balanced economy system with legal and illegal activities"
        },
        {
          "icon": "🚗",
          "title": "Vehicles",
          "description": "Wide variety of vehicles with realistic handling and customization"
        }
      ]
    }
  },
  "general": {
    "discordLink": "https://discord.gg/yourserver",
    "websiteTitle": "EVU Gaming Network",
    "welcomeMessage": "Welcome to EVU - Your Home for Minecraft & FiveM Gaming"
  },
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2024-01-15",
      "changes": {
        "features": [
          "Initial server launch",
          "Dual server support (Minecraft + FiveM)",
          "Unified community platform"
        ],
        "improvements": [
          "Performance optimizations",
          "UI enhancements"
        ],
        "fixes": [
          "Fixed various bugs"
        ]
      }
    }
  ],
  "forumCategories": [
    {
      "name": "Announcements",
      "description": "Official server announcements and updates",
      "topics": 12,
      "posts": 45,
      "serverType": "all"
    },
    {
      "name": "Minecraft Discussion",
      "description": "Talk about our Minecraft server",
      "topics": 85,
      "posts": 456,
      "serverType": "minecraft"
    },
    {
      "name": "FiveM Roleplay",
      "description": "Discuss FiveM roleplay experiences",
      "topics": 71,
      "posts": 436,
      "serverType": "fivem"
    },
    {
      "name": "General Discussion",
      "description": "General chat about both servers",
      "topics": 156,
      "posts": 892,
      "serverType": "all"
    },
    {
      "name": "Support",
      "description": "Get help with server issues",
      "topics": 78,
      "posts": 324,
      "serverType": "all"
    },
    {
      "name": "Suggestions",
      "description": "Suggest new features and improvements",
      "topics": 43,
      "posts": 167,
      "serverType": "all"
    }
  ]
}'::jsonb
WHERE id = 1;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
--
-- What was added:
-- - servers.minecraft: Full Minecraft server configuration
-- - servers.fivem: Full FiveM server configuration
-- - general: Shared settings (Discord, website title, welcome message)
-- - Forum categories now have serverType field (minecraft/fivem/all)
-- - Each server has independent status, features, and settings
--
-- Next steps:
-- 1. Update your application to use the new structure
-- 2. Test both server displays on homepage
-- 3. Update admin panel to manage both servers separately
-- =====================================================
