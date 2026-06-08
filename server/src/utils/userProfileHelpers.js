const User = require('../models/User');

const syncUserProfileFromCustomer = async (userId, customer = {}) => {
  if (!userId) return null;

  const user = await User.findById(userId);
  if (!user || user.role !== 'user') return null;

  if (customer.fullName?.trim()) user.name = customer.fullName.trim();
  if (customer.phone?.trim()) user.phone = customer.phone.trim();
  if (customer.address?.trim()) user.address = customer.address.trim();
  if (customer.city?.trim()) user.city = customer.city.trim();
  if (customer.pincode?.trim()) user.pincode = customer.pincode.trim();

  await user.save();
  return user;
};

const syncUserProfileFromBody = async (userId, body = {}) => {
  if (!userId) return null;

  const user = await User.findById(userId);
  if (!user || user.role !== 'user') return null;

  if (body.name?.trim()) user.name = body.name.trim();
  if (body.phone?.trim()) user.phone = body.phone.trim();
  if (body.address?.trim()) user.address = body.address.trim();
  if (body.city?.trim()) user.city = body.city.trim();
  if (body.pincode?.trim()) user.pincode = body.pincode.trim();

  await user.save();
  return user;
};

module.exports = {
  syncUserProfileFromCustomer,
  syncUserProfileFromBody,
};