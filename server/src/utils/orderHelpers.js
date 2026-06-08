const Product = require('../models/Product');

const DELIVERY_CHARGE = 50;

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KRY-${timestamp}-${random}`;
};

const buildOrderFromItems = async (items) => {
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

  const deliveryCharge = DELIVERY_CHARGE;
  const totalAmount = subtotal + deliveryCharge;

  return { orderItems, subtotal, deliveryCharge, totalAmount };
};

const validateCustomer = (customer) => {
  if (!customer?.fullName || !customer?.phone || !customer?.address || !customer?.city || !customer?.pincode) {
    throw new Error('Complete shipping details are required');
  }
};

module.exports = {
  DELIVERY_CHARGE,
  generateOrderNumber,
  buildOrderFromItems,
  validateCustomer,
};