export function getCurrentOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : '';
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