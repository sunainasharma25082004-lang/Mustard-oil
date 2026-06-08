const User = require('../models/User');
const Order = require('../models/Order');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    const orderStats = await Order.aggregate([
      { $match: { user: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
    ]);

    const statsMap = Object.fromEntries(
      orderStats.map((item) => [item._id.toString(), item])
    );

    const data = users.map((user) => {
      const stats = statsMap[user._id.toString()];
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        orderCount: stats?.orderCount || 0,
        totalSpent: stats?.totalSpent || 0,
        lastOrderAt: stats?.lastOrderAt || null,
      };
    });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'user' }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber status totalAmount paymentMethod createdAt');

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        recentOrders: orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById };