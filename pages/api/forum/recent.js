import { getSupabaseClient } from '../../../lib/database';

const supabase = getSupabaseClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { limit = 5 } = req.query;

  // Cap limit to prevent excessive queries
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);

  try {
    // Fetch recent topics across all categories
    const { data: topics, error } = await supabase
      .from('forum_topics')
      .select('id, title, author_username, created_at, category_id')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(parsedLimit);

    if (error) {
      console.error('Fetch recent topics error:', error);
      return res.status(500).json({ error: 'Failed to fetch recent topics' });
    }

    return res.status(200).json(topics || []);
  } catch (error) {
    console.error('Recent topics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
