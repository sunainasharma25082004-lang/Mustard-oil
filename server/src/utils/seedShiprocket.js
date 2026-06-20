const {
  getShiprocketSettings,
  hasStoredCredentials,
  saveShiprocketCredentials,
  saveShiprocketConfig,
  getDecryptedCredentials,
  testShiprocketConnection,
  storeConnectionResult,
  markConnectionFailed,
} = require('./shiprocketHelpers');

const tryAutoEnableShiprocket = async () => {
  if (process.env.NODE_ENV !== 'production') return;

  const settings = await getShiprocketSettings();
  if (!hasStoredCredentials(settings)) return;
  if (settings.enabled && settings.connectionStatus === 'connected') return;

  const pickup = settings.pickupPincode?.trim() || settings.companyPincode?.trim();
  if (!pickup) {
    console.warn('[Seed] Shiprocket auto-enable skipped: pickup pincode missing');
    return;
  }

  try {
    const { email, password } = getDecryptedCredentials(settings);
    const { token } = await testShiprocketConnection(email, password);
    await storeConnectionResult(settings, token);
    settings.enabled = true;
    await settings.save();
    console.log('Shiprocket auto-enabled in production (API connection verified)');
  } catch (err) {
    try {
      await markConnectionFailed(settings);
    } catch {
      // ignore
    }
    console.warn('[Seed] Shiprocket auto-enable skipped:', err.message);
  }
};

const seedShiprocket = async () => {
  const settings = await getShiprocketSettings();
  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD?.trim();

  if (!hasStoredCredentials(settings) && email && password) {
    await saveShiprocketCredentials({ email, password, enabled: false });
    console.log('Shiprocket credentials seeded from environment (disabled until tested in admin)');
  }

  const config = {
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION?.trim(),
    pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE?.trim(),
    companyName: process.env.SHIPROCKET_COMPANY_NAME?.trim(),
    companyPhone: process.env.SHIPROCKET_COMPANY_PHONE?.trim(),
    companyEmail: process.env.SHIPROCKET_COMPANY_EMAIL?.trim(),
    companyAddress: process.env.SHIPROCKET_COMPANY_ADDRESS?.trim(),
    companyCity: process.env.SHIPROCKET_COMPANY_CITY?.trim(),
    companyState: process.env.SHIPROCKET_COMPANY_STATE?.trim(),
    companyPincode: process.env.SHIPROCKET_COMPANY_PINCODE?.trim(),
    defaultWeight: process.env.SHIPROCKET_DEFAULT_WEIGHT
      ? Number(process.env.SHIPROCKET_DEFAULT_WEIGHT)
      : undefined,
    defaultLength: process.env.SHIPROCKET_DEFAULT_LENGTH
      ? Number(process.env.SHIPROCKET_DEFAULT_LENGTH)
      : undefined,
    defaultBreadth: process.env.SHIPROCKET_DEFAULT_BREADTH
      ? Number(process.env.SHIPROCKET_DEFAULT_BREADTH)
      : undefined,
    defaultHeight: process.env.SHIPROCKET_DEFAULT_HEIGHT
      ? Number(process.env.SHIPROCKET_DEFAULT_HEIGHT)
      : undefined,
    autoAssignAwb: process.env.SHIPROCKET_AUTO_ASSIGN_AWB !== 'false',
  };

  const hasConfig = Object.values(config).some((v) => v !== undefined && v !== '');
  if (hasConfig) {
    await saveShiprocketConfig(config);
    console.log('Shiprocket warehouse config seeded from environment');
  }

  await tryAutoEnableShiprocket();
};

module.exports = seedShiprocket;