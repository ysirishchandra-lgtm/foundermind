/**
 * Centralised API client for FounderMind frontend.
 *
 * - Uses the Vite proxy so /api/* calls go to localhost:5000
 * - Automatically attaches Authorization: Bearer <token> from localStorage
 * - Returns parsed JSON on success, throws enriched Error on failure
 */

const TOKEN_KEY = 'foundermind_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': '1',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/api${path}`, {
    ...options,
    headers,
  });

  // Parse body regardless (even errors have a body)
  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Token has expired or is invalid, redirect to login
      localStorage.removeItem('foundermind_token');
      localStorage.removeItem('foundermind_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }

    if (response.status === 429) {
      // Rate limit exceeded — build a clear, friendly message
      const retryAfter = body?.retryAfter ?? 60;
      const serverMsg  = body?.message || 'Too many requests.';
      const err = new Error(`${serverMsg} Please wait ${retryAfter} seconds before trying again.`);
      err.status     = 429;
      err.retryAfter = retryAfter;
      err.body       = body;
      throw err;
    }

    const message = body?.error || body?.message || `HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.body   = body;
    throw err;
  }

  return body;
}

// ── Convenience wrappers ───────────────────────────────────────────────────

export const api = {
  get:    (path, opts = {})  => request(path, { ...opts, method: 'GET' }),
  post:   (path, body, opts = {}) => request(path, { ...opts, method: 'POST',  body: JSON.stringify(body) }),
  patch:  (path, body, opts = {}) => request(path, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  put:    (path, body, opts = {}) => request(path, { ...opts, method: 'PUT',   body: JSON.stringify(body) }),
  delete: (path, opts = {})  => request(path, { ...opts, method: 'DELETE' }),
};

export default api;
