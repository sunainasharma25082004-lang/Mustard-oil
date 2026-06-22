export function sanitizePhoneInput(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 10);
}

export function sanitizePincodeInput(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
}

export function isValidIndianPhone(value) {
  return /^[6-9]\d{9}$/.test(sanitizePhoneInput(value));
}

export function isValidPincode(value) {
  return /^\d{6}$/.test(String(value || '').trim());
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function isValidName(value, min = 2) {
  const name = String(value || '').trim();
  return name.length >= min && /^[a-zA-Z\s.'-]+$/.test(name);
}

export function validatePhone(value, { required = true } = {}) {
  if (!String(value || '').trim()) {
    return required ? 'Phone number is required' : '';
  }
  if (!isValidIndianPhone(value)) {
    return 'Enter a valid 10-digit Indian mobile number';
  }
  return '';
}

export function validatePincode(value, { required = true } = {}) {
  if (!String(value || '').trim()) {
    return required ? 'Pincode is required' : '';
  }
  if (!isValidPincode(value)) {
    return 'Enter a valid 6-digit pincode';
  }
  return '';
}

export function validateEmail(value, { required = true } = {}) {
  if (!String(value || '').trim()) {
    return required ? 'Email is required' : '';
  }
  if (!isValidEmail(value)) {
    return 'Enter a valid email address';
  }
  return '';
}

export function validateCheckoutForm(data) {
  const errors = {};

  if (!isValidName(data.fullName)) {
    errors.fullName = 'Enter a valid full name (letters only, min 2 characters)';
  }
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  if (data.email?.trim() && !isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!String(data.address || '').trim() || String(data.address).trim().length < 10) {
    errors.address = 'Enter a complete address (min 10 characters)';
  }

  if (!String(data.city || '').trim() || String(data.city).trim().length < 2) {
    errors.city = 'City is required';
  }

  const pincodeError = validatePincode(data.pincode);
  if (pincodeError) errors.pincode = pincodeError;

  return errors;
}

export function validateDistributorForm(data) {
  const errors = {};

  if (!isValidName(data.name)) {
    errors.name = 'Enter a valid full name';
  }

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  if (!String(data.business || '').trim()) {
    errors.business = 'Business name is required';
  }

  if (!String(data.city || '').trim()) {
    errors.city = 'City is required';
  }

  if (!String(data.state || '').trim()) {
    errors.state = 'State is required';
  }

  if (data.pincode?.trim() && !isValidPincode(data.pincode)) {
    errors.pincode = 'Enter a valid 6-digit pincode';
  }

  if (!String(data.experience || '').trim() || String(data.experience).trim().length < 10) {
    errors.experience = 'Describe your business experience (min 10 characters)';
  }

  if (!String(data.investment || '').trim() || String(data.investment).trim().length < 3) {
    errors.investment = 'Investment capacity is required (min 3 characters)';
  }

  return errors;
}

export function validateContactForm(data) {
  const errors = {};

  if (!isValidName(data.name)) {
    errors.name = 'Enter a valid name';
  }

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  if (!String(data.message || '').trim() || String(data.message).trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}