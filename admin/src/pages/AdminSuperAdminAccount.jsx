import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AdminSuperAdminAccount() {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user?.isSuperAdmin) {
    return (
      <>
        <div className="admin-header">
          <h1>Super Admin Account</h1>
        </div>
        <div className="admin-card">
          <div className="admin-empty-state">
            <p>Super Admin access required to view this page.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Super Admin Account</h1>
          <p className="admin-header-sub">
            Your account details and password settings. Only visible to the Super Admin.
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2 className="admin-form-section-title">Account Information</h2>

        <div className="admin-info-grid">
          <div className="admin-info-item">
            <span className="admin-info-label">Full Name</span>
            <span className="admin-info-value">{user.name || '—'}</span>
          </div>
          <div className="admin-info-item">
            <span className="admin-info-label">Email</span>
            <span className="admin-info-value">{user.email || '—'}</span>
          </div>
          <div className="admin-info-item">
            <span className="admin-info-label">Role</span>
            <span className="admin-info-value">
              <span className="admin-badge admin-badge-active">Super Admin</span>
            </span>
          </div>
          <div className="admin-info-item">
            <span className="admin-info-label">Phone</span>
            <span className="admin-info-value">{user.phone || '—'}</span>
          </div>
          <div className="admin-info-item">
            <span className="admin-info-label">Password</span>
            <span className="admin-info-value">
              <span className="admin-badge admin-badge-confirmed">Set &amp; Encrypted</span>
            </span>
          </div>
          <div className="admin-info-item">
            <span className="admin-info-label">Login Method</span>
            <span className="admin-info-value" style={{ textTransform: 'capitalize' }}>
              {user.authProvider || 'local'}
            </span>
          </div>
          <div className="admin-info-item">
            <span className="admin-info-label">Account Created</span>
            <span className="admin-info-value">{formatDate(user.createdAt)}</span>
          </div>
          <div className="admin-info-item">
            <span className="admin-info-label">Last Updated</span>
            <span className="admin-info-value">{formatDate(user.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-form-section-title">Change Password</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 20px' }}>
          Enter your current password first, then set a new password and confirm it.
        </p>

        {passwordMsg && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(76, 175, 80, 0.12)',
              border: '1px solid rgba(76, 175, 80, 0.35)',
              color: '#8ef0b2',
              fontSize: '0.9rem',
            }}
          >
            {passwordMsg}
          </div>
        )}

        {passwordError && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(255, 107, 107, 0.12)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              color: '#ff9b9b',
              fontSize: '0.9rem',
            }}
          >
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="admin-form-group full-width">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" disabled={passwordLoading}>
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </>
  );
}

export default AdminSuperAdminAccount;