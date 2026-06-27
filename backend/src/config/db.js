const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.');
}

// We use the service key in the backend to bypass RLS and perform admin operations
const supabase = createClient(supabaseUrl || 'http://localhost:8000', supabaseKey || 'dummy');

module.exports = supabase;
