const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let initialized = false;

async function initializeDatabase() {
  if (initialized) return;

  try {
    // Check if default admin exists
    const { data: adminCount, error: countError } = await supabase
      .from('admins')
      .select('id', { count: 'exact', head: true });

    if (countError && countError.code !== 'PGRST116') {
      console.error('Error checking admin count:', countError);
      throw countError;
    }

    const count = adminCount?.length || 0;

    if (count === 0) {
      // Create default admin with password "admin123"
      const defaultPassword = 'admin123';
      const passwordHash = bcrypt.hashSync(defaultPassword, SALT_ROUNDS);

      const { error: insertError } = await supabase
        .from('admins')
        .insert([
          {
            username: 'admin',
            password_hash: passwordHash,
            is_default_password: true
          }
        ]);

      if (insertError) {
        console.error('Error creating default admin:', insertError);
        throw insertError;
      }

      console.log('Created default admin account. Username: admin, Password: admin123');
      console.log('⚠️  IMPORTANT: You will be prompted to change this password on first login!');
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

    const isValid = bcrypt.compareSync(password, admin.password_hash);

    if (isValid) {
      return {
        id: admin.id,
        username: admin.username,
        isDefaultPassword: admin.is_default_password
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
    const passwordHash = bcrypt.hashSync(newPassword, SALT_ROUNDS);

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
          is_default_password
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
      return {
        adminId: session.admin_id,
        username: session.admins.username,
        isDefaultPassword: session.admins.is_default_password
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

// Cleanup expired sessions every hour
setInterval(() => {
  cleanupExpiredSessions().catch(console.error);
}, 60 * 60 * 1000);

module.exports = {
  verifyPassword,
  changePassword,
  createSession,
  validateSession,
  destroySession
};
