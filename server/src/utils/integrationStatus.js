const { isShiprocketEnabled, getShiprocketSettings } = require('./shiprocketHelpers');
const { getPublicPaymentConfig } = require('./paymentGatewayHelpers');

const getPublicApiBaseUrl = () => {
  const url = (process.env.API_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '').trim();
  return url.replace(/\/$/, '');
};

const getWebhookUrl = () => {
  const base = getPublicApiBaseUrl();
  return base ? `${base}/api/webhooks/shiprocket` : null;
};

const getIntegrationStatus = async () => {
  const [shiprocketEnabled, paymentConfig, shiprocketSettings] = await Promise.all([
    isShiprocketEnabled(),
    getPublicPaymentConfig(),
    getShiprocketSettings(),
  ]);

  return {
    payment: {
      enabled: Boolean(paymentConfig.enabled),
      gateway: paymentConfig.activeGateway || 'none',
    },
    shiprocket: {
      enabled: shiprocketEnabled,
      configured: Boolean(shiprocketSettings.email && shiprocketSettings.password),
      connectionStatus: shiprocketSettings.connectionStatus || 'unknown',
      pickupPincode: shiprocketSettings.pickupPincode || shiprocketSettings.companyPincode || '',
    },
    webhooks: {
      shiprocketUrl: getWebhookUrl(),
      secretConfigured: Boolean(process.env.SHIPROCKET_WEBHOOK_SECRET?.trim()),
    },
    apiPublicUrl: getPublicApiBaseUrl() || null,
  };
};

module.exports = { getIntegrationStatus, getPublicApiBaseUrl, getWebhookUrl };