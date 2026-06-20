import { GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';

function GoogleSignInButton({ onSuccess, onError, disabled, loading }) {
  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div style={{ marginTop: 16 }}>
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          opacity: disabled || loading ? 0.6 : 1,
          pointerEvents: disabled || loading ? 'none' : 'auto',
        }}
      >
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('Google sign-in failed. Try again.');
            }
          }}
          onError={() => onError?.('Google sign-in cancelled or failed')}
          theme="filled_black"
          size="large"
          width={380}
          text="continue_with"
          shape="pill"
          locale="en"
        />
      </div>
    </div>
  );
}

export { GOOGLE_CLIENT_ID };
export default GoogleSignInButton;