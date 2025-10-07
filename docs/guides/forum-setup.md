# Forum System Setup Guide

This guide will help you set up the complete forum system with topics, comments, and admin moderation.

## Overview

The forum system includes:
- **Forum Categories** - Configured in the admin panel
- **Topics** - Created by authenticated users within categories
- **Comments** - Posted by authenticated users on topics
- **Moderation Tools** - Admin panel for moderating content (pin, lock, delete topics and comments)

## Database Setup

### Step 1: Run the SQL Schema

1. Log into your Supabase dashboard
2. Go to the SQL Editor
3. Open the file `docs/database/forum-schema.sql`
4. Copy and paste the entire SQL script into the Supabase SQL editor
5. Click "Run" to execute the schema

This will create:
- `forum_topics` table
- `forum_comments` table
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### Step 2: Verify Tables

Check that the following tables exist in your Supabase database:
- ✅ `admins` (existing)
- ✅ `sessions` (existing)
- ✅ `site_content` (existing)
- ✅ `forum_topics` (new)
- ✅ `forum_comments` (new)

## Admin Panel Configuration

### Step 1: Create Forum Categories

1. Log into the admin panel at `/admin`
2. Go to the **Forum** tab
3. Click "➕ Add Category"
4. Configure each category:
   - **Name**: Category name (e.g., "General Discussion")
   - **Description**: Brief description
   - **Topics**: Initial topic count (set to 0)
   - **Posts**: Initial post count (set to 0)
   - **Server Type**: Choose `all`, `minecraft`, or `fivem` for filtering
5. Click "💾 Save Forum"

**Example Categories:**
```
Name: General Discussion
Description: General chat and community topics
Topics: 0
Posts: 0
Server Type: all

Name: Minecraft Help
Description: Get help with Minecraft-related issues
Topics: 0
Posts: 0
Server Type: minecraft

Name: FiveM Roleplay
Description: Discuss roleplay scenarios and characters
Topics: 0
Posts: 0
Server Type: fivem
```

## User Guide

### Creating Topics

1. Visit the forum at `/forum`
2. Click on a category
3. Click "**+ New Topic**" (requires login)
4. Fill in:
   - **Title**: Topic title (3-200 characters)
   - **Content**: Topic content (10-10,000 characters)
5. Click "**Create Topic**"

### Posting Comments

1. Click on a topic to view it
2. Scroll to the comments section
3. Enter your comment in the text area (1-5,000 characters)
4. Click "**Post Comment**"

### User Permissions

**All Users:**
- ✅ View topics and comments
- ✅ Browse categories

**Authenticated Users:**
- ✅ Create topics
- ✅ Post comments
- ✅ Edit their own topics
- ✅ Delete their own topics and comments

**Admins:**
- ✅ All user permissions
- ✅ Pin topics (appear at top of category)
- ✅ Lock topics (prevent new comments)
- ✅ Delete any topic or comment
- ✅ Restore deleted content
- ✅ Access moderation panel

## Admin Moderation Guide

### Accessing the Moderation Panel

1. Log into the admin panel at `/admin`
2. Click the **🛡️ Moderation** tab
3. Choose between **Topics** or **Comments** view

### Topic Moderation

**Pin/Unpin Topics:**
- Click "📌 Pin" to pin a topic to the top of its category
- Pinned topics appear first in the topic list
- Click "📌 Unpin" to remove the pin

**Lock/Unlock Topics:**
- Click "🔒 Lock" to prevent new comments
- Locked topics display a 🔒 icon and a message
- Click "🔓 Unlock" to allow comments again

**Delete Topics:**
- Click "🗑️ Delete" to soft-delete a topic
- Deleted topics are hidden from public view
- Deleted topics show with a 🗑️ icon in moderation

**Restore Topics:**
- Click "♻️ Restore" on deleted topics
- Topic becomes visible again to users

### Comment Moderation

**Delete Comments:**
- Click "🗑️ Delete" to soft-delete a comment
- Deleted comments are hidden from public view
- Shows which topic the comment belongs to

**Restore Comments:**
- Click "♻️ Restore" on deleted comments
- Comment becomes visible again

### Moderation Best Practices

1. **Review regularly**: Check the moderation panel daily
2. **Pin important topics**: Pin announcements, rules, or guides
3. **Lock resolved topics**: Lock old topics to keep discussions organized
4. **Soft delete only**: Use soft delete to preserve content (can be restored)
5. **Communicate clearly**: Consider posting a comment before locking/deleting

## Technical Details

### API Routes

**Topics API** (`/api/forum/topics`):
- `GET` - Fetch topics by category or specific topic by ID
- `POST` - Create new topic (requires auth)
- `PUT` - Update topic (requires ownership or admin)
- `DELETE` - Soft delete topic (requires ownership or admin)

**Comments API** (`/api/forum/comments`):
- `GET` - Fetch comments by topic
- `POST` - Create new comment (requires auth)
- `PUT` - Update comment (requires auth)
- `DELETE` - Soft delete comment (requires ownership or admin)

**Moderation API** (`/api/forum/moderation`):
- `GET` - Fetch all topics or comments for moderation (admin only)
- `POST` - Moderate content (pin, lock, delete, restore) (admin only)

### Database Structure

**forum_topics table:**
```sql
- id (UUID, primary key)
- category_id (integer)
- title (text)
- content (text)
- author_id (UUID, references admins)
- author_username (text)
- is_pinned (boolean)
- is_locked (boolean)
- is_deleted (boolean)
- view_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

**forum_comments table:**
```sql
- id (UUID, primary key)
- topic_id (UUID, references forum_topics)
- content (text)
- author_id (UUID, references admins)
- author_username (text)
- is_deleted (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### Security Features

- **Row Level Security (RLS)**: Enabled on both tables
- **Soft Deletes**: Content is marked as deleted, not removed
- **Authentication Required**: Creating content requires login
- **Ownership Checks**: Users can only edit/delete their own content
- **Admin Override**: Admins can moderate any content

## Troubleshooting

### Topics not appearing
- ✅ Check that the topic is not deleted (`is_deleted = false`)
- ✅ Verify the category_id matches the category index
- ✅ Check browser console for errors

### Cannot create topics/comments
- ✅ Ensure user is logged in
- ✅ Check authentication session is valid
- ✅ Verify database tables exist
- ✅ Check browser console for API errors

### Moderation not working
- ✅ Verify admin is logged in with admin role
- ✅ Check Supabase service role key is set
- ✅ Check browser console for errors
- ✅ Verify RLS policies are correct

### Comments not loading
- ✅ Check that topic ID is valid
- ✅ Verify comments are not deleted
- ✅ Check API route is accessible
- ✅ Check browser console for errors

## Future Enhancements

Potential features to add:
- [ ] User avatars in topics/comments
- [ ] Rich text editor (markdown support)
- [ ] File/image attachments
- [ ] Topic search functionality
- [ ] User notifications
- [ ] Topic tags/categories
- [ ] Upvote/downvote system
- [ ] Report content feature
- [ ] Moderator roles (separate from admin)
- [ ] Topic pagination
- [ ] Email notifications

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Supabase logs
3. Check the API responses in Network tab
4. Refer to the main [CLAUDE.md](../../CLAUDE.md) documentation

---

**Last Updated**: 2025-10-07
**Version**: 1.0.0
