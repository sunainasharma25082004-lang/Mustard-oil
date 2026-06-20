import { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { authApi } from '../utils/api';

const GoogleAuthContext = createContext({ clientId: '', ready: false });

export function GoogleAuthProvider({ children }) {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
  const [clientId, setClientId] = useState(envClientId);
  const [ready, setReady] = useState(Boolean(envClientId));

  useEffect(() => {
    if (envClientId) {
      setClientId(envClientId);
      setReady(true);
      return;
    }

    authApi
      .getGoogleConfig()
      .then((res) => {
        const id = res.data?.clientId?.trim();
        if (id) setClientId(id);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [envClientId]);

  const value = { clientId, ready };

  if (!clientId) {
    return (
      <GoogleAuthContext.Provider value={value}>{children}</GoogleAuthContext.Provider>
    );
  }

  return (
    <GoogleAuthContext.Provider value={value}>
      <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
  }
  return context;
}