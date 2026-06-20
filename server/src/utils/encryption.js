const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTED_PATTERN = /^[0-9a-f]{32}:[0-9a-f]{32}:[0-9a-f]+$/i;

const deriveKey = (secret) => crypto.createHash('sha256').update(String(secret)).digest();

const getEncryptionKeyCandidates = () => {
  const seen = new Set();
  const keys = [];

  const add = (secret) => {
    if (!secret?.trim()) return;
    const key = deriveKey(secret.trim());
    const fingerprint = key.toString('hex');
    if (seen.has(fingerprint)) return;
    seen.add(fingerprint);
    keys.push(key);
  };

  add(process.env.SETTINGS_ENCRYPTION_KEY);
  add(process.env.JWT_SECRET);

  if (keys.length === 0) {
    throw new Error('SETTINGS_ENCRYPTION_KEY or JWT_SECRET is required for credential encryption');
  }

  return keys;
};

const getPrimaryEncryptionKey = () => getEncryptionKeyCandidates()[0];

const isEncryptedValue = (value) => ENCRYPTED_PATTERN.test(String(value || '').trim());

const decryptWithKey = (encryptedText, key) => {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const encrypt = (text) => {
  if (!text) return '';
  const key = getPrimaryEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

const decrypt = (encryptedText) => {
  if (!encryptedText) return '';

  const value = String(encryptedText).trim();

  if (!isEncryptedValue(value)) {
    return value;
  }

  const candidates = getEncryptionKeyCandidates();
  let lastError = null;

  for (const key of candidates) {
    try {
      return decryptWithKey(value, key);
    } catch (err) {
      lastError = err;
    }
  }

  const isAuthError = /unable to authenticate|unsupported state/i.test(lastError?.message || '');
  throw new Error(
    isAuthError
      ? 'Saved credentials cannot be decrypted — encryption key changed. Re-enter and save Shiprocket/Razorpay password in admin panel.'
      : lastError?.message || 'Credential decryption failed'
  );
};

const safeDecrypt = (encryptedText) => {
  try {
    return decrypt(encryptedText);
  } catch {
    return '';
  }
};

const maskSecret = (value) => {
  if (!value) return '';
  const str = String(value);
  if (str.length <= 4) return '****';
  return `${'*'.repeat(Math.min(str.length - 4, 12))}${str.slice(-4)}`;
};

module.exports = {
  encrypt,
  decrypt,
  safeDecrypt,
  isEncryptedValue,
  maskSecret,
};