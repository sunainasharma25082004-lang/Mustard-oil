const { DELIVERY_CHARGE } = require('../utils/orderHelpers');
const {
  checkServiceability,
  getPublicShippingConfig,
  isShiprocketEnabled,
} = require('../utils/shiprocketHelpers');

const getShippingConfig = async (req, res, next) => {
  try {
    const config = await getPublicShippingConfig();
    res.json({
      success: true,
      data: {
        ...config,
        fallbackDeliveryCharge: DELIVERY_CHARGE,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getServiceability = async (req, res, next) => {
  try {
    const { pincode, weight, quantity } = req.query;
    const deliveryPincode = String(pincode || '').trim();

    if (!/^\d{6}$/.test(deliveryPincode)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 6-digit delivery pincode is required',
      });
    }

    const enabled = await isShiprocketEnabled();
    if (!enabled) {
      return res.json({
        success: true,
        data: {
          serviceable: true,
          shiprocketEnabled: false,
          deliveryCharge: DELIVERY_CHARGE,
          message: 'Standard delivery available',
        },
      });
    }

    const config = await getPublicShippingConfig();
    const unitWeight = Number(config.defaultWeight) || 0.5;
    const units = Math.max(1, Number(quantity) || 1);
    const totalWeight = Math.max(0.1, Number((unitWeight * units).toFixed(2)));

    const result = await checkServiceability({
      deliveryPincode,
      weight: weight ? Number(weight) : totalWeight,
      cod: false,
    });

    const deliveryCharge = DELIVERY_CHARGE;

    res.json({
      success: true,
      data: {
        shiprocketEnabled: true,
        serviceable: result.serviceable,
        deliveryCharge,
        estimatedDeliveryDays: result.estimatedDeliveryDays,
        courierName: result.recommendedCourier?.courier_name || null,
        pickupPincode: result.pickupPincode,
        message: result.serviceable
          ? 'Delivery available to this pincode'
          : 'Delivery not available to this pincode via Shiprocket',
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        serviceable: true,
        shiprocketEnabled: false,
        deliveryCharge: DELIVERY_CHARGE,
        message: 'Using standard delivery rate',
        fallbackReason: error.message,
      },
    });
  }
};

module.exports = { getShippingConfig, getServiceability };