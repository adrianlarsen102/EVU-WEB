import { getSupabaseClient } from '../../lib/database';

const supabase = getSupabaseClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch content from Supabase database
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Supabase error fetching status:', error);
      return res.status(500).json({ error: 'Failed to read status from database' });
    }

    if (!data || !data.content) {
      return res.status(404).json({ error: 'No content found in database' });
    }

    // Return server status from content
    // Support both dual-server structure and legacy single-server
    const content = data.content;
    const serverStatus = content.serverStatus || content.servers || {};

    res.status(200).json(serverStatus);
  } catch (error) {
    console.error('Status API error:', error);
    res.status(500).json({ error: 'Failed to read status' });
  }
}
