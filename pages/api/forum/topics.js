import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import {
  createForumTopic,
  getTopicsByCategory,
  getTopicById,
  updateTopic,
  deleteTopicSoft,
  incrementCategoryTopicCount
} from '../../../lib/database';
import { rateLimiters } from '../../../lib/rateLimit';
import { requireCSRFToken } from '../../../lib/csrf';
import { sanitizeString, sanitizeHTML } from '../../../lib/validation';

export default async function handler(req, res) {
  // Apply rate limiting for POST requests (creating topics)
  if (req.method === 'POST') {
    const rateLimitResult = await rateLimiters.forumPost(req, res, null);
    if (rateLimitResult !== true) return;
  }

  // GET - Get topics by category or specific topic by ID
  if (req.method === 'GET') {
    const { categoryId, topicId } = req.query;

    if (topicId) {
      const topic = await getTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      return res.status(200).json(topic);
    }

    if (categoryId) {
      const topics = await getTopicsByCategory(parseInt(categoryId));
      return res.status(200).json(topics);
    }

    return res.status(400).json({ error: 'Category ID or Topic ID required' });
  }

  // POST - Create new topic (requires authentication)
  if (req.method === 'POST') {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { categoryId, title, content } = req.body;

    if (categoryId === undefined || categoryId === null || !title || !content) {
      return res.status(400).json({ error: 'Category ID, title, and content are required' });
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedContent = sanitizeHTML(content);

    if (sanitizedTitle.length < 3 || sanitizedTitle.length > 200) {
      return res.status(400).json({ error: 'Title must be between 3 and 200 characters' });
    }

    if (sanitizedContent.length < 10 || sanitizedContent.length > 10000) {
      return res.status(400).json({ error: 'Content must be between 10 and 10000 characters' });
    }

    const result = await createForumTopic(
      categoryId,
      sanitizedTitle,
      sanitizedContent,
      session.adminId,
      session.username
    );

    if (result.success) {
      // Increment the category topic counter
      await incrementCategoryTopicCount(categoryId);

      return res.status(201).json(result.topic);
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  // PUT - Update topic (requires authentication and ownership or admin)
  if (req.method === 'PUT') {
    try {
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

      const { topicId, title, content, isPinned, isLocked } = req.body;

      if (!topicId) {
        return res.status(400).json({ error: 'Topic ID required' });
      }

      // Get the topic to check ownership
      const topic = await getTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      // Only author or admin can update
      if (topic.author_id !== session.adminId && !session.isAdmin) {
        return res.status(403).json({ error: 'Forbidden: You can only edit your own topics' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;

      // Only admins can pin or lock topics
      if (session.isAdmin) {
        if (isPinned !== undefined) updates.is_pinned = isPinned;
        if (isLocked !== undefined) updates.is_locked = isLocked;
      }

      const result = await updateTopic(topicId, updates);

      if (result.success) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(500).json({ error: result.error });
      }
    } catch (error) {
      console.error('Error updating forum topic:', error);
      return res.status(500).json({ error: 'Failed to update topic' });
    }
  }

  // DELETE - Soft delete topic (requires authentication and ownership or admin)
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

    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({ error: 'Topic ID required' });
    }

    // Get the topic to check ownership
    const topic = await getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Only author or admin can delete
    if (topic.author_id !== session.adminId && !session.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own topics' });
    }

    const result = await deleteTopicSoft(topicId);

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
