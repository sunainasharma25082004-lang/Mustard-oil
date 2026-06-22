import { useState } from 'react';
import { sanitizePhoneInput, validatePhone } from '../utils/formValidation';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle } = useAuth();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      const redirectTo = location.state?.from || '/';
      if (typeof redirectTo === 'string' && redirectTo.includes('#')) {
        const [pathname, hash] = redirectTo.split('#');
        navigate({ pathname: pathname || '/', hash: hash ? `#${hash}` : undefined }, { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credential) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      const redirectTo = location.state?.from || '/';
      if (typeof redirectTo === 'string' && redirectTo.includes('#')) {
        const [pathname, hash] = redirectTo.split('#');
        navigate({ pathname: pathname || '/', hash: hash ? `#${hash}` : undefined }, { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
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
      });
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`

      .auth-page{
        min-height:100vh;
        background:#0b0b0b;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:40px 20px;
        position:relative;
        overflow:hidden;
      }

      .auth-page::before{
        content:"";
        position:absolute;
        width:500px;
        height:500px;
        border-radius:50%;
        background:rgba(212,175,55,.08);
        top:-200px;
        right:-150px;
        filter:blur(120px);
      }

      .auth-card{
        width:100%;
        max-width:500px;
        background:#141414;
        border:1px solid rgba(212,175,55,.2);
        border-radius:30px;
        padding:40px;
        position:relative;
        z-index:2;
        box-shadow:0 20px 50px rgba(0,0,0,.4);
      }

      .brand{
        text-align:center;
        margin-bottom:25px;
      }

      .brand h1{
        color:#d4af37;
        font-size:2.5rem;
        margin-bottom:10px;
      }

      .brand p{
        color:#bdbdbd;
      }

      .tab-buttons{
        display:flex;
        background:#1b1b1b;
        border-radius:50px;
        padding:5px;
        margin-bottom:30px;
      }

      .tab-btn{
        flex:1;
        border:none;
        background:transparent;
        color:#fff;
        padding:12px;
        border-radius:50px;
        cursor:pointer;
        transition:.3s;
      }

      .tab-btn.active{
        background:linear-gradient(
          135deg,
          #f5d76e,
          #d4af37
        );
        color:#000;
        font-weight:700;
      }

      .auth-input{
        width:100%;
        padding:15px 18px;
        margin-bottom:15px;
        border-radius:14px;
        border:1px solid rgba(212,175,55,.15);
        background:#1d1d1d;
        color:#fff;
        outline:none;
      }

      .auth-input:focus{
        border-color:#d4af37;
      }

      .auth-btn{
        width:100%;
        border:none;
        padding:15px;
        border-radius:50px;
        margin-top:10px;
        font-weight:700;
        background:linear-gradient(
          135deg,
          #f5d76e,
          #d4af37
        );
        color:#000;
        cursor:pointer;
        transition:.3s;
      }

      .auth-btn:disabled{
        opacity:0.6;
        cursor:not-allowed;
      }

      .auth-btn:hover:not(:disabled){
        transform:translateY(-3px);
        box-shadow:0 10px 25px rgba(212,175,55,.35);
      }

      .auth-footer{
        text-align:center;
        margin-top:20px;
        color:#bdbdbd;
      }

      .auth-footer span{
        color:#d4af37;
        cursor:pointer;
        font-weight:600;
      }

      .auth-error{
        background:rgba(220,53,69,.15);
        border:1px solid rgba(220,53,69,.4);
        color:#ff6b6b;
        padding:12px;
        border-radius:12px;
        margin-bottom:15px;
        font-size:14px;
      }

      @media(max-width:576px){

        .auth-card{
          padding:25px;
        }

        .brand h1{
          font-size:2rem;
        }

      }

      `}</style>

      <div className="auth-page">

        <div className="auth-card">

          <div className="brand">
            <h1>Karyor</h1>
            <p>Premium Mustard Oil</p>
          </div>

          <div className="tab-buttons">

            <button
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Sign In
            </button>

            <button
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Register
            </button>

          </div>

          {error && <div className="auth-error">{error}</div>}

          {isLogin ? (
            <form onSubmit={handleLogin}>

              <input
                type="email"
                placeholder="Email Address"
                className="auth-input"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="auth-input"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />

              <button className="auth-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
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

              <input
                type="text"
                placeholder="Full Name"
                className="auth-input"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                className="auth-input"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
              />

              <input
                type="tel"
                placeholder="Phone Number *"
                className="auth-input"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: sanitizePhoneInput(e.target.value) })}
                required
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
              />

              <input
                type="password"
                placeholder="Password"
                className="auth-input"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                minLength={6}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="auth-input"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                required
              />

              <button className="auth-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <GoogleSignInButton
                onSuccess={handleGoogleSignIn}
                onError={setError}
                disabled={loading}
                loading={loading}
              />

            </form>
          )}

          <div className="auth-footer">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <span onClick={() => { setIsLogin(false); setError(''); }}>
                  Register
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span onClick={() => { setIsLogin(true); setError(''); }}>
                  Sign In
                </span>
              </>
            )}
          </div>

        </div>

      </div>
    </>
  );
}

export default SignIn;