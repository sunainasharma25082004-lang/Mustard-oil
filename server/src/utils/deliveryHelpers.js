const Settings = require('../models/Settings');

const SETTINGS_KEY = 'store';

const getDefaultDeliveryDays = async () => {
  const settings = await Settings.findOne({ key: SETTINGS_KEY });
  return settings?.defaultDeliveryDays ?? 5;
};

const calculateExpectedDeliveryDate = (orderDate, deliveryDays) => {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + Number(deliveryDays));
  date.setHours(23, 59, 59, 999);
  return date;
};

const seedSettings = async () => {
  const exists = await Settings.findOne({ key: SETTINGS_KEY });
  if (exists) return;

  await Settings.create({ key: SETTINGS_KEY, defaultDeliveryDays: 5 });
  console.log('Default delivery settings seeded (5 days)');
};

const CANCELLABLE_STATUSES = ['pending'];

const canCancelOrder = (status) => CANCELLABLE_STATUSES.includes(status);

module.exports = {
  SETTINGS_KEY,
  getDefaultDeliveryDays,
  calculateExpectedDeliveryDate,
  seedSettings,
  canCancelOrder,
};