import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sanitizePhoneInput, validatePhone } from '../utils/formValidation';

// NOTE: This component is deprecated.
// New professional flow uses AuthModal + separate "Sign in required" card in Checkout.
// Kept for reference / possible future use.

function PaymentAuth({ prefill = {}, onAuthenticated }) {
  const { login, register, updateProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: prefill.email || '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: prefill.name || '',
    email: prefill.email || '',
    phone: prefill.phone || '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (prefill.email) {
      setLoginData((prev) => ({ ...prev, email: prefill.email }));
      setRegisterData((prev) => ({
        ...prev,
        name: prefill.name || prev.name,
        email: prefill.email || prev.email,
        phone: prefill.phone || prev.phone,
      }));
    }
  }, [prefill.email, prefill.name, prefill.phone]);

  const syncShippingToProfile = async () => {
    if (!prefill.address && !prefill.city && !prefill.pincode) return;
    try {
      await updateProfile({
        name: prefill.name,
        phone: prefill.phone,
        address: prefill.address,
        city: prefill.city,
        pincode: prefill.pincode,
      });
    } catch {
      /* non-blocking */
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      await syncShippingToProfile();
      onAuthenticated?.();
    } catch (err) {
      setError(err.message);
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
        address: prefill.address,
        city: prefill.city,
        pincode: prefill.pincode,
      });
      await syncShippingToProfile();
      onAuthenticated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-auth" id="payment-auth-section">
      <p className="payment-auth-note">
        Sign in or create an account to continue with payment. No login needed until this step.
      </p>

      <div className="payment-auth-tabs">
        <button
          type="button"
          className={isLogin ? 'active' : ''}
          onClick={() => { setIsLogin(true); setError(''); }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={!isLogin ? 'active' : ''}
          onClick={() => { setIsLogin(false); setError(''); }}
        >
          Register
        </button>
      </div>

      {error && <div className="checkout-error">{error}</div>}

      {isLogin ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="place-order-btn" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? 'Signing In...' : 'Sign In & Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: sanitizePhoneInput(e.target.value) })}
              required
              inputMode="numeric"
              maxLength={10}
              pattern="[6-9][0-9]{9}"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="place-order-btn" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? 'Creating Account...' : 'Create Account & Continue'}
          </button>
        </form>
      )}
    </div>
  );
}

export default PaymentAuth;