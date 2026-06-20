import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './GoogleSignInButton';

function GoogleAuthProvider({ children }) {
  if (!GOOGLE_CLIENT_ID) {
    return children;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}

export default GoogleAuthProvider;