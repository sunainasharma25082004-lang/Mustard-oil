const mongoose = require('mongoose');

const shiprocketSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true, default: 'shiprocket' },
    enabled: { type: Boolean, default: false },
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    token: { type: String, default: '' },
    tokenExpiresAt: { type: Date },
    lastTestedAt: { type: Date },
    connectionStatus: { type: String, enum: ['unknown', 'connected', 'failed'], default: 'unknown' },
    pickupLocation: { type: String, default: 'Primary' },
    pickupPincode: { type: String, default: '' },
    companyName: { type: String, default: 'Karyor Mustard Oil' },
    companyPhone: { type: String, default: '' },
    companyEmail: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    companyCity: { type: String, default: '' },
    companyState: { type: String, default: 'Delhi' },
    companyPincode: { type: String, default: '' },
    defaultWeight: { type: Number, default: 0.5, min: 0.1 },
    defaultLength: { type: Number, default: 20, min: 1 },
    defaultBreadth: { type: Number, default: 15, min: 1 },
    defaultHeight: { type: Number, default: 10, min: 1 },
    autoAssignAwb: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShiprocketSettings', shiprocketSettingsSchema);