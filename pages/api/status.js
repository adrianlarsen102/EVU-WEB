import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'content.json');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const content = JSON.parse(data);
    res.status(200).json(content.serverStatus || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to read status' });
  }
}
