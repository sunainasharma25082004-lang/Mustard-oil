const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    customerImage: { type: String, default: '' },
    review: { type: String, required: true, trim: true, maxlength: 1000 },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    location: { type: String, trim: true, maxlength: 80, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);