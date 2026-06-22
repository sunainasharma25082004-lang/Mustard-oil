const Product = require('../models/Product');
const {
  checkServiceability,
  getPublicShippingConfig,
  isShiprocketEnabled,
} = require('./shiprocketHelpers');

const DELIVERY_CHARGE = 0;

const getTotalUnits = (items, totalQuantity) => {
  if (Array.isArray(items) && items.length > 0) {
    return items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
  }
  return Math.max(1, Number(totalQuantity) || 1);
};

const resolveDeliveryCharge = async ({ pincode, items, totalQuantity }) => {
  const deliveryPincode = String(pincode || '').trim();

  if (!/^\d{6}$/.test(deliveryPincode)) {
    throw new Error('Valid 6-digit delivery pincode is required');
  }

  const enabled = await isShiprocketEnabled();
  if (!enabled) {
    return {
      deliveryCharge: DELIVERY_CHARGE,
      serviceable: true,
      shiprocketEnabled: false,
      message: 'Standard delivery available',
    };
  }

  const config = await getPublicShippingConfig();
  const unitWeight = Number(config.defaultWeight) || 0.5;
  const units = getTotalUnits(items, totalQuantity);
  const weight = Math.max(0.1, Number((unitWeight * units).toFixed(2)));

  const result = await checkServiceability({
    deliveryPincode,
    weight,
    cod: false,
  });

  if (!result.serviceable || result.freightCharge == null) {
    return {
      deliveryCharge: 0,
      serviceable: false,
      shiprocketEnabled: true,
      estimatedDeliveryDays: result.estimatedDeliveryDays,
      courierName: null,
      message: 'Delivery not available to this pincode via Shiprocket',
    };
  }

  return {
    deliveryCharge: Math.round(result.freightCharge),
    serviceable: true,
    shiprocketEnabled: true,
    estimatedDeliveryDays: result.estimatedDeliveryDays,
    courierName: result.recommendedCourier?.courier_name || null,
    message: 'Delivery available to this pincode',
  };
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KRY-${timestamp}-${random}`;
};

const buildOrderFromItems = async (items, customer) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product || !product.isActive || !product.inStock) {
      throw new Error(`Product unavailable: ${item.productName || item.productId}`);
    }

    const quantity = Math.max(1, Number(item.quantity) || 1);
    subtotal += product.price * quantity;

    orderItems.push({
      product: product._id,
      productName: product.name,
      quantity,
      price: product.price,
    });
  }

  const quote = await resolveDeliveryCharge({
    pincode: customer?.pincode,
    items: orderItems,
  });

  if (!quote.serviceable) {
    throw new Error(quote.message || 'Delivery not available to this pincode');
  }

  const deliveryCharge = quote.deliveryCharge;
  const totalAmount = subtotal + deliveryCharge;

  return { orderItems, subtotal, deliveryCharge, totalAmount, deliveryQuote: quote };
};

const {
  isValidIndianPhone,
  isValidPincode,
  isValidName,
} = require('./formValidation');

const validateCustomer = (customer) => {
  if (!customer?.fullName || !customer?.phone || !customer?.address || !customer?.city || !customer?.pincode) {
    throw new Error('Complete shipping details are required');
  }
  if (!isValidName(customer.fullName)) {
    throw new Error('Enter a valid full name');
  }
  if (!isValidIndianPhone(customer.phone)) {
    throw new Error('Enter a valid 10-digit Indian mobile number');
  }
  if (!isValidPincode(customer.pincode)) {
    throw new Error('Enter a valid 6-digit pincode');
  }
  if (String(customer.address).trim().length < 10) {
    throw new Error('Enter a complete delivery address');
  }
  if (!String(customer.city).trim()) {
    throw new Error('City is required');
  }
};

module.exports = {
  DELIVERY_CHARGE,
  generateOrderNumber,
  buildOrderFromItems,
  validateCustomer,
  resolveDeliveryCharge,
};