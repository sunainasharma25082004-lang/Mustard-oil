const Settings = require('../models/Settings');
const { SETTINGS_KEY } = require('../utils/deliveryHelpers');

const getDeliverySettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne({ key: SETTINGS_KEY });

    res.json({
      success: true,
      data: {
        defaultDeliveryDays: settings?.defaultDeliveryDays ?? 5,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateDeliverySettings = async (req, res, next) => {
  try {
    const { defaultDeliveryDays } = req.body;

    if (!defaultDeliveryDays || defaultDeliveryDays < 1 || defaultDeliveryDays > 30) {
      return res.status(400).json({
        success: false,
        message: 'Delivery days must be between 1 and 30',
      });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { defaultDeliveryDays: Number(defaultDeliveryDays) },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Delivery settings updated',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDeliverySettings, updateDeliverySettings };