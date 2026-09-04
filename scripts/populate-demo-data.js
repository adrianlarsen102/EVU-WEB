require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateDemoData() {
  console.log('--- Populating Demo Data ---');

  // 1. Fetch an admin to use as the author
  const { data: adminData } = await supabase.from('admins').select('*').limit(1).single();
  let authorId = adminData?.id || 1;
  let authorUsername = adminData?.username || 'Admin';

  // 2. Add User Roles
  console.log('Adding User Roles...');
  const roles = [
    { name: 'Admin', description: 'Full system access', is_system: true, permissions: ['*'] },
    { name: 'Moderator', description: 'Can moderate forums and tickets', is_system: false, permissions: ['moderate_forum', 'manage_tickets'] },
    { name: 'User', description: 'Standard user access', is_system: true, permissions: ['read', 'write'] }
  ];
  
  for (const role of roles) {
    await supabase.from('user_roles').upsert(role, { onConflict: 'name' });
  }

  // 3. Populate site_content with Categories & Features if they don't exist
  console.log('Updating Site Content (Features & Categories)...');
  const { data: contentData } = await supabase.from('site_content').select('content').eq('id', 1).single();
  let content = contentData?.content || {};

  // Add dummy features
  if (!content.features || content.features.length === 0) {
    content.features = [
      { icon: '🚀', title: 'High Performance', description: 'Our servers run on the latest hardware.' },
      { icon: '🛡️', title: 'DDoS Protection', description: 'Always online and fully protected.' },
      { icon: '🌍', title: 'Global Community', description: 'Join thousands of players worldwide.' }
    ];
  }

  // Add forum categories
  if (!content.forumCategories || content.forumCategories.length === 0) {
    content.forumCategories = [
      { name: 'General Discussion', description: 'Talk about anything related to the server', icon: '💬', topics: 1, posts: 1, serverType: 'all', visibility: 'public', permissions: 'all', order: 0 },
      { name: 'News & Announcements', description: 'Official server news and updates', icon: '📢', topics: 0, posts: 0, serverType: 'all', visibility: 'public', permissions: 'admin', order: 1 },
      { name: 'Minecraft Server', description: 'Discussion specific to the Minecraft server', icon: '🎮', topics: 0, posts: 0, serverType: 'minecraft', visibility: 'public', permissions: 'all', order: 2 },
      { name: 'FiveM Server', description: 'Discussion specific to the FiveM server', icon: '🚓', topics: 0, posts: 0, serverType: 'fivem', visibility: 'public', permissions: 'all', order: 3 },
      { name: 'Support', description: 'Get help from the community and staff', icon: '❓', topics: 0, posts: 0, serverType: 'all', visibility: 'public', permissions: 'all', order: 4 }
    ];
  }

  await supabase.from('site_content').update({ content }).eq('id', 1);

  // 4. Add Dummy Forum Topics
  console.log('Adding Forum Topics & Comments...');
  const topics = [
    { category_id: 0, title: 'Welcome to EVU Gaming Network!', content: 'We are glad to have you here. Introduce yourself below!', author_id: authorId, author_username: authorUsername, is_pinned: true },
    { category_id: 1, title: 'Minecraft Season 2 is starting soon!', content: 'Get ready for the new map reset and fresh start.', author_id: authorId, author_username: authorUsername },
    { category_id: 2, title: 'FiveM Server Rules Update', content: 'Please review the updated roleplay rules in our discord.', author_id: authorId, author_username: authorUsername },
    { category_id: 3, title: 'Maintenance Window Scheduled', content: 'We will have a brief downtime this weekend for upgrades.', author_id: authorId, author_username: authorUsername }
  ];

  for (const topic of topics) {
    // Check if topic exists
    const { data: existing } = await supabase.from('forum_topics').select('id').eq('title', topic.title).single();
    if (!existing) {
      const { data: newTopic } = await supabase.from('forum_topics').insert(topic).select().single();
      if (newTopic) {
        // Add a demo comment
        await supabase.from('forum_comments').insert({
          topic_id: newTopic.id,
          content: 'Awesome! Thanks for the update.',
          author_id: authorId,
          author_username: authorUsername
        });
      }
    }
  }

  console.log('✅ Demo Data Populated Successfully!');
}

populateDemoData().catch(console.error);
