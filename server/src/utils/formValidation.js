const sanitizeDigits = (value, maxLen) =>
  String(value || '').replace(/\D/g, '').slice(0, maxLen);

const normalizePhone = (value) => sanitizeDigits(value, 10);

const isValidIndianPhone = (value) => /^[6-9]\d{9}$/.test(normalizePhone(value));

const isValidPincode = (value) => /^\d{6}$/.test(String(value || '').trim());

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const isValidName = (value, min = 2) => {
  const name = String(value || '').trim();
  return name.length >= min && /^[a-zA-Z\s.'-]+$/.test(name);
};

const validatePhone = (value, { required = true } = {}) => {
  if (!value?.trim()) {
    return required ? 'Phone number is required' : null;
  }
  if (!isValidIndianPhone(value)) {
    return 'Enter a valid 10-digit Indian mobile number';
  }
  return null;
};

const validatePincode = (value, { required = true } = {}) => {
  if (!value?.trim()) {
    return required ? 'Pincode is required' : null;
  }
  if (!isValidPincode(value)) {
    return 'Enter a valid 6-digit pincode';
  }
  return null;
};

const validateEmail = (value, { required = true } = {}) => {
  if (!value?.trim()) {
    return required ? 'Email is required' : null;
  }
  if (!isValidEmail(value)) {
    return 'Enter a valid email address';
  }
  return null;
};

module.exports = {
  sanitizeDigits,
  normalizePhone,
  isValidIndianPhone,
  isValidPincode,
  isValidEmail,
  isValidName,
  validatePhone,
  validatePincode,
  validateEmail,
};