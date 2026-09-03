require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function deleteAdmin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('username', 'admin');

  if (error) {
    console.error('Failed to delete admin:', error);
  } else {
    console.log('Successfully deleted admin user.');
  }
}

deleteAdmin();
