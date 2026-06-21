const Order = require('../models/Order');
const {
  calculateExpectedDeliveryDate,
  canCancelOrder,
} = require('../utils/deliveryHelpers');
const {
  cancelShiprocketOrder,
  isShiprocketEnabled,
} = require('../utils/shiprocketHelpers');

const createOrder = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in to complete your order',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Cash on Delivery is not available. Please pay online to place your order.',
    });
  } catch (error) {
    const msg = error.message || 'Order creation failed';
    if (msg.includes('shipping') || msg.includes('item') || msg.includes('unavailable')) {
      return res.status(400).json({ success: false, message: msg });
    }
    next(error);
  }
};

const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

const getMyOrders = async (req, res, next) => {
  try {
    const user = req.user;
    const email = user.email?.toLowerCase().trim();
    const phone = normalizePhone(user.phone);

    const matchConditions = [{ user: user._id }];

    if (email) {
      matchConditions.push({ 'customer.email': email });
    }

    if (phone.length === 10) {
      matchConditions.push({ 'customer.phone': { $regex: `${phone}$` } });
    }

    const orders = await Order.find({ $or: matchConditions }).sort({ createdAt: -1 });

    const orphanIds = orders.filter((order) => !order.user).map((order) => order._id);
    if (orphanIds.length) {
      Order.updateMany({ _id: { $in: orphanIds } }, { $set: { user: user._id } }).catch(() => {});
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderByNumber = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const cancelMyOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!canCancelOrder(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Orders can only be cancelled before they are shipped',
      });
    }

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required',
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason.trim();
    order.cancelledBy = 'user';
    order.cancelledAt = new Date();
    await order.save();

    if (await isShiprocketEnabled()) {
      const srOrderId = order.shiprocket?.shiprocketOrderId;
      if (srOrderId) {
        cancelShiprocketOrder(srOrderId).catch((err) => {
          console.warn(`[Shiprocket] Cancel failed for ${order.orderNumber}:`, err.message);
        });
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .populate('user', 'name email phone address city pincode createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus, deliveryDays, cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (status === 'cancelled') {
      if (!cancellationReason?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation reason is required',
        });
      }
      order.cancellationReason = cancellationReason.trim();
      order.cancelledBy = 'admin';
      order.cancelledAt = new Date();
      order.status = 'cancelled';

      if (await isShiprocketEnabled()) {
        const srOrderId = order.shiprocket?.shiprocketOrderId;
        if (srOrderId) {
          cancelShiprocketOrder(srOrderId).catch((err) => {
            console.warn(`[Shiprocket] Admin cancel failed for ${order.orderNumber}:`, err.message);
          });
        }
      }
    } else if (status) {
      order.status = status;
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (deliveryDays !== undefined) {
      const days = Number(deliveryDays);
      if (days < 1 || days > 30) {
        return res.status(400).json({
          success: false,
          message: 'Delivery days must be between 1 and 30',
        });
      }
      order.deliveryDays = days;
      order.expectedDeliveryDate = calculateExpectedDeliveryDate(order.createdAt, days);
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
};