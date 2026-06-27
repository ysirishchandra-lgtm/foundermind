import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../App.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') {
      setError('Your session has expired. Please log in again.');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/auth/login', { email, password });
      // Backend returns: { success: true, token, user: { id, name, email } }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-container"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}
    >
      <div className="glass-card animate-fade-up" style={{ width: '100%', maxWidth: '420px', padding: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <Brain className="logo-icon" size={32} />
            <span style={{ fontSize: '1.5rem' }}>FounderMind</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Log in to your Chief of Staff</p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444', fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@startup.com"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                color: 'white', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                color: 'white', outline: 'none',
              }}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? <><Loader size={18} className="spin" /> Logging in...</> : <>Log In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }}
          >
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}
