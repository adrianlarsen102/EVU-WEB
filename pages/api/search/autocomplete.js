import { getSupabaseClient } from '../../../lib/database';
import { rateLimiters } from '../../../lib/rateLimit';

const supabase = getSupabaseClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting - more lenient for autocomplete (50/min)
  const autocompleteRateLimit = await rateLimiters.read(req, res, null);
  if (autocompleteRateLimit !== true) {
    return autocompleteRateLimit;
  }

  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  try {
    const searchTerm = `%${q.trim()}%`;
    const limit = 5; // Top 5 per category for quick results

    // Search forum topics (titles only for speed)
    const { data: topics } = await supabase
      .from('forum_topics')
      .select('id, title, category_id')
      .ilike('title', searchTerm)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Search users (usernames and display names)
    const { data: users } = await supabase
      .from('admins')
      .select('id, username, display_name, role')
      .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Search changelog (from site_content)
    const { data: contentData } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', 1)
      .single();

    let changelogResults = [];
    if (contentData?.content?.changelog) {
      changelogResults = contentData.content.changelog
        .filter(entry =>
          entry.version?.toLowerCase().includes(q.toLowerCase()) ||
          JSON.stringify(entry.changes).toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, limit)
        .map(entry => ({
          version: entry.version,
          date: entry.date,
          hasFeatures: entry.changes?.features?.length > 0,
          hasFixes: entry.changes?.fixes?.length > 0
        }));
    }

    // Calculate total results
    const totalResults = (topics?.length || 0) + (users?.length || 0) + changelogResults.length;

    res.status(200).json({
      query: q,
      totalResults,
      suggestions: {
        forum: topics || [],
        users: users || [],
        changelog: changelogResults
      }
    });

  } catch (error) {
    console.error('Autocomplete search error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
}
