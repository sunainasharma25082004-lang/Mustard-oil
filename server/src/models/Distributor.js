const mongoose = require('mongoose');

const distributorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    business: { type: String, trim: true },
    experience: { type: String, trim: true },
    investment: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedAt: { type: Date },
    userNotifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Distributor', distributorSchema);