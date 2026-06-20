const {
  getPaymentGatewaySettings,
  encryptGatewayData,
  gatewayHasStoredCredentials,
  validateGatewayCredentials,
} = require('./paymentGatewayHelpers');

const seedPaymentGateways = async () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return;
  }

  const settings = await getPaymentGatewaySettings();
  const razorpay = settings.razorpay?.toObject?.() || settings.razorpay || {};

  if (gatewayHasStoredCredentials('razorpay', razorpay) && razorpay.enabled && razorpay.validationStatus === 'valid') {
    if (settings.activeGateway === 'none') {
      settings.activeGateway = 'razorpay';
      await settings.save();
      console.log('Razorpay set as active gateway (was disabled)');
    }
    return;
  }

  const credentials = {
    keyId,
    keySecret,
    environment: keyId.includes('test') ? 'test' : 'production',
  };

  try {
    await validateGatewayCredentials('razorpay', credentials);
  } catch (err) {
    console.warn('[Seed] Razorpay env credentials invalid — payment seed skipped:', err.message);
    return;
  }

  const encrypted = encryptGatewayData('razorpay', credentials);
  settings.razorpay = {
    ...encrypted,
    enabled: true,
    environment: credentials.environment,
    validationStatus: 'valid',
    lastValidatedAt: new Date(),
  };
  settings.activeGateway = 'razorpay';
  await settings.save();

  console.log('Razorpay payment gateway seeded from environment and activated');
};

module.exports = seedPaymentGateways;