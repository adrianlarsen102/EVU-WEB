import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import {
  getAllTopicsForModeration,
  getAllCommentsForModeration,
  updateTopic,
  deleteTopicSoft,
  updateComment,
  deleteCommentSoft
} from '../../../lib/database';

export default async function handler(req, res) {
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // GET - Get all topics and comments for moderation
  if (req.method === 'GET') {
    const { type } = req.query;

    if (type === 'topics') {
      const topics = await getAllTopicsForModeration();
      return res.status(200).json(topics);
    }

    if (type === 'comments') {
      const comments = await getAllCommentsForModeration();
      return res.status(200).json(comments);
    }

    return res.status(400).json({ error: 'Type parameter required (topics or comments)' });
  }

  // POST - Moderate content (pin, lock, delete)
  if (req.method === 'POST') {
    const { action, targetType, targetId, value } = req.body;

    if (!action || !targetType || !targetId) {
      return res.status(400).json({ error: 'Action, target type, and target ID required' });
    }

    if (targetType === 'topic') {
      if (action === 'pin') {
        const result = await updateTopic(targetId, { is_pinned: value });
        return res.status(200).json(result);
      }

      if (action === 'lock') {
        const result = await updateTopic(targetId, { is_locked: value });
        return res.status(200).json(result);
      }

      if (action === 'delete') {
        const result = await deleteTopicSoft(targetId);
        return res.status(200).json(result);
      }

      if (action === 'restore') {
        const result = await updateTopic(targetId, { is_deleted: false });
        return res.status(200).json(result);
      }
    }

    if (targetType === 'comment') {
      if (action === 'delete') {
        const result = await deleteCommentSoft(targetId);
        return res.status(200).json(result);
      }

      if (action === 'restore') {
        const result = await updateComment(targetId, { is_deleted: false });
        return res.status(200).json(result);
      }
    }

    return res.status(400).json({ error: 'Invalid action or target type' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
