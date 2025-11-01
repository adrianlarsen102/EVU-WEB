import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import { createManagedInterval } from './processManager.js';

const SALT_ROUNDS = 10;

// Singleton Supabase client
let supabaseInstance = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-application-name': 'evu-web'
          }
        }
      }
    );
  }
  return supabaseInstance;
}

const supabase = getSupabaseClient();

let initialized = false;

async function initializeDatabase() {
  if (initialized) return;

  try {
    // Check if any admin exists
    const { data: admins, error: countError } = await supabase
      .from('admins')
      .select('id')
      .limit(1);

    if (countError && countError.code !== 'PGRST116') {
      console.error('Error checking admin count:', countError);
      throw countError;
    }

    // Only create default admin if NO admins exist
    if (!admins || admins.length === 0) {
      const defaultPassword = 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

      const { error: insertError } = await supabase
        .from('admins')
        .insert([
          {
            username: 'admin',
            password_hash: passwordHash,
            is_default_password: true,
            role: 'admin',
            is_admin: true
          }
        ]);

      if (insertError) {
        console.error('Error creating default admin:', insertError);
        // Don't throw if it's a duplicate error
        if (insertError.code !== '23505') {
          throw insertError;
        }
      } else {
        console.log('✅ Created default admin: username=admin, password=admin123');
      }
    }

    // Clean up expired sessions
    const now = new Date().toISOString();
    await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', now);

    initialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function verifyPassword(username, password) {
  await initializeDatabase();

  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) {
      console.error('Verify password error:', error);
      return null;
    }

    const admin = admins?.[0];

    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (isValid) {
      // Check admin status - use role if it exists, fallback to is_admin field
      const hasRole = admin.role !== null && admin.role !== undefined;
      const isAdmin = hasRole
        ? (admin.role === 'admin')
        : (admin.is_admin === true);

      return {
        id: admin.id,
        username: admin.username,
        isDefaultPassword: admin.is_default_password,
        role: admin.role || (admin.is_admin ? 'admin' : 'user'),
        isAdmin: isAdmin
      };
    }

    return null;
  } catch (error) {
    console.error('Verify password error:', error);
    return null;
  }
}

