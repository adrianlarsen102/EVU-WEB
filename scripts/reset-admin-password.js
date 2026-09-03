require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

async function resetAdmin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const { error } = await supabase
    .from('admins')
    .update({ 
      password_hash: passwordHash,
      is_default_password: true
    })
    .eq('username', 'admin');

  if (error) {
    console.error('Failed to reset password:', error);
  } else {
    console.log('Successfully reset admin password to: admin123');
  }
}

resetAdmin();
