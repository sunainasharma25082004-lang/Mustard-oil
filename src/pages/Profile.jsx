import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';
import { useLocationFields } from '../hooks/useLocationFields';
import {
  isValidName,
  sanitizePhoneInput,
  validatePhone,
  validatePincode,
} from '../utils/formValidation';

function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateProfile, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const {
    pincodeOptions,
    locationHint,
    lookingUp,
    handlePincodeChange,
    handleCityChange,
    handleCityBlur,
    selectPincodeOption,
  } = useLocationFields({ formData: profileForm, setFormData: setProfileForm });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/signin', { state: { from: '/profile' } });
      return;
    }

    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      pincode: user.pincode || '',
    });
  }, [user, authLoading, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setProfileForm({ ...profileForm, phone: sanitizePhoneInput(value) });
    } else if (name === 'pincode') {
      handlePincodeChange(value);
    } else if (name === 'city') {
      handleCityChange(value);
    } else {
      setProfileForm({ ...profileForm, [name]: value });
    }
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');

    const errors = {};
    if (!isValidName(profileForm.name)) errors.name = 'Enter a valid name';
    const phoneError = validatePhone(profileForm.phone, { required: false });
    if (profileForm.phone?.trim() && phoneError) errors.phone = phoneError;
    const pincodeError = validatePincode(profileForm.pincode, { required: false });
    if (profileForm.pincode?.trim() && pincodeError) errors.pincode = pincodeError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setProfileError('Please fix the highlighted fields.');
      return;
    }

    setFieldErrors({});
    setProfileLoading(true);
    try {
      const payload = { ...profileForm };
      if (!payload.phone?.trim()) delete payload.phone;
      await updateProfile(payload);
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
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

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '60vh', background: '#0b0b0b', padding: '140px 20px', textAlign: 'center', color: '#888' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .profile-page {
          min-height: 100vh;
          background: #0b0b0b;
          padding: 110px 20px 60px;
          color: #fff;
        }
        .profile-container { max-width: 900px; margin: auto; }
        .profile-hero {
          background: linear-gradient(135deg, rgba(212,175,55,.16), rgba(212,175,55,.04));
          border: 1px solid rgba(212,175,55,.28);
          border-radius: 22px;
          padding: 28px 24px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .profile-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #f7d76a, #d4af37);
          color: #111; font-weight: 800; font-size: 1.5rem;
          display: flex; align-items: center; justify-content: center;
        }
        .profile-hero h1 { margin: 0 0 4px; font-size: 1.5rem; color: #fff; }
        .profile-hero p { margin: 0; color: #aaa; font-size: 0.9rem; }
        .profile-quick-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .profile-quick-link {
          padding: 10px 18px; border-radius: 50px; text-decoration: none;
          border: 1px solid rgba(212,175,55,.4); color: #d4af37; font-weight: 600; font-size: 0.88rem;
        }
        .profile-quick-link:hover { background: rgba(212,175,55,.12); color: #f7d76a; }
        .profile-card {
          background: #141414;
          border: 1px solid rgba(212,175,55,.2);
          border-radius: 20px;
          padding: 28px 24px;
          margin-bottom: 20px;
        }
        .profile-card h2 { color: #d4af37; margin: 0 0 20px; font-size: 1.15rem; }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .profile-field { margin-bottom: 14px; }
        .profile-field label { display: block; color: #aaa; font-size: 0.85rem; margin-bottom: 6px; }
        .profile-field input, .profile-field textarea {
          width: 100%; padding: 14px; border-radius: 12px;
          border: 1px solid rgba(212,175,55,.2); background: #1b1b1b; color: #fff; outline: none;
          box-sizing: border-box;
        }
        .profile-field input:focus, .profile-field textarea:focus { border-color: #d4af37; }
        .profile-field input:disabled { opacity: 0.6; cursor: not-allowed; }
        .profile-btn {
          padding: 14px 28px; border-radius: 50px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #f7d76a, #d4af37); color: #111; font-weight: 700;
        }
        .profile-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .profile-btn-outline {
          padding: 14px 28px; border-radius: 50px; cursor: pointer;
          border: 1px solid #ff8a8a; background: transparent; color: #ff8a8a; font-weight: 700;
        }
        .profile-alert { padding: 12px 14px; border-radius: 10px; margin-bottom: 16px; font-size: 0.9rem; }
        .profile-alert-success { background: rgba(74,222,128,.12); border: 1px solid rgba(74,222,128,.3); color: #8ef0b2; }
        .profile-alert-error { background: rgba(255,107,107,.12); border: 1px solid rgba(255,107,107,.3); color: #ff9b9b; }
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr; }
          .profile-hero { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-hero">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="profile-avatar">{user.name?.charAt(0)?.toUpperCase() || 'K'}</div>
              <div>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
                {user.createdAt && (
                  <p style={{ marginTop: 4, fontSize: '0.8rem' }}>
                    Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            <div className="profile-quick-links">
              <Link to="/my-orders" className="profile-quick-link">My Orders</Link>
              <Link to="/products" className="profile-quick-link">Shop</Link>
            </div>
          </div>

          <form className="profile-card" onSubmit={handleProfileSave}>
            <h2>Account Details</h2>
            {profileMsg && <div className="profile-alert profile-alert-success">{profileMsg}</div>}
            {profileError && <div className="profile-alert profile-alert-error">{profileError}</div>}

            <div className="profile-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} required />
                {fieldErrors.name && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: 6 }}>{fieldErrors.name}</p>}
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  placeholder="10-digit mobile"
                />
                {fieldErrors.phone && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: 6 }}>{fieldErrors.phone}</p>}
              </div>
              <div className="profile-field">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={profileForm.pincode}
                  onChange={handleProfileChange}
                  inputMode="numeric"
                  maxLength={6}
                  pattern="\d{6}"
                />
                {fieldErrors.pincode && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: 6 }}>{fieldErrors.pincode}</p>}
              </div>
            </div>
            <div className="profile-field">
              <label>Default Address</label>
              <textarea name="address" rows="3" value={profileForm.address} onChange={handleProfileChange} />
            </div>
            <div className="profile-field">
              <label>City</label>
              <input type="text" name="city" value={profileForm.city} onChange={handleProfileChange} onBlur={handleCityBlur} />
              {lookingUp && <p style={{ color: '#888', fontSize: '0.78rem', marginTop: 6 }}>Looking up location...</p>}
              {locationHint && <p style={{ color: '#888', fontSize: '0.78rem', marginTop: 6 }}>{locationHint}</p>}
              {pincodeOptions.length > 0 && (
                <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                  {pincodeOptions.map((option) => (
                    <button
                      key={`${option.pincode}-${option.area}`}
                      type="button"
                      onClick={() => selectPincodeOption(option)}
                      style={{
                        textAlign: 'left',
                        background: '#1c1c1c',
                        border: '1px solid rgba(212,175,55,.2)',
                        color: '#ddd',
                        borderRadius: 10,
                        padding: '8px 10px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {option.city} · {option.pincode}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="profile-btn" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          {!(user.authProvider === 'google' && !user.hasPassword) && (
          <form className="profile-card" onSubmit={handlePasswordChange}>
            <h2>Change Password</h2>
            {passwordMsg && <div className="profile-alert profile-alert-success">{passwordMsg}</div>}
            {passwordError && <div className="profile-alert profile-alert-error">{passwordError}</div>}

            <div className="profile-field">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="profile-grid">
              <div className="profile-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="profile-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="profile-btn" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
          )}

          <div className="profile-card">
            <h2>Session</h2>
            <p style={{ color: '#aaa', marginBottom: 16, fontSize: '0.9rem' }}>
              Sign out from your account on this device.
            </p>
            <button
              type="button"
              className="profile-btn-outline"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;