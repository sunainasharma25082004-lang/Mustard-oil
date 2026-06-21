import { GoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { formatGoogleSignInError, getCurrentOrigin, getRequiredGoogleOrigins } from '../utils/googleOAuth';

function GoogleSignInButton({ onSuccess, onError, disabled, loading, width = 320 }) {
  const { clientId, ready } = useGoogleAuth();

  if (!ready || !clientId) {
    return null;
  }

  return (
    <div style={{ marginTop: width >= 360 ? 16 : 12, width: '100%' }}>
      {width >= 360 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
            color: '#666',
            fontSize: '0.82rem',
          }}
        >
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />
          <span>or</span>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          opacity: disabled || loading ? 0.6 : 1,
          pointerEvents: disabled || loading ? 'none' : 'auto',
        }}
      >
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.(formatGoogleSignInError('Google sign-in failed. Try again.'));
            }
          }}
          onError={() => onError?.(formatGoogleSignInError('Google sign-in cancelled or failed'))}
          theme="filled_black"
          size="large"
          width={width}
          text="continue_with"
          shape="pill"
          locale="en"
        />
      </div>

      {import.meta.env.DEV && (
        <p style={{ marginTop: 10, textAlign: 'center', fontSize: '0.72rem', color: '#666' }}>
          Dev origin: <code style={{ color: '#d4af37' }}>{getCurrentOrigin()}</code>
          {' · '}
          also add: {getRequiredGoogleOrigins().filter((o) => o !== getCurrentOrigin()).join(', ')}
        </p>
      )}
    </div>
  );
}

export default GoogleSignInButton;