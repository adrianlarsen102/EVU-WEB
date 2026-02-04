import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { SkeletonTable } from '../components/LoadingSkeleton';

export default function Support() {
  const [auth, setAuth] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
    email: ''
  });

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setAuth(data);
    } catch {
      setAuth({ authenticated: false });
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    fetchTickets();
  }, [checkAuth, fetchTickets]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    if (!newTicket.subject || !newTicket.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });

      if (res.ok) {
        const ticket = await res.json();
        alert(`Ticket created successfully! Your ticket number is: ${ticket.ticket_number}`);
        setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium', email: '' });
        setShowCreateForm(false);
        fetchTickets();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#00ff88';
      case 'in-progress': return '#ffaa00';
      case 'closed': return '#ff6b6b';
      default: return 'var(--text-secondary)';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'var(--text-secondary)';
      case 'medium': return '#ffaa00';
      case 'high': return '#ff6b6b';
      case 'urgent': return '#ff0000';
      default: return 'var(--text-secondary)';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout title="EVU - Support">
      <div className="hero">
        <div className="container">
          <h1>Support Center</h1>
          <p>Need help? Submit a ticket and our team will assist you!</p>
        </div>
      </div>

      <div className="container main-content">
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>{auth?.authenticated ? 'My Tickets' : 'Submit a Support Ticket'}</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
              border: 'none',
              color: 'var(--dark-bg)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? 'Cancel' : '+ New Ticket'}
          </button>
        </div>

        {showCreateForm && (
          <div className="connection-box" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Create Support Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Subject *</label>
                <input
                  type="text"
                  placeholder="Brief description of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="form-input"
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description *</label>
                <textarea
                  placeholder="Detailed description of your issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={8}
                  className="form-input"
                  style={{ resize: 'vertical', minHeight: '150px' }}
                  maxLength={5000}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category *</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="form-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {!auth?.authenticated && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email (optional)</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={newTicket.email}
                    onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                    className="form-input"
                  />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Provide an email to receive updates about your ticket
                  </p>
                </div>
              )}

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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {auth?.authenticated && (
          <>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Your Support Tickets</h3>
            {loading ? (
              <SkeletonTable rows={3} />
            ) : tickets.length === 0 ? (
              <div className="connection-box">
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  You haven&apos;t submitted any tickets yet. Click &quot;New Ticket&quot; to get started.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/support/${ticket.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="forum-category" style={{ cursor: 'pointer' }}>
                      <div className="category-icon">🎫</div>
                      <div className="category-info" style={{ flex: 1 }}>
                        <h3>
                          {ticket.subject}
                          <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                            #{ticket.ticket_number}
                          </span>
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          {ticket.description.substring(0, 150)}{ticket.description.length > 150 ? '...' : ''}
                        </p>
                        <div className="category-stats" style={{ marginTop: '0.5rem' }}>
                          <span style={{ color: getStatusColor(ticket.status), fontWeight: 'bold' }}>
                            {ticket.status.toUpperCase()}
                          </span>
                          <span style={{ color: getPriorityColor(ticket.priority) }}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                          </span>
                          <span>{ticket.category}</span>
                          <span>{formatDate(ticket.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {!auth?.authenticated && !showCreateForm && (
          <div className="connection-box">
            <h3>Already have a ticket?</h3>
            <p>
              <Link href="/profile" style={{ color: 'var(--primary-color)' }}>
                Log in
              </Link> to view and manage your support tickets.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return { props: {} };
}
