const { OAuth2Client } = require('google-auth-library');

const getGoogleClientId = () => process.env.GOOGLE_CLIENT_ID?.trim() || '';

const isGoogleAuthConfigured = () => Boolean(getGoogleClientId());

const verifyGoogleIdToken = async (idToken) => {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google sign-in is not configured on server');
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload?.email) {
    throw new Error('Google account details incomplete');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split('@')[0],
    picture: payload.picture || '',
    emailVerified: payload.email_verified !== false,
  };
};

module.exports = {
  getGoogleClientId,
  isGoogleAuthConfigured,
  verifyGoogleIdToken,
};