/**
 * Initialize Supabase site_content table with default content
 * Run this script if the database is empty or needs to be reset
 *
 * Usage: node scripts/init-content.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: Missing environment variables!');
  console.error('Please ensure .env.local file exists with:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Default content structure
const defaultContent = {
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
};

async function initializeContent() {
  console.log('🔄 Initializing site content...');

  try {
    // Check if content already exists
    const { data: existing, error: checkError } = await supabase
      .from('site_content')
      .select('id')
      .eq('id', 1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      console.log('⚠️  Content already exists in database!');
      console.log('Do you want to overwrite it? (This will reset all content)');
      console.log('To proceed, run: node scripts/init-content.js --force');

      if (!process.argv.includes('--force')) {
        console.log('❌ Aborted. Use --force to overwrite existing content.');
        process.exit(0);
      }

      console.log('🔄 Overwriting existing content...');
      const { error: updateError } = await supabase
        .from('site_content')
        .update({
          content: defaultContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (updateError) throw updateError;
      console.log('✅ Content updated successfully!');
    } else {
      console.log('📝 Creating new content entry...');
      const { error: insertError } = await supabase
        .from('site_content')
        .insert([
          {
            id: 1,
            content: defaultContent
          }
        ]);

      if (insertError) throw insertError;
      console.log('✅ Content created successfully!');
    }

    console.log('\n✅ Site content initialized!');
    console.log('\nNext steps:');
    console.log('1. Visit your site to verify it works');
    console.log('2. Login to /admin to customize the content');
    console.log('3. Update server IPs and settings');

  } catch (error) {
    console.error('❌ Error initializing content:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    process.exit(1);
  }
}

// Run the initialization
initializeContent();
