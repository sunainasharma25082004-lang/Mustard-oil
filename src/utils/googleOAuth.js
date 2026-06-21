export function getCurrentOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/** Origins to register in Google Cloud → OAuth Web client → Authorized JavaScript origins */
export function getRequiredGoogleOrigins() {
  const current = getCurrentOrigin();
  const extras = [
    'https://karyor.com',
    'https://www.karyor.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://mustard-oil-frontend.onrender.com',
    'https://karyor-store.onrender.com',
  ];
  return [...new Set([current, ...extras].filter(Boolean))];
}

export function formatGoogleSignInError(message) {
  const origin = getCurrentOrigin();
  const lower = (message || '').toLowerCase();

  if (
    lower.includes('origin') ||
    lower.includes('blocked') ||
    lower.includes('mismatch') ||
    lower.includes('400') ||
    lower.includes('oauth 2.0 policy')
  ) {
    return `Google OAuth origin_mismatch. Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Web client → Authorized JavaScript origins mein ye URL add karo (bina trailing slash): ${origin}`;
  }

  return `${message || 'Google sign-in failed'}. Agar popup mein "origin_mismatch" dikhe to Google Console mein ye origin add karo: ${origin}`;
}