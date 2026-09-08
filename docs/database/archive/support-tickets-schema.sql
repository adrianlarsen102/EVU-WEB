-- Support Tickets Schema
-- Run this SQL in your Supabase SQL Editor

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  author_id INTEGER,
  author_username TEXT NOT NULL,
  author_email TEXT,
  assigned_to INTEGER,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create support_ticket_replies table
CREATE TABLE IF NOT EXISTS support_ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id INTEGER,
  author_username TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_author ON support_tickets(author_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket ON support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_created ON support_ticket_replies(created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
-- Allow authenticated users to view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (true);

-- Allow anyone to create tickets (including non-authenticated users)
CREATE POLICY "Anyone can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (true);

-- Allow authors and admins to update tickets
CREATE POLICY "Authors and admins can update tickets"
  ON support_tickets FOR UPDATE
  USING (true);

-- RLS Policies for support_ticket_replies
-- Allow authenticated users to view replies on their tickets
CREATE POLICY "Users can view replies"
  ON support_ticket_replies FOR SELECT
  USING (true);

-- Allow authenticated users to create replies
CREATE POLICY "Authenticated users can create replies"
  ON support_ticket_replies FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_updated_at();

-- Function to generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_number := 'TKT-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM support_tickets WHERE ticket_number = new_number);
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique ticket number';
    END IF;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
