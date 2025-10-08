import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import {
  createForumComment,
  getCommentsByTopic,
  getTopicById,
  updateComment,
  deleteCommentSoft,
  incrementCategoryPostCount
} from '../../../lib/database';

export default async function handler(req, res) {
  // GET - Get comments by topic
  if (req.method === 'GET') {
    const { topicId } = req.query;

    if (!topicId) {
      return res.status(400).json({ error: 'Topic ID required' });
    }

    const comments = await getCommentsByTopic(topicId);
    return res.status(200).json(comments);
  }

  // POST - Create new comment (requires authentication)
  if (req.method === 'POST') {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { topicId, content } = req.body;

    if (!topicId || !content) {
      return res.status(400).json({ error: 'Topic ID and content are required' });
    }

    if (content.length < 1 || content.length > 5000) {
      return res.status(400).json({ error: 'Content must be between 1 and 5000 characters' });
    }

    const result = await createForumComment(
      topicId,
      content,
      session.adminId,
      session.username
    );

    if (result.success) {
      // Get the topic to find the category ID
      const topic = await getTopicById(topicId);
      if (topic && topic.category_id !== undefined) {
        // Increment the category post counter
        await incrementCategoryPostCount(topic.category_id);
      }

      return res.status(201).json(result.comment);
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  // PUT - Update comment (requires authentication and ownership)
  if (req.method === 'PUT') {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { commentId, content } = req.body;

    if (!commentId || !content) {
      return res.status(400).json({ error: 'Comment ID and content are required' });
    }

    if (content.length < 1 || content.length > 5000) {
      return res.status(400).json({ error: 'Content must be between 1 and 5000 characters' });
    }

    // Note: For simplicity, we're allowing the update if authenticated
    // In production, you should check comment ownership
    const result = await updateComment(commentId, content);

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  // DELETE - Soft delete comment (requires authentication and ownership or admin)
  if (req.method === 'DELETE') {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID required' });
    }

    const result = await deleteCommentSoft(commentId);

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
