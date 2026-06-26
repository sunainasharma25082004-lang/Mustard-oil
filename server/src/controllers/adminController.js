const Order = require('../models/Order');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const Distributor = require('../models/Distributor');
const User = require('../models/User');
const { getVisitorStats } = require('./analyticsController');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      activeProducts,
      newContacts,
      pendingDistributors,
      totalUsers,
      revenueResult,
      visitors,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Contact.countDocuments({ status: 'new' }),
      Distributor.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      getVisitorStats(),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        totalProducts,
        activeProducts,
        newContacts,
        pendingDistributors,
        totalUsers,
        totalRevenue: revenueResult[0]?.total || 0,
        visitors,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };