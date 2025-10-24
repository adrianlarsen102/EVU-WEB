import { createClient } from '@supabase/supabase-js';
import { rateLimiters } from '../../lib/rateLimit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  const rateLimitResult = await rateLimiters.read(req, res, null);
  if (rateLimitResult !== true) {
    return; // Rate limit response already sent
  }

  const { q, type = 'all', limit = 20 } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  try {
    const results = {
      forum: {
        topics: [],
        comments: []
      },
      users: [],
      changelog: []
    };

    const searchTerm = `%${q}%`;

    // Search forum topics
    if (type === 'all' || type === 'forum') {
      try {
        const { data: topics, error: topicsError } = await supabase
          .from('forum_topics')
          .select('id, title, content, created_at, author_username, category_id, views_count')
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));

        if (!topicsError && topics) {
          results.forum.topics = topics;
        }
      } catch (error) {
        console.error('Forum topics search error:', error);
      }

      // Search forum comments
      try {
        const { data: comments, error: commentsError } = await supabase
          .from('forum_comments')
          .select('id, content, created_at, author_username, topic_id')
          .ilike('content', searchTerm)
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));

        if (!commentsError && comments) {
          results.forum.comments = comments;
        }
      } catch (error) {
        console.error('Forum comments search error:', error);
      }
    }

    // Search users (SECURITY: Require authentication for user search)
    if ((type === 'all' || type === 'users')) {
      // SECURITY FIX: Only allow authenticated users to search users
      // Get session to verify authentication
      const { validateSession, getSessionFromCookie } = require('../../lib/auth');
      const sessionId = getSessionFromCookie(req.headers.cookie);
      const session = sessionId ? await validateSession(sessionId) : null;

      if (session) {
        // Authenticated users can search users
        try {
          const { data: users, error: usersError } = await supabase
            .from('admins')
            .select('id, username, display_name, created_at, role')
            .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
            .limit(parseInt(limit));

          if (!usersError && users) {
            // Filter sensitive information based on user role
            results.users = users.map(user => ({
              id: user.id,
              username: user.username,
              display_name: user.display_name,
              // Only show role if requester is admin
              role: session.isAdmin ? user.role : undefined
            }));
          }
        } catch (error) {
          console.error('Users search error:', error);
        }
      } else {
        // Unauthenticated users get empty results
        results.users = [];
      }
    }

    // Search site content for changelog
    if (type === 'all' || type === 'changelog') {
      try {
        const { data: content, error: contentError } = await supabase
          .from('site_content')
          .select('content')
          .eq('id', 1)
          .single();

        if (!contentError && content && content.content.changelog) {
          const filteredChangelog = content.content.changelog.filter(entry => {
            const searchLower = q.toLowerCase();
            return (
              entry.version.toLowerCase().includes(searchLower) ||
              entry.changes.features?.some(f => f.toLowerCase().includes(searchLower)) ||
              entry.changes.improvements?.some(i => i.toLowerCase().includes(searchLower)) ||
              entry.changes.fixes?.some(f => f.toLowerCase().includes(searchLower))
            );
          }).slice(0, parseInt(limit));

          results.changelog = filteredChangelog;
        }
      } catch (error) {
        console.error('Changelog search error:', error);
      }
    }

    // Calculate total results
    const totalResults =
      results.forum.topics.length +
      results.forum.comments.length +
      results.users.length +
      results.changelog.length;

    res.status(200).json({
      query: q,
      totalResults,
      results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}
