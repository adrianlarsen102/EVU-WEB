-- Initialize site_content table with default content
-- Run this in Supabase SQL Editor if npm run db:init doesn't work

-- First, ensure the table exists and insert default content
INSERT INTO site_content (id, content)
VALUES (
  1,
  '{
    "general": {
      "websiteTitle": "EVU Gaming Network",
      "welcomeMessage": "Welcome to EVU Gaming",
      "discordLink": "https://discord.gg/yourserver"
    },
    "servers": {
      "minecraft": {
        "enabled": true,
        "name": "EVU Minecraft",
        "serverIP": "play.evu.com",
        "port": "25565",
        "isOnline": true,
        "currentPlayers": 0,
        "maxPlayers": 100,
        "uptime": "99.9%",
        "version": "1.20.4",
        "features": [
          {
            "icon": "⛏️",
            "title": "Survival Mode",
            "description": "Classic survival experience"
          },
          {
            "icon": "🏰",
            "title": "Custom Builds",
            "description": "Build your dreams"
          },
          {
            "icon": "👥",
            "title": "Community",
            "description": "Friendly player base"
          }
        ]
      },
      "fivem": {
        "enabled": true,
        "name": "EVU Roleplay",
        "serverIP": "connect cfx.re/join/xxxxx",
        "isOnline": true,
        "currentPlayers": 0,
        "maxPlayers": 64,
        "uptime": "99.5%",
        "version": "QBCore 1.0",
        "features": [
          {
            "icon": "🎮",
            "title": "Roleplay",
            "description": "Immersive RP experience"
          },
          {
            "icon": "🚔",
            "title": "Custom Jobs",
            "description": "Police, EMS, and more"
          },
          {
            "icon": "💼",
            "title": "Economy",
            "description": "Realistic economy system"
          }
        ]
      }
    },
    "changelog": [],
    "forumCategories": [
      {
        "id": "general",
        "name": "General Discussion",
        "description": "General chat and discussions",
        "icon": "💬",
        "serverType": "all",
        "topics": 0,
        "posts": 0
      },
      {
        "id": "minecraft",
        "name": "Minecraft",
        "description": "Minecraft server discussions",
        "icon": "⛏️",
        "serverType": "minecraft",
        "topics": 0,
        "posts": 0
      },
      {
        "id": "fivem",
        "name": "FiveM",
        "description": "FiveM server discussions",
        "icon": "🎮",
        "serverType": "fivem",
        "topics": 0,
        "posts": 0
      },
      {
        "id": "support",
        "name": "Support",
        "description": "Get help and support",
        "icon": "❓",
        "serverType": "all",
        "topics": 0,
        "posts": 0
      }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();

-- Verify the insert
SELECT id, updated_at,
       content->>'general' as general_info,
       jsonb_array_length(content->'forumCategories') as forum_categories_count
FROM site_content
WHERE id = 1;
