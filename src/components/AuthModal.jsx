import { useEffect, useState } from 'react';
import { sanitizePhoneInput, validatePhone } from '../utils/formValidation';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import { useGoogleAuth } from '../context/GoogleAuthContext';

function AuthModal({ isOpen, onClose, title = 'Sign in to continue', shippingData = null }) {
  const { login, register, loginWithGoogle, updateProfile } = useAuth();
  const { clientId } = useGoogleAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Reset form when modal opens/closes or tab switches
  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLogin(true);
      setLoginData({ email: '', password: '' });
      setRegisterData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const syncShippingToProfile = async () => {
    if (!shippingData?.address?.trim()) return;
    const payload = {
      address: shippingData.address,
      city: shippingData.city,
      pincode: shippingData.pincode,
    };
    if (shippingData.fullName?.trim()) payload.name = shippingData.fullName;
    if (shippingData.phone?.trim()) payload.phone = shippingData.phone;
    await updateProfile(payload);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      await syncShippingToProfile();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const phoneError = validatePhone(registerData.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);

    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        address: shippingData?.address || '',
        city: shippingData?.city || '',
        pincode: shippingData?.pincode || '',
      });
      onClose?.();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
  };

  const closeModal = () => {
    if (!loading) {
      onClose?.();
    }
  };

  const handleGoogleSignIn = async (credential) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      await syncShippingToProfile();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={closeModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#141414',
          border: '1px solid rgba(212,175,55,.25)',
          borderRadius: '24px',
          padding: '32px 28px',
          position: 'relative',
          boxShadow: '0 25px 70px rgba(0,0,0,.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          disabled={loading}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '22px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ color: '#d4af37', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '1px' }}>
            KARYOR
          </div>
          <h3 style={{ color: '#fff', margin: '10px 0 6px', fontSize: '1.35rem' }}>
            {title}
          </h3>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
            Secure checkout • Track your orders easily
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#1b1b1b',
            borderRadius: '999px',
            padding: '4px',
            margin: '22px 0 18px',
          }}
        >
          <button
            type="button"
            onClick={() => switchTab(true)}
            style={{
              flex: 1,
              border: 'none',
              background: isLogin ? 'linear-gradient(135deg, #f7d76a, #d4af37)' : 'transparent',
              color: isLogin ? '#000' : '#fff',
              padding: '11px 0',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchTab(false)}
            style={{
              flex: 1,
              border: 'none',
              background: !isLogin ? 'linear-gradient(135deg, #f7d76a, #d4af37)' : 'transparent',
              color: !isLogin ? '#000' : '#fff',
              padding: '11px 0',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(220,53,69,.12)',
              border: '1px solid rgba(220,53,69,.35)',
              color: '#ff7b7b',
              padding: '11px 14px',
              borderRadius: '10px',
              marginBottom: 16,
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: '#ccc', fontSize: '0.82rem', marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '13px 15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(212,175,55,.2)',
                  background: '#1d1d1d',
                  color: 'white',
                  fontSize: '1rem',
                }}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', color: '#ccc', fontSize: '0.82rem', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '13px 15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(212,175,55,.2)',
                  background: '#1d1d1d',
                  color: 'white',
                  fontSize: '1rem',
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #f7d76a, #d4af37)',
                color: '#000',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In & Continue'}
            </button>

            <GoogleSignInButton
              onSuccess={handleGoogleSignIn}
              onError={setError}
              disabled={loading}
              loading={loading}
            />
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', color: '#ccc', fontSize: '0.82rem', marginBottom: 5 }}>Full Name</label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '11px', border: '1px solid rgba(212,175,55,.2)', background: '#1d1d1d', color: 'white', fontSize: '0.97rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#ccc', fontSize: '0.82rem', marginBottom: 5 }}>Phone</label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: sanitizePhoneInput(e.target.value) })}
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  placeholder="10-digit mobile"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '11px', border: '1px solid rgba(212,175,55,.2)', background: '#1d1d1d', color: 'white', fontSize: '0.97rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', color: '#ccc', fontSize: '0.82rem', marginBottom: 5 }}>Email Address</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '11px', border: '1px solid rgba(212,175,55,.2)', background: '#1d1d1d', color: 'white', fontSize: '0.97rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', color: '#ccc', fontSize: '0.82rem', marginBottom: 5 }}>Password</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '11px', border: '1px solid rgba(212,175,55,.2)', background: '#1d1d1d', color: 'white', fontSize: '0.97rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#ccc', fontSize: '0.82rem', marginBottom: 5 }}>Confirm Password</label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '11px', border: '1px solid rgba(212,175,55,.2)', background: '#1d1d1d', color: 'white', fontSize: '0.97rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #f7d76a, #d4af37)',
                color: '#000',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Create Account & Continue'}
            </button>

            <GoogleSignInButton
              onSuccess={handleGoogleSignIn}
              onError={setError}
              disabled={loading}
              loading={loading}
            />
          </form>
        )}

        {!clientId && import.meta.env.DEV && (
          <p style={{ marginTop: 14, textAlign: 'center', fontSize: '0.78rem', color: '#666' }}>
            Dev: set VITE_GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID on API
          </p>
        )}

        <div style={{ marginTop: 18, textAlign: 'center', fontSize: '0.82rem', color: '#777' }}>
          By continuing you agree to our Terms &amp; Privacy Policy.
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
