const BASE_URL = 'https://foundermind.vercel.app/api';

async function run() {
  console.log('Logging in...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testver@gmail.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Login success, token acquired.');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Create test conversation
  console.log('Creating conversation...');
  const convRes = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'Chat Endpoint Test' })
  });
  const convData = await convRes.json();
  const convId = convData.data.id;
  console.log('Conversation created:', convId);

  // Test Non-streaming POST /api/chat
  console.log('\nTesting non-streaming POST /api/chat...');
  const chatRes = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversationId: convId, message: 'Hello' })
  });
  console.log('Non-streaming Status:', chatRes.status);
  const chatData = await chatRes.json();
  console.log('Non-streaming Response:', JSON.stringify(chatData, null, 2));

  // Test Streaming POST /api/chat/stream
  console.log('\nTesting streaming POST /api/chat/stream...');
  const streamRes = await fetch(`${BASE_URL}/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversationId: convId, message: 'Hello' })
  });
  console.log('Streaming Status:', streamRes.status);
  console.log('Streaming Headers:', Object.fromEntries(streamRes.headers.entries()));
  
  const text = await streamRes.text();
  console.log('Streaming Body Sample:\n', text.substring(0, 1000));
}

run().catch(console.error);
