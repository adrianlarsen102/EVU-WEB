import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import {
  createForumComment,
  getCommentsByTopic,
  getCommentById,
  getTopicById,
  updateComment,
  deleteCommentSoft,
  incrementCategoryPostCount
} from '../../../lib/database';
import { rateLimiters } from '../../../lib/rateLimit';
import { requireCSRFToken } from '../../../lib/csrf';
import { sanitizeHTML } from '../../../lib/validation';

export default async function handler(req, res) {
  // Apply rate limiting for POST requests (creating comments)
  if (req.method === 'POST') {
    const rateLimitResult = await rateLimiters.forumComment(req, res, null);
    if (rateLimitResult !== true) return;
  }

  // GET - Get comments by topic
  if (req.method === 'GET') {
    const { topicId, limit, offset, page } = req.query;

    if (!topicId) {
      return res.status(400).json({ error: 'Topic ID required' });
    }

    // Parse pagination parameters
    const paginationOptions = {};

    // Support both offset-based and page-based pagination
    if (page !== undefined) {
      const pageNum = parseInt(page) || 1;
      const perPage = parseInt(limit) || 50;
      paginationOptions.limit = perPage;
      paginationOptions.offset = (pageNum - 1) * perPage;
    } else {
      if (limit !== undefined) paginationOptions.limit = parseInt(limit) || 50;
      if (offset !== undefined) paginationOptions.offset = parseInt(offset) || 0;
    }

    const result = await getCommentsByTopic(topicId, paginationOptions);
    return res.status(200).json(result);
  }

  // POST - Create new comment (requires authentication)
  if (req.method === 'POST') {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // CSRF protection for POST requests
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
    }

    const { topicId, content } = req.body;

    if (!topicId || !content) {
      return res.status(400).json({ error: 'Topic ID and content are required' });
    }

    // Sanitize content
    const sanitizedContent = sanitizeHTML(content);

    if (sanitizedContent.length < 1 || sanitizedContent.length > 5000) {
      return res.status(400).json({ error: 'Content must be between 1 and 5000 characters' });
    }

    const result = await createForumComment(
      topicId,
      sanitizedContent,
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

    // CSRF protection
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
    }

    const { commentId, content } = req.body;

    if (!commentId || !content) {
      return res.status(400).json({ error: 'Comment ID and content are required' });
    }

    if (content.length < 1 || content.length > 5000) {
      return res.status(400).json({ error: 'Content must be between 1 and 5000 characters' });
    }

    // SECURITY: Verify comment ownership before allowing edit
    const comment = await getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only allow edit if user owns the comment OR is an admin
    if (comment.author_id !== session.adminId && !session.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own comments' });
    }

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

    // CSRF protection
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
    }

    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID required' });
    }

    // SECURITY: Verify comment ownership before allowing deletion
    const comment = await getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only allow deletion if user owns the comment OR is an admin
    if (comment.author_id !== session.adminId && !session.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own comments' });
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
