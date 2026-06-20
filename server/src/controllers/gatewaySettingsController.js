const {
  getPaymentGatewaySettings,
  encryptGatewayData,
  decryptGatewayData,
  validateGatewayCredentials,
  maskGatewayForAdmin,
  GATEWAY_FIELDS,
  GATEWAY_LABELS,
  assertGatewayCanBeActivated,
  gatewayHasStoredCredentials,
} = require('../utils/paymentGatewayHelpers');

const formatSettingsForAdmin = (settings) => {
  const obj = settings.toObject();
  const gateways = ['razorpay', 'paytm', 'instamojo', 'cashfree'];

  const gatewayData = {};
  for (const gw of gateways) {
    gatewayData[gw] = maskGatewayForAdmin(gw, obj[gw]);
  }

  return {
    activeGateway: obj.activeGateway,
    ...gatewayData,
    updatedAt: obj.updatedAt,
  };
};

const getGatewaySettings = async (req, res, next) => {
  try {
    const settings = await getPaymentGatewaySettings();
    res.json({ success: true, data: formatSettingsForAdmin(settings) });
  } catch (error) {
    next(error);
  }
};

const mergeGatewayCredentials = (gateway, existing, incoming) => {
  const merged = {};
  const existingDecrypted = decryptGatewayData(gateway, existing);

  for (const field of GATEWAY_FIELDS[gateway]) {
    const value = incoming[field];
    if (value && value !== '********') {
      merged[field] = value;
    } else if (existingDecrypted[field]) {
      merged[field] = existingDecrypted[field];
    }
  }

  merged.environment = incoming.environment || existing.environment || 'test';
  return merged;
};

const updateGatewaySettings = async (req, res, next) => {
  try {
    const { gateway, credentials, enabled, activeGateway, action } = req.body;
    const settings = await getPaymentGatewaySettings();
    const validGateways = ['razorpay', 'paytm', 'instamojo', 'cashfree'];

    if (activeGateway !== undefined) {
      try {
        assertGatewayCanBeActivated(settings, activeGateway);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      settings.activeGateway = activeGateway;
    }

    if (gateway && validGateways.includes(gateway)) {
      const existing = settings[gateway]?.toObject() || {};

      if (action === 'toggle' && typeof enabled === 'boolean') {
        if (enabled) {
          if (!gatewayHasStoredCredentials(gateway, existing)) {
            return res.status(400).json({
              success: false,
              message: `Save and validate ${GATEWAY_LABELS[gateway]} credentials before enabling`,
            });
          }
          if (existing.validationStatus !== 'valid') {
            return res.status(400).json({
              success: false,
              message: `${GATEWAY_LABELS[gateway]} credentials must be validated before enabling`,
            });
          }
        }

        settings[gateway].enabled = enabled;
        settings.markModified(gateway);
      } else if (credentials) {
        const mergedCredentials = mergeGatewayCredentials(gateway, existing, credentials);

        try {
          await validateGatewayCredentials(gateway, mergedCredentials);
        } catch (err) {
          settings[gateway].validationStatus = 'invalid';
          settings.markModified(gateway);
          await settings.save();

          return res.status(400).json({
            success: false,
            message: `Credential validation failed: ${err.message}`,
          });
        }

        const encrypted = encryptGatewayData(gateway, {
          ...mergedCredentials,
          enabled: typeof enabled === 'boolean' ? enabled : existing.enabled ?? false,
          lastValidatedAt: new Date(),
          validationStatus: 'valid',
        });

        settings[gateway] = encrypted;
        settings.markModified(gateway);
      } else if (typeof enabled === 'boolean') {
        if (enabled && !gatewayHasStoredCredentials(gateway, existing)) {
          return res.status(400).json({
            success: false,
            message: `Save and validate ${GATEWAY_LABELS[gateway]} credentials before enabling`,
          });
        }
        settings[gateway].enabled = enabled;
        settings.markModified(gateway);
      }
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Payment gateway settings updated',
      data: formatSettingsForAdmin(settings),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGatewaySettings, updateGatewaySettings };