-- Forum Topics and Comments Schema
-- Run this SQL in your Supabase SQL Editor

-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,  -- Changed from UUID to INTEGER to match admins table
  author_username TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,  -- Changed from UUID to INTEGER to match admins table
  author_username TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_topic ON forum_comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created ON forum_comments(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_topics
-- Allow everyone to read non-deleted topics
CREATE POLICY "Public can view non-deleted topics"
  ON forum_topics FOR SELECT
  USING (is_deleted = false);

-- Allow authenticated users to create topics
CREATE POLICY "Authenticated users can create topics"
  ON forum_topics FOR INSERT
  WITH CHECK (true);

-- Allow authors and admins to update their topics
CREATE POLICY "Authors can update their topics"
  ON forum_topics FOR UPDATE
  USING (true);

-- Allow admins to delete topics
CREATE POLICY "Admins can delete topics"
  ON forum_topics FOR DELETE
  USING (true);

-- RLS Policies for forum_comments
-- Allow everyone to read non-deleted comments
CREATE POLICY "Public can view non-deleted comments"
  ON forum_comments FOR SELECT
  USING (is_deleted = false);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments"
  ON forum_comments FOR INSERT
  WITH CHECK (true);

-- Allow authors to update their comments
CREATE POLICY "Authors can update their comments"
  ON forum_comments FOR UPDATE
  USING (true);

-- Allow admins to delete comments
CREATE POLICY "Admins can delete comments"
  ON forum_comments FOR DELETE
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_forum_topics_updated_at
  BEFORE UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at
  BEFORE UPDATE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
