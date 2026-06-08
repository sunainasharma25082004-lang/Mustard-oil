const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    defaultDeliveryDays: { type: Number, default: 5, min: 1, max: 30 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);