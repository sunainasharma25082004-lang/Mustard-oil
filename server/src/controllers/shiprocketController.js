const Order = require('../models/Order');
const {
  getShiprocketSettings,
  testShiprocketConnection,
  saveShiprocketCredentials,
  saveShiprocketConfig,
  storeConnectionResult,
  markConnectionFailed,
  formatSettingsForAdmin,
  hasStoredCredentials,
  mergeCredentials,
  createShipmentForOrder,
  syncOrderFromWebhook,
  trackByAwb,
  getShiprocketOrderByChannelId,
  getShiprocketLiveOrderInfo,
} = require('../utils/shiprocketHelpers');

const getSettings = async (req, res, next) => {
  try {
    const settings = await getShiprocketSettings();
    res.json({ success: true, data: formatSettingsForAdmin(settings) });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const {
      email,
      password,
      enabled,
      action,
      pickupLocation,
      pickupPincode,
      companyName,
      companyPhone,
      companyEmail,
      companyAddress,
      companyCity,
      companyState,
      companyPincode,
      defaultWeight,
      defaultLength,
      defaultBreadth,
      defaultHeight,
      autoAssignAwb,
    } = req.body;
    const settings = await getShiprocketSettings();

    if (action === 'toggle' && typeof enabled === 'boolean') {
      if (enabled) {
        if (!hasStoredCredentials(settings)) {
          return res.status(400).json({
            success: false,
            message: 'Save Shiprocket email and password before enabling',
          });
        }
        if (settings.connectionStatus !== 'connected') {
          return res.status(400).json({
            success: false,
            message: 'Test Shiprocket connection successfully before enabling',
          });
        }
        if (!settings.pickupPincode?.trim() && !settings.companyPincode?.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Set warehouse pickup pincode before enabling Shiprocket',
          });
        }
      }

      settings.enabled = enabled;
      await settings.save();

      return res.json({
        success: true,
        message: `Shiprocket integration ${enabled ? 'enabled' : 'disabled'}`,
        data: formatSettingsForAdmin(settings),
      });
    }

    const hasCredentialUpdate = email?.trim() || (password && password !== '********');
    if (hasCredentialUpdate) {
      if (!email?.trim() && !settings.email) {
        return res.status(400).json({ success: false, message: 'Shiprocket email is required' });
      }

      const merged = mergeCredentials(settings, { email, password });
      if (!merged.password) {
        return res.status(400).json({
          success: false,
          message: 'Shiprocket password is required',
        });
      }

      await saveShiprocketCredentials({
        email: merged.email,
        password: merged.password,
        enabled: typeof enabled === 'boolean' ? enabled : settings.enabled,
      });
    }

    const hasConfigUpdate = [
      pickupLocation,
      pickupPincode,
      companyName,
      companyPhone,
      companyEmail,
      companyAddress,
      companyCity,
      companyState,
      companyPincode,
      defaultWeight,
      defaultLength,
      defaultBreadth,
      defaultHeight,
      autoAssignAwb,
    ].some((v) => v !== undefined);

    if (hasConfigUpdate) {
      await saveShiprocketConfig({
        pickupLocation,
        pickupPincode,
        companyName,
        companyPhone,
        companyEmail,
        companyAddress,
        companyCity,
        companyState,
        companyPincode,
        defaultWeight: defaultWeight !== undefined ? Number(defaultWeight) : undefined,
        defaultLength: defaultLength !== undefined ? Number(defaultLength) : undefined,
        defaultBreadth: defaultBreadth !== undefined ? Number(defaultBreadth) : undefined,
        defaultHeight: defaultHeight !== undefined ? Number(defaultHeight) : undefined,
        autoAssignAwb,
      });
    }

    const refreshed = await getShiprocketSettings();
    res.json({
      success: true,
      message: 'Shiprocket settings saved',
      data: formatSettingsForAdmin(refreshed),
    });
  } catch (error) {
    next(error);
  }
};

const testConnection = async (req, res, next) => {
  try {
    const settings = await getShiprocketSettings();
    const { email, password } = req.body;

    let merged;
    try {
      merged = mergeCredentials(settings, { email, password });
    } catch (credError) {
      return res.status(400).json({
        success: false,
        message: credError.message,
      });
    }

    if (!merged.email || !merged.password) {
      return res.status(400).json({
        success: false,
        message:
          'Shiprocket password is required. Enter your API password in the field above (or save credentials first).',
      });
    }

    const result = await testShiprocketConnection(merged.email, merged.password);

    if (merged.email !== settings.email || (password && password !== '********')) {
      await saveShiprocketCredentials({
        email: merged.email,
        password: merged.password,
        enabled: settings.enabled,
      });
    }

    const refreshed = await getShiprocketSettings();
    await storeConnectionResult(refreshed, result.token);

    res.json({
      success: true,
      message: 'Shiprocket connection successful — login verified',
      data: formatSettingsForAdmin(refreshed),
    });
  } catch (error) {
    console.warn('[Shiprocket] Test connection failed:', error.message);

    try {
      const settings = await getShiprocketSettings();
      await markConnectionFailed(settings);
    } catch {
      // ignore secondary failure
    }

    const isAuthError =
      /invalid email and password|authentication failed|HTTP 403/i.test(error.message || '');

    res.status(isAuthError ? 401 : 400).json({
      success: false,
      message: error.message || 'Shiprocket connection test failed',
    });
  }
};

const createShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Shiprocket shipment can only be created for paid orders',
      });
    }

    const result = await createShipmentForOrder(order);

    if (result.skipped) {
      return res.status(400).json({
        success: false,
        message: result.reason,
        data: result.order,
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create Shiprocket shipment',
        data: result.order,
      });
    }

    res.json({
      success: true,
      message: 'Shiprocket shipment created successfully',
      data: result.order,
    });
  } catch (error) {
    next(error);
  }
};

const trackShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const awb = order.shiprocket?.awb;
    if (!awb) {
      return res.status(400).json({
        success: false,
        message: 'No AWB assigned for this order yet',
      });
    }

    const tracking = await trackByAwb(awb);
    res.json({ success: true, data: { order, tracking } });
  } catch (error) {
    next(error);
  }
};

const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.SHIPROCKET_WEBHOOK_SECRET?.trim();
    if (secret) {
      const incoming =
        req.headers['x-shiprocket-token'] ||
        req.headers['x-api-key'] ||
        req.query.token;
      if (incoming !== secret) {
        return res.status(401).json({ success: false, message: 'Invalid webhook token' });
      }
    }

    const payload = req.body || {};
    const result = await syncOrderFromWebhook(payload);

    res.json({
      success: true,
      message: result.found ? 'Order updated from webhook' : 'Webhook received (order not found)',
      data: result,
    });
  } catch (error) {
    console.error('[Shiprocket Webhook]', error.message);
    res.status(200).json({ success: false, message: error.message });
  }
};

const getLiveOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const live = await getShiprocketLiveOrderInfo(order.orderNumber);
    if (!live) {
      return res.status(404).json({
        success: false,
        message: `Order ${order.orderNumber} Shiprocket API pe nahi mila. Galat account se login ho sakte ho.`,
        data: {
          searchWith: order.orderNumber,
          notShipmentId: order.shiprocket?.shipmentId,
          dashboardUrl: 'https://app.shiprocket.in/seller/orders',
        },
      });
    }

    res.json({
      success: true,
      message: 'Order Shiprocket pe mil gaya — neeche details dekho',
      data: { order, live },
    });
  } catch (error) {
    next(error);
  }
};

const verifyShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const remote = await getShiprocketOrderByChannelId(order.orderNumber);
    if (!remote?.shipmentId) {
      return res.status(404).json({
        success: false,
        message: `Order ${order.orderNumber} not found on Shiprocket. Search this number in Shiprocket → Orders.`,
      });
    }

    if (!order.shiprocket) order.shiprocket = {};
    order.shiprocket.shipmentId = remote.shipmentId;
    order.shiprocket.shiprocketOrderId = remote.shiprocketOrderId;
    order.shiprocket.channelOrderId = order.orderNumber;
    order.shiprocket.verified = true;
    order.shiprocket.statusLabel = 'Verified on Shiprocket';
    order.shiprocket.error = '';
    order.shiprocket.lastSyncedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order verified on Shiprocket dashboard',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const resetAndCreateShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Only paid orders can be synced to Shiprocket',
      });
    }

    order.set('shiprocket', { error: '', verified: false });
    await order.save();

    const result = await createShipmentForOrder(order);
    if (!result.success && !result.skipped) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to sync order to Shiprocket',
        data: result.order,
      });
    }

    res.json({
      success: true,
      message: result.skipped ? result.reason : 'Order synced to Shiprocket',
      data: result.order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  testConnection,
  createShipment,
  trackShipment,
  verifyShipment,
  resetAndCreateShipment,
  getLiveOrderStatus,
  handleWebhook,
};