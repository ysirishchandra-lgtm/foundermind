import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../App.css';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/auth/register', { name, email, password });
      // Backend returns: { success: true, token, user: { id, name, email } }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
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
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px', fontWeight: '700' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Get your AI Chief of Staff today.</p>
        </div>

        {error && (
          <div className="auth-error-box">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-name">
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Founder"
              required
            />
          </div>
          
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-email">
              Work Email
            </label>
            <input
              id="signup-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@startup.com"
              required
            />
          </div>
          
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <><Loader size={18} className="spin" /> Creating account...</>
            ) : (
              <>Sign Up <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-link-text">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="auth-link"
          >
            Log in
          </span>
        </div>
      </div>
    </div>
  );
}
