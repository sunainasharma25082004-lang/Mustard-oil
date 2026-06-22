const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

const admin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const superAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Super Admin access required' });
  }
  next();
};

const { userHasPermission, userHasAnyPermission } = require('../utils/adminPermissions');

const requirePermission = (...permissions) => (req, res, next) => {
  if (req.user?.isSuperAdmin) return next();
  if (permissions.some((permission) => userHasPermission(req.user, permission))) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'You do not have access to this section',
  });
};

const requireAnyPermission = (...permissions) => (req, res, next) => {
  if (req.user?.isSuperAdmin) return next();
  if (userHasAnyPermission(req.user, permissions)) return next();
  return res.status(403).json({
    success: false,
    message: 'You do not have access to this section',
  });
};

module.exports = { protect, admin, superAdmin, requirePermission, requireAnyPermission };