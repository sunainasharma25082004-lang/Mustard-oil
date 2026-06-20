const Razorpay = require('razorpay');
const PaymentGatewaySettings = require('../models/PaymentGatewaySettings');
const { encrypt, decrypt } = require('./encryption');

const SETTINGS_KEY = 'payment_gateways';

const GATEWAY_FIELDS = {
  razorpay: ['keyId', 'keySecret'],
  paytm: ['merchantId', 'merchantKey', 'website'],
  instamojo: ['apiKey', 'authToken', 'salt'],
  cashfree: ['appId', 'secretKey'],
};

const GATEWAY_LABELS = {
  razorpay: 'Razorpay',
  paytm: 'Paytm',
  instamojo: 'Instamojo',
  cashfree: 'Cashfree',
};

const encryptGatewayData = (gateway, data) => {
  const result = { ...data };
  for (const field of GATEWAY_FIELDS[gateway] || []) {
    if (result[field] && !String(result[field]).includes(':')) {
      result[field] = encrypt(result[field]);
    }
  }
  return result;
};

const decryptGatewayData = (gateway, data) => {
  const result = { ...(data?.toObject?.() || data) };
  for (const field of GATEWAY_FIELDS[gateway] || []) {
    if (result[field]) {
      try {
        result[field] = decrypt(result[field]);
      } catch (err) {
        throw new Error(
          `${GATEWAY_LABELS[gateway] || gateway} ${field} decrypt failed — re-save credentials in admin. ${err.message}`
        );
      }
    }
  }
  return result;
};

const getPaymentGatewaySettings = async () => {
  let settings = await PaymentGatewaySettings.findOne({ key: SETTINGS_KEY });
  if (!settings) {
    settings = await PaymentGatewaySettings.create({ key: SETTINGS_KEY });
  }
  return settings;
};

const gatewayHasStoredCredentials = (gateway, data) => {
  const decrypted = decryptGatewayData(gateway, data);
  return GATEWAY_FIELDS[gateway].every((field) => Boolean(decrypted[field]?.trim()));
};

const getEnvRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) return null;

  return {
    gateway: 'razorpay',
    credentials: {
      keyId,
      keySecret,
      environment: keyId.includes('test') ? 'test' : 'production',
    },
    enabled: true,
    source: 'env',
  };
};

const getActiveGatewayCredentials = async () => {
  const settings = await getPaymentGatewaySettings();
  const gateway = settings.activeGateway;

  if (!gateway || gateway === 'none') {
    const envFallback = getEnvRazorpayCredentials();
    if (envFallback) {
      return { ...envFallback, settings };
    }
    return { gateway: null, credentials: null, enabled: false, settings };
  }

  const gatewayData = settings[gateway];
  if (!gatewayData?.enabled) {
    const envFallback = getEnvRazorpayCredentials();
    if (envFallback) {
      return { ...envFallback, settings };
    }
    return { gateway, credentials: null, enabled: false, settings };
  }

  const credentials = decryptGatewayData(gateway, gatewayData.toObject());
  const hasCredentials = GATEWAY_FIELDS[gateway].every((field) =>
    Boolean(credentials[field]?.trim())
  );

  if (!hasCredentials) {
    const envFallback = getEnvRazorpayCredentials();
    if (gateway === 'razorpay' && envFallback) {
      return { ...envFallback, settings };
    }
    return { gateway, credentials: null, enabled: false, settings };
  }

  return { gateway, credentials, enabled: true, settings, source: 'database' };
};

const getRazorpayFromSettings = async () => {
  const { gateway, credentials, enabled } = await getActiveGatewayCredentials();

  if (gateway === 'razorpay' && enabled && credentials?.keyId && credentials?.keySecret) {
    return new Razorpay({
      key_id: credentials.keyId,
      key_secret: credentials.keySecret,
    });
  }

  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return null;
};

const getPublicPaymentConfig = async () => {
  const { gateway, credentials, enabled } = await getActiveGatewayCredentials();

  if (!enabled || !gateway) {
    if (process.env.RAZORPAY_KEY_ID) {
      return {
        activeGateway: 'razorpay',
        keyId: process.env.RAZORPAY_KEY_ID,
        enabled: true,
        label: 'Razorpay',
      };
    }
    return { activeGateway: 'none', keyId: null, enabled: false, label: null };
  }

  const publicFields = {
    razorpay: 'keyId',
    paytm: 'merchantId',
    instamojo: 'apiKey',
    cashfree: 'appId',
  };

  return {
    activeGateway: gateway,
    keyId: credentials[publicFields[gateway]] || null,
    enabled: true,
    environment: credentials.environment || 'test',
    label: GATEWAY_LABELS[gateway] || gateway,
  };
};

const validateRazorpay = async (credentials) => {
  if (!credentials.keyId || !credentials.keySecret) {
    throw new Error('Razorpay Key ID and Key Secret are required');
  }
  const instance = new Razorpay({
    key_id: credentials.keyId,
    key_secret: credentials.keySecret,
  });
  await instance.orders.create({
    amount: 100,
    currency: 'INR',
    receipt: `validate-${Date.now()}`,
  });
};

const validatePaytm = async (credentials) => {
  if (!credentials.merchantId || !credentials.merchantKey) {
    throw new Error('Paytm Merchant ID and Merchant Key are required');
  }
  if (!credentials.website?.trim()) {
    throw new Error('Paytm Website (e.g. WEBSTAGING) is required');
  }

  const isTest = credentials.environment !== 'production';
  const baseUrl = isTest
    ? 'https://securegw-stage.paytm.in'
    : 'https://securegw.paytm.in';

  const url = `${baseUrl}/merchant-status/getMidStatus?mid=${encodeURIComponent(credentials.merchantId)}`;
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Paytm merchant validation failed');
  }

  if (data.resultInfo?.resultStatus && data.resultInfo.resultStatus !== 'SUCCESS') {
    throw new Error(data.resultInfo?.resultMsg || 'Invalid Paytm Merchant ID');
  }
};

const validateInstamojo = async (credentials) => {
  if (!credentials.apiKey || !credentials.authToken) {
    throw new Error('Instamojo API Key and Auth Token are required');
  }

  const isTest = credentials.environment !== 'production';
  const baseUrl = isTest
    ? 'https://test.instamojo.com/api/1.1'
    : 'https://www.instamojo.com/api/1.1';

  const response = await fetch(`${baseUrl}/payments/`, {
    headers: {
      'X-Api-Key': credentials.apiKey,
      'X-Auth-Token': credentials.authToken,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid Instamojo API Key or Auth Token');
  }

  if (!response.ok && response.status !== 404) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Instamojo credential validation failed');
  }
};

const validateCashfree = async (credentials) => {
  if (!credentials.appId || !credentials.secretKey) {
    throw new Error('Cashfree App ID and Secret Key are required');
  }

  const isTest = credentials.environment !== 'production';
  const baseUrl = isTest
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg';

  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': credentials.appId,
      'x-client-secret': credentials.secretKey,
      'x-api-version': '2023-08-01',
    },
    body: JSON.stringify({
      order_id: `validate_${Date.now()}`,
      order_amount: 1,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'validate_customer',
        customer_email: 'validate@karyor.com',
        customer_phone: '9999999999',
      },
    }),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid Cashfree App ID or Secret Key');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.message || data.error?.message;
    if (message && /invalid|unauthorized|credential/i.test(message)) {
      throw new Error(message);
    }
  }
};

const validateGatewayCredentials = async (gateway, credentials) => {
  if (gateway === 'razorpay') return validateRazorpay(credentials);
  if (gateway === 'paytm') return validatePaytm(credentials);
  if (gateway === 'instamojo') return validateInstamojo(credentials);
  if (gateway === 'cashfree') return validateCashfree(credentials);
  throw new Error('Invalid payment gateway');
};

const maskGatewayForAdmin = (gateway, data) => {
  const source = data?.toObject?.() || data || {};
  const masked = {
    enabled: Boolean(source.enabled),
    environment: source.environment || 'test',
    validationStatus: source.validationStatus || 'unknown',
    lastValidatedAt: source.lastValidatedAt || null,
    configured: gatewayHasStoredCredentials(gateway, source),
  };

  for (const field of GATEWAY_FIELDS[gateway] || []) {
    masked[field] = source[field] ? '********' : '';
  }

  return masked;
};

const assertGatewayCanBeActivated = (settings, gateway) => {
  if (gateway === 'none') return true;

  const validGateways = ['razorpay', 'paytm', 'instamojo', 'cashfree'];
  if (!validGateways.includes(gateway)) {
    throw new Error('Invalid payment gateway');
  }

  const gatewayData = settings[gateway];
  if (!gatewayData?.enabled) {
    throw new Error(`${GATEWAY_LABELS[gateway]} must be enabled before it can be set as active`);
  }

  if (!gatewayHasStoredCredentials(gateway, gatewayData)) {
    throw new Error(`${GATEWAY_LABELS[gateway]} credentials are not configured`);
  }

  if (gatewayData.validationStatus !== 'valid') {
    throw new Error(`${GATEWAY_LABELS[gateway]} credentials must be validated before activation`);
  }

  return true;
};

module.exports = {
  SETTINGS_KEY,
  GATEWAY_FIELDS,
  GATEWAY_LABELS,
  encryptGatewayData,
  decryptGatewayData,
  getPaymentGatewaySettings,
  getActiveGatewayCredentials,
  getRazorpayFromSettings,
  getPublicPaymentConfig,
  validateGatewayCredentials,
  maskGatewayForAdmin,
  gatewayHasStoredCredentials,
  assertGatewayCanBeActivated,
};