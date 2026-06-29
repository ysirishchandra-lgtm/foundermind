const SUPABASE_URL = 'https://vmzjkhjtwnmenjokuequ.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtempraGp0d25tZW5qb2t1ZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU2NTE3MywiZXhwIjoyMDk4MTQxMTczfQ.eeFFPFzkWvj-ZxRXDnhTRMLfqJ7QIcKaKQM-LauFUc8';

async function run() {
  console.log('Fetching database schema...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  console.log('Tables found:');
  const definitions = Object.keys(data.definitions || {});
  console.log(definitions);
}

run().catch(console.error);
