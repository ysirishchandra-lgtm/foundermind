require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const https = require('https');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in backend/.env');
  process.exit(1);
}

// Extract project ref from SUPABASE_URL
const urlObj = new URL(supabaseUrl);
const hostname = urlObj.hostname;

console.log(`Using Supabase host: ${hostname}`);

const sql = `
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  attendees INTEGER DEFAULT 1,
  join_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
`;

const body = JSON.stringify({ query: sql });

const options = {
  hostname: hostname,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Length': Buffer.byteLength(body),
  }
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => {
    console.log('Migration Status Code:', res.statusCode);
    console.log('Response Body:', responseBody);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Migration completed successfully!');
      process.exit(0);
    } else {
      console.error('Migration failed!');
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('Migration Request Error:', e.message);
  process.exit(1);
});

req.write(body);
req.end();
