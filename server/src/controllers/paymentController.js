const crypto = require('crypto');
const Order = require('../models/Order');
const getRazorpayInstance = require('../config/razorpay');
const {
  generateOrderNumber,
  buildOrderFromItems,
  validateCustomer,
} = require('../utils/orderHelpers');
const {
  getDefaultDeliveryDays,
  calculateExpectedDeliveryDate,
} = require('../utils/deliveryHelpers');
const { syncUserProfileFromCustomer } = require('../utils/userProfileHelpers');

const createRazorpayOrder = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in to complete your order',
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Online payment is not available right now. Please try again later.',
      });
    }

    const { customer, items } = req.body;
    validateCustomer(customer);

    const { orderItems, subtotal, deliveryCharge, totalAmount } =
      await buildOrderFromItems(items);

    const deliveryDays = await getDefaultDeliveryDays();
    const expectedDeliveryDate = calculateExpectedDeliveryDate(new Date(), deliveryDays);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      customer,
      items: orderItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: 'online',
      paymentStatus: 'pending',
      status: 'pending',
      deliveryDays,
      expectedDeliveryDate,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    await syncUserProfileFromCustomer(req.user._id, customer);

    res.status(201).json({
      success: true,
      message: 'Payment order created',
      data: {
        order,
        razorpay: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      },
    });
  } catch (error) {
    const msg = error.message || error.error?.description || 'Payment order creation failed';
    if (msg.includes('shipping') || msg.includes('item') || msg.includes('unavailable')) {
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(400).json({ success: false, message: msg });
  }
};

const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification data is missing',
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this payment',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized payment verification',
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    await syncUserProfileFromCustomer(req.user._id, order.customer);

    res.json({
      success: true,
      message: 'Payment successful! Order confirmed.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };