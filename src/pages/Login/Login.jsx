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
    <div className="auth-container">
      <div className="auth-bg-orb-1"></div>
      <div className="auth-bg-orb-2"></div>

      <div className="auth-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="auth-logo-wrapper">
            <Brain className="auth-logo-icon" size={36} />
            <span className="auth-logo-text">FounderMind</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px', fontWeight: '700' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Log in to your Chief of Staff</p>
        </div>

        {error && (
          <div className="auth-error-box">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="login-email">
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@startup.com"
              required
            />
          </div>
          
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <><Loader size={18} className="spin" /> Logging in...</>
            ) : (
              <>Log In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-link-text">
          Don&apos;t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="auth-link"
          >
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}
