const { DELIVERY_CHARGE, resolveDeliveryCharge } = require('../utils/orderHelpers');
const { getPublicShippingConfig } = require('../utils/shiprocketHelpers');

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

    const units = Math.max(1, Number(quantity) || 1);
    const quote = await resolveDeliveryCharge({
      pincode: deliveryPincode,
      totalQuantity: units,
    });

    res.json({
      success: true,
      data: {
        ...quote,
        pickupPincode: quote.pickupPincode || undefined,
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