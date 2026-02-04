import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function TicketDetail() {
  const router = useRouter();
  const { ticketId } = router.query;
  const [auth, setAuth] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setAuth(data);
    } catch {
      setAuth({ authenticated: false });
    }
  }, []);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/support/tickets?ticketId=${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      } else {
        router.push('/support');
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
    }
    setLoading(false);
  }, [ticketId, router]);

  const fetchReplies = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/replies?ticketId=${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setReplies(data);
      }
    } catch (error) {
      console.error('Failed to load replies:', error);
    }
  }, [ticketId]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      fetchReplies();
    }
  }, [ticketId, fetchTicket, fetchReplies]);

  const handlePostReply = async (e) => {
    e.preventDefault();

    if (!newReply.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      const res = await fetch('/api/support/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          message: newReply
        })
      });

      if (res.ok) {
        setNewReply('');
        fetchReplies();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#00ff88';
      case 'in-progress': return '#ffaa00';
      case 'closed': return '#ff6b6b';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <Layout title="EVU - Loading...">
        <div className="container main-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
          Loading ticket...
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout title="EVU - Ticket Not Found">
        <div className="container main-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Ticket Not Found</h2>
          <Link href="/support" style={{ color: 'var(--primary-color)' }}>
            Return to Support
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`EVU - Ticket #${ticket.ticket_number}`}>
      <div className="hero">
        <div className="container">
          <h1>Ticket #{ticket.ticket_number}</h1>
          <p>{ticket.subject}</p>
        </div>
      </div>

      <div className="container main-content">
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/support" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            ← Back to Support
          </Link>
        </div>

        {/* Ticket Info */}
        <div className="connection-box" style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Ticket Details</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <p>Created by {ticket.author_username} • {formatDate(ticket.created_at)}</p>
                <p>Category: {ticket.category} • Priority: {ticket.priority}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontWeight: 'bold',
                background: ticket.status === 'open' ? 'rgba(0, 255, 136, 0.2)' : ticket.status === 'in-progress' ? 'rgba(255, 170, 0, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                color: getStatusColor(ticket.status)
              }}>
                {ticket.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--card-bg)', borderRadius: '8px', border: '2px solid rgba(0, 212, 255, 0.3)' }}>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{ticket.description}</p>
          </div>
        </div>

        {/* Replies Section */}
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Conversation ({replies.length})</h3>

        {!auth?.authenticated && (
          <div className="connection-box" style={{ marginBottom: '2rem' }}>
            <p>
              <Link href="/profile" style={{ color: 'var(--primary-color)' }}>
                Log in
              </Link> to reply to this ticket
            </p>
          </div>
        )}

        {auth?.authenticated && ticket.status !== 'closed' && (
          <div className="connection-box" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Add Reply</h4>
            <form onSubmit={handlePostReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <textarea
                placeholder="Write your reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={4}
                className="form-input"
                style={{ resize: 'vertical', minHeight: '100px' }}
                maxLength={5000}
                required
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                    border: 'none',
                    color: 'var(--dark-bg)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Post Reply
                </button>
              </div>
            </form>
          </div>
        )}

        {ticket.status === 'closed' && (
          <div className="connection-box" style={{ marginBottom: '2rem', background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
            <p>🔒 This ticket is closed. No new replies can be added.</p>
          </div>
        )}

        {replies.length === 0 ? (
          <div className="connection-box">
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              No replies yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {replies.map((reply) => (
              <div key={reply.id} className="forum-category">
                <div className="category-icon">
                  {reply.is_admin ? '👨‍💼' : '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {reply.author_username}
                        {reply.is_admin && (
                          <span style={{ padding: '0.2rem 0.6rem', background: 'var(--accent-color)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            ADMIN
                          </span>
                        )}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {formatDate(reply.created_at)}
                      </p>
                    </div>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginTop: '0.5rem' }}>
                    {reply.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

// Force server-side rendering to avoid Next.js build errors with useRouter
export async function getServerSideProps() {
  return {
    props: {}, // Will be passed to the page component as props
  };
}
