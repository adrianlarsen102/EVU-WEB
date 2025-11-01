import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import {
  createSupportTicket,
  getAllTickets,
  getTicketById,
  getTicketsByUser,
  updateTicket
} from '../../../lib/database';
import { sendTicketCreatedEmail, sendAdminTicketNotification, sendTicketStatusEmail } from '../../../lib/email';
import { rateLimiters } from '../../../lib/rateLimit';

export default async function handler(req, res) {
  // Apply rate limiting for POST requests (creating tickets)
  if (req.method === 'POST') {
    const rateLimitResult = await rateLimiters.supportTicket(req, res, null);
    if (rateLimitResult !== true) return;
  }

  // GET - Get all tickets (admin) or user's tickets
  if (req.method === 'GET') {
    const { ticketId } = req.query;
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    // Get specific ticket
    if (ticketId) {
      const ticket = await getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Check if user has access to this ticket
      if (session && !session.isAdmin && ticket.author_id !== session.adminId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json(ticket);
    }

    // Admin gets all tickets, users get their own
    if (session) {
      if (session.isAdmin) {
        const tickets = await getAllTickets();
        return res.status(200).json(tickets);
      } else {
        const tickets = await getTicketsByUser(session.adminId);
        return res.status(200).json(tickets);
      }
    }

    return res.status(401).json({ error: 'Unauthorized' });
  }

  // POST - Create new ticket
  if (req.method === 'POST') {
    const { subject, description, category, priority, email } = req.body;

    if (!subject || !description || !category) {
      return res.status(400).json({ error: 'Subject, description, and category are required' });
    }

    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    let authorId = null;
    let authorUsername = 'Guest';
    let authorEmail = email || null;

    if (session) {
      authorId = session.adminId;
      authorUsername = session.username;
    }

    const result = await createSupportTicket(
      subject,
      description,
      category,
      priority || 'medium',
      authorId,
      authorUsername,
      authorEmail
    );

    if (result.success) {
      const ticket = result.ticket;

      // Send confirmation email to user if email provided
      if (authorEmail) {
        try {
          await sendTicketCreatedEmail(authorEmail, ticket.ticket_number, ticket.subject);
        } catch (emailError) {
          console.error('Failed to send ticket created email:', emailError);
        }
      }

      // Send notification to admin if configured
      try {
        const { getEmailSettings } = require('../../../lib/database');
        const settingsResult = await getEmailSettings();
        if (settingsResult.success && settingsResult.settings.admin_email) {
          await sendAdminTicketNotification(
            settingsResult.settings.admin_email,
            ticket.ticket_number,
            ticket.subject,
            authorUsername
          );
        }
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }

      return res.status(201).json(ticket);
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  // PUT - Update ticket (status, priority, assignment, etc.)
  if (req.method === 'PUT') {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { ticketId, status, priority, assignedTo, adminNotes } = req.body;

    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID required' });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    if (status === 'closed') {
      updates.closed_at = new Date().toISOString();
    }

    const result = await updateTicket(ticketId, updates);

    if (result.success) {
      // Send status change email if status changed and user has email
      if (status !== undefined) {
        try {
          const ticket = await getTicketById(ticketId);
          if (ticket && ticket.author_email) {
            await sendTicketStatusEmail(ticket.author_email, ticket.ticket_number, status);
          }
        } catch (emailError) {
          console.error('Failed to send status change email:', emailError);
        }
      }

      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
