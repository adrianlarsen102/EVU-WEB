import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { createTicketReply, getTicketReplies, getTicketById } from '../../../lib/database';
import { sendTicketReplyEmail } from '../../../lib/email';

export default async function handler(req, res) {
  // GET - Get replies for a ticket
  if (req.method === 'GET') {
    const { ticketId } = req.query;

    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID required' });
    }

    const replies = await getTicketReplies(ticketId);
    return res.status(200).json(replies);
  }

  // POST - Create new reply
  if (req.method === 'POST') {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { ticketId, message } = req.body;

    if (!ticketId || !message) {
      return res.status(400).json({ error: 'Ticket ID and message are required' });
    }

    if (message.length < 1 || message.length > 5000) {
      return res.status(400).json({ error: 'Message must be between 1 and 5000 characters' });
    }

    const result = await createTicketReply(
      ticketId,
      session.adminId,
      session.username,
      session.isAdmin,
      message
    );

    if (result.success) {
      // Send notification email to ticket author if they have an email
      try {
        const ticket = await getTicketById(ticketId);
        if (ticket && ticket.author_email) {
          // Only notify if the reply author is different from ticket author
          if (ticket.author_id !== session.adminId) {
            await sendTicketReplyEmail(
              ticket.author_email,
              ticket.ticket_number,
              session.username,
              session.isAdmin
            );
          }
        }
      } catch (emailError) {
        console.error('Failed to send reply notification email:', emailError);
      }

      return res.status(201).json(result.reply);
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
