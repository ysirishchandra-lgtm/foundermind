import { useState } from 'react';
import { User, Lock, Save, Loader, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function Settings() {
  const { user, login, token } = useAuth();
  const toast = useToast();

  // Profile section
  const [profileName, setProfileName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || profileName.trim() === user?.name) {
      setProfileError('Please enter a different name to update.');
      return;
    }

    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const response = await api.patch('/auth/profile', { name: profileName.trim() });
      // Update auth context with new name
      if (response.success && response.user) {
        login(token, response.user);
      }
      setProfileSuccess('Profile updated successfully!');
      toast.success('Profile updated!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '0.9rem',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account details and security preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card widget-card" style={{ maxWidth: '560px' }}>
        <div className="widget-header">
          <div className="widget-title">
            <User size={18} />
            Profile Information
          </div>
        </div>
        <div className="widget-content">
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                style={inputStyle}
                placeholder="Your full name"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Email address cannot be changed for security reasons.
              </p>
            </div>

            {profileSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem' }}>
                <CheckCircle size={16} /> {profileSuccess}
              </div>
            )}
            {profileError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> {profileError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile || profileName.trim() === user?.name || !profileName.trim()}
                style={{ padding: '10px 22px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {savingProfile ? <Loader size={16} className="spin" /> : <Save size={16} />}
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Card */}
      <div className="glass-card widget-card" style={{ maxWidth: '560px' }}>
        <div className="widget-header">
          <div className="widget-title">
            <Lock size={18} />
            Change Password
          </div>
        </div>
        <div className="widget-content">
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', padding: '4px' }}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', padding: '4px' }}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : undefined,
                }}
                placeholder="Repeat your new password"
                required
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>Passwords do not match.</p>
              )}
            </div>

            {passwordError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px' }}>
                <AlertCircle size={16} /> {passwordError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                style={{ padding: '10px 22px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {savingPassword ? <Loader size={16} className="spin" /> : <Lock size={16} />}
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="glass-card" style={{ maxWidth: '560px', padding: '20px', borderColor: 'rgba(6,182,212,0.2)' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
          🔐 <strong style={{ color: 'var(--text-primary)' }}>Security Note:</strong> Your password is hashed with bcrypt (cost factor 12) and never stored in plaintext.
          JWT sessions expire after 7 days. All API requests require a valid bearer token.
        </p>
      </div>
    </div>
  );
}