async function changePassword(adminId, newPassword) {
  await initializeDatabase();

  try {
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const { error } = await supabase
      .from('admins')
      .update({
        password_hash: passwordHash,
        is_default_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);

    if (error) {
      console.error('Change password error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
}

async function createSession(adminId) {
  await initializeDatabase();

  try {
    const sessionId = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error } = await supabase
      .from('sessions')
      .insert([
        {
          id: sessionId,
          admin_id: adminId,
          expires_at: expiresAt.toISOString()
        }
      ]);

    if (error) {
      console.error('Create session error:', error);
      return null;
    }

    return sessionId;
  } catch (error) {
    console.error('Create session error:', error);
    return null;
  }
}

async function validateSession(sessionId) {
  await initializeDatabase();

  try {
    const now = new Date().toISOString();

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        *,
        admins (
          id,
          username,
          is_default_password,
          role,
          is_admin
        )
      `)
      .eq('id', sessionId)
      .gt('expires_at', now)
      .limit(1);

    if (error) {
      console.error('Validate session error:', error);
      return null;
    }

    const session = sessions?.[0];

    if (session && session.admins) {
      // Check admin status - use role if it exists, fallback to is_admin field
      const hasRole = session.admins.role !== null && session.admins.role !== undefined;
      const isAdmin = hasRole
        ? (session.admins.role === 'admin')
        : (session.admins.is_admin === true);

      return {
        adminId: session.admin_id,
        username: session.admins.username,
        isDefaultPassword: session.admins.is_default_password,
        role: session.admins.role || (session.admins.is_admin ? 'admin' : 'user'),
        isAdmin: isAdmin
      };
    }

    return null;
  } catch (error) {
    console.error('Validate session error:', error);
    return null;
  }
}

async function destroySession(sessionId) {
  await initializeDatabase();

  try {
    await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
  } catch (error) {
    console.error('Destroy session error:', error);
  }
}

async function cleanupExpiredSessions() {
  try {
    const now = new Date().toISOString();
    await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', now);
  } catch (error) {
    console.error('Cleanup sessions error:', error);
  }
}

// Initialize database on first import
initializeDatabase().catch(console.error);

// Cleanup expired sessions every hour (managed interval)
createManagedInterval(() => {
  cleanupExpiredSessions().catch(console.error);
}, 60 * 60 * 1000);

// User Management Functions
async function getAllAdmins() {
  await initializeDatabase();

  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, username, is_default_password, role, is_admin, created_at, updated_at')
      .order('created_at', { ascending: true});

    if (error) throw error;
    return admins || [];
  } catch (error) {
    console.error('Get all admins error:', error);
    return [];
  }
}

async function createAdmin(username, password, isDefaultPassword = true, role = 'user', roleId = null) {
  await initializeDatabase();

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const insertData = {
      username,
      password_hash: passwordHash,
      is_default_password: isDefaultPassword,
      role: role,
      is_admin: role === 'admin'
    };

    // If roleId is provided, use it (new RBAC system)
    if (roleId) {
      insertData.role_id = roleId;
    }

    const { data, error } = await supabase
      .from('admins')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, admin: data };
  } catch (error) {
    console.error('Create admin error:', error);
    return { success: false, error: error.message };
  }
}

async function deleteAdmin(adminId) {
  await initializeDatabase();

  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', adminId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete admin error:', error);
    return { success: false, error: error.message };
  }
}

async function updateAdminPassword(adminId, newPassword) {
  await initializeDatabase();

  try {
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const { error } = await supabase
      .from('admins')
      .update({
        password_hash: passwordHash,
        is_default_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update admin password error:', error);
    return { success: false, error: error.message };
  }
}

async function updateAdminRole(adminId, role) {
  await initializeDatabase();

  try {
    const { error } = await supabase
      .from('admins')
      .update({
        role: role,
        is_admin: role === 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update admin role error:', error);
    return { success: false, error: error.message };
  }
}

async function updateAdmin(adminId, updates) {
  await initializeDatabase();

  try {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Update username if provided
    if (updates.username) {
      updateData.username = updates.username;
    }

    // Update display_name if provided
    if (updates.display_name !== undefined) {
      updateData.display_name = updates.display_name;
    }

    // Update email if provided
    if (updates.email !== undefined) {
      updateData.email = updates.email;
    }

    // Update role if provided
    if (updates.role) {
      updateData.role = updates.role;
      updateData.is_admin = updates.role === 'admin';
    }

    // Update role_id if provided
    if (updates.role_id !== undefined) {
      updateData.role_id = updates.role_id;
    }

    const { error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', adminId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update admin error:', error);
    return { success: false, error: error.message };
  }
}

// Forum Topics Functions
async function createForumTopic(categoryId, title, content, authorId, authorUsername) {
  await initializeDatabase();

  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert([
        {
          category_id: categoryId,
          title,
          content,
          author_id: authorId,
          author_username: authorUsername
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, topic: data };
  } catch (error) {
    console.error('Create forum topic error:', error);
    return { success: false, error: error.message };
  }
}

async function getTopicsByCategory(categoryId) {
  await initializeDatabase();

  try {
    const { data: topics, error } = await supabase
      .from('forum_topics')
      .select('*, comment_count:forum_comments(count)')
      .eq('category_id', categoryId)
      .eq('is_deleted', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the comment count
    const topicsWithCount = topics.map(topic => ({
      ...topic,
      comment_count: topic.comment_count?.[0]?.count || 0
    }));

    return topicsWithCount || [];
  } catch (error) {
    console.error('Get topics by category error:', error);
    return [];
  }
}

async function getTopicById(topicId) {
  await initializeDatabase();

  try {
    const { data: topic, error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', topicId)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return topic;
  } catch (error) {
    console.error('Get topic by id error:', error);
    return null;
  }
}

async function updateTopicViewCount(topicId) {
  await initializeDatabase();

  try {
    const { error } = await supabase
      .rpc('increment_view_count', { topic_id: topicId });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    // If RPC doesn't exist, use regular update
    try {
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('view_count')
        .eq('id', topicId)
        .single();

      await supabase
        .from('forum_topics')
        .update({ view_count: (topic?.view_count || 0) + 1 })
        .eq('id', topicId);

      return { success: true };
    } catch (updateError) {
      console.error('Update view count error:', updateError);
      return { success: false };
    }
  }
}

async function updateTopic(topicId, updates) {
  await initializeDatabase();

  try {
    const { error } = await supabase
      .from('forum_topics')
      .update(updates)
      .eq('id', topicId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update topic error:', error);
    return { success: false, error: error.message };
  }
}

async function deleteTopicSoft(topicId) {
  await initializeDatabase();

  try {
    const { error } = await supabase
      .from('forum_topics')
      .update({ is_deleted: true })
      .eq('id', topicId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete topic error:', error);
    return { success: false, error: error.message };
  }
}

// Forum Category Counter Functions
async function incrementCategoryTopicCount(categoryId) {
  await initializeDatabase();

  try {
    // Get current content
    const { data: contentData, error: getError } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', 1)
      .single();

    if (getError) throw getError;

    const content = contentData.content;
    if (!content.forumCategories) return { success: false };

    // Find and increment the category
    const categories = content.forumCategories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, topics: (cat.topics || 0) + 1 };
      }
      return cat;
    });

    // Update content
    const { error: updateError } = await supabase
      .from('site_content')
      .update({ content: { ...content, forumCategories: categories } })
      .eq('id', 1);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error) {
    console.error('Increment category topic count error:', error);
    return { success: false, error: error.message };
  }
}

async function incrementCategoryPostCount(categoryId) {
  await initializeDatabase();

  try {
    // Get current content
    const { data: contentData, error: getError } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', 1)
      .single();

    if (getError) throw getError;

    const content = contentData.content;
    if (!content.forumCategories) return { success: false };

    // Find and increment the category
    const categories = content.forumCategories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, posts: (cat.posts || 0) + 1 };
      }
      return cat;
    });

    // Update content
    const { error: updateError } = await supabase
      .from('site_content')
      .update({ content: { ...content, forumCategories: categories } })
      .eq('id', 1);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error) {
    console.error('Increment category post count error:', error);
    return { success: false, error: error.message };
  }
}

// Forum Comments Functions
async function createForumComment(topicId, content, authorId, authorUsername) {
  await initializeDatabase();

  try {
    const { data, error} = await supabase
      .from('forum_comments')
      .insert([
        {
          topic_id: topicId,
          content,
          author_id: authorId,
          author_username: authorUsername
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, comment: data };
  } catch (error) {
    console.error('Create forum comment error:', error);
    return { success: false, error: error.message };
  }
}

async function getCommentsByTopic(topicId) {
  await initializeDatabase();

  try {
    const { data: comments, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return comments || [];
  } catch (error) {
    console.error('Get comments by topic error:', error);
    return [];
  }
}

async function getCommentById(commentId) {
  await initializeDatabase();

  try {
    const { data: comment, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (error) throw error;
    return comment;
  } catch (error) {
    console.error('Get comment by ID error:', error);
    return null;
  }
}

async function updateComment(commentId, content) {
  await initializeDatabase();

  try {
    const { error } = await supabase
      .from('forum_comments')
      .update({ content })
      .eq('id', commentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update comment error:', error);
    return { success: false, error: error.message };
  }
}

async function deleteCommentSoft(commentId) {
  await initializeDatabase();

  try {
    const { error } = await supabase
      .from('forum_comments')
      .update({ is_deleted: true })
      .eq('id', commentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete comment error:', error);
    return { success: false, error: error.message };
  }
}

// Admin Moderation Functions
async function getAllTopicsForModeration() {
  await initializeDatabase();

  try {
    const { data: topics, error } = await supabase
      .from('forum_topics')
      .select('*, comment_count:forum_comments(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const topicsWithCount = topics.map(topic => ({
      ...topic,
      comment_count: topic.comment_count?.[0]?.count || 0
    }));

    return topicsWithCount || [];
  } catch (error) {
    console.error('Get all topics for moderation error:', error);
    return [];
  }
}

async function getAllCommentsForModeration() {
  await initializeDatabase();

  try {
    const { data: comments, error } = await supabase
      .from('forum_comments')
      .select('*, topic:forum_topics(title)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return comments || [];
  } catch (error) {
    console.error('Get all comments for moderation error:', error);
    return [];
  }
}

// Support Ticket Functions
async function createSupportTicket(subject, description, category, priority, authorId, authorUsername, authorEmail) {
  await initializeDatabase();

  try {
    // Generate ticket number
    const { data: ticketNumberData, error: ticketError } = await supabase
      .rpc('generate_ticket_number');

    if (ticketError) throw ticketError;

    const ticketNumber = ticketNumberData;

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([
        {
          ticket_number: ticketNumber,
          subject,
          description,
          category,
          priority,
          author_id: authorId,
          author_username: authorUsername,
          author_email: authorEmail,
          status: 'open'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, ticket: data };
  } catch (error) {
    console.error('Create support ticket error:', error);
    return { success: false, error: error.message };
  }
}

async function getAllTickets() {
  await initializeDatabase();

  try {
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return tickets || [];
  } catch (error) {
    console.error('Get all tickets error:', error);
    return [];
  }
}

async function getTicketById(ticketId) {
  await initializeDatabase();

  try {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    return ticket;
  } catch (error) {
    console.error('Get ticket by id error:', error);
    return null;
  }
}

async function getTicketsByUser(authorId) {
  await initializeDatabase();

  try {
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return tickets || [];
  } catch (error) {
    console.error('Get tickets by user error:', error);
    return [];
  }
}

async function updateTicket(ticketId, updates) {
  await initializeDatabase();

  try {
    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update ticket error:', error);
    return { success: false, error: error.message };
  }
}

async function createTicketReply(ticketId, authorId, authorUsername, isAdmin, message) {
  await initializeDatabase();

  try {
    const { data, error } = await supabase
      .from('support_ticket_replies')
      .insert([
        {
          ticket_id: ticketId,
          author_id: authorId,
          author_username: authorUsername,
          is_admin: isAdmin,
          message
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, reply: data };
  } catch (error) {
    console.error('Create ticket reply error:', error);
    return { success: false, error: error.message };
  }
}

async function getTicketReplies(ticketId) {
  await initializeDatabase();

  try {
    const { data: replies, error } = await supabase
      .from('support_ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return replies || [];
  } catch (error) {
    console.error('Get ticket replies error:', error);
    return [];
  }
}

async function getOpenTicketCount() {
  await initializeDatabase();

  try {
    const { count, error } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Get open ticket count error:', error);
    return 0;
  }
}

// Email settings functions
async function getEmailSettings() {
  await initializeDatabase();

  try {
    const { data, error } = await supabase
      .from('email_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      // If table doesn't exist yet, return default settings
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return {
          success: true,
          settings: {
            id: 1,
            provider: 'resend',
            enabled: false,
            resend_api_key: null,
            smtp_host: null,
            smtp_port: 587,
            smtp_user: null,
            smtp_pass: null,
            smtp_secure: false,
            email_from: 'noreply@yourdomain.com',
            admin_email: null
          }
        };
      }
      throw error;
    }

    return { success: true, settings: data };
  } catch (error) {
    console.error('Get email settings error:', error);
    return { success: false, error: error.message };
  }
}

async function updateEmailSettings(settings) {
  await initializeDatabase();

  try {
    const { data, error } = await supabase
      .from('email_settings')
      .update({
        provider: settings.provider,
        resend_api_key: settings.resend_api_key,
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_user: settings.smtp_user,
        smtp_pass: settings.smtp_pass,
        smtp_secure: settings.smtp_secure,
        email_from: settings.email_from,
        admin_email: settings.admin_email,
        enabled: settings.enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return { success: true, settings: data };
  } catch (error) {
    console.error('Update email settings error:', error);
    return { success: false, error: error.message };
  }
}

// ES6 Named Exports
export {
  verifyPassword,
  changePassword,
  createSession,
  validateSession,
  destroySession,
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  updateAdminPassword,
  updateAdminRole,
  updateAdmin,
  // Forum functions
  createForumTopic,
  getTopicsByCategory,
  getTopicById,
  updateTopicViewCount,
  updateTopic,
  deleteTopicSoft,
  createForumComment,
  getCommentsByTopic,
  getCommentById,
  updateComment,
  deleteCommentSoft,
  getAllTopicsForModeration,
  getAllCommentsForModeration,
  incrementCategoryTopicCount,
  incrementCategoryPostCount,
  // Support ticket functions
  createSupportTicket,
  getAllTickets,
  getTicketById,
  getTicketsByUser,
  updateTicket,
  createTicketReply,
  getTicketReplies,
  getOpenTicketCount,
  // Email settings functions
  getEmailSettings,
  updateEmailSettings
};
