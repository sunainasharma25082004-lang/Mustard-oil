const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'Order must have at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'online',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    deliveryDays: { type: Number, min: 1, max: 30 },
    expectedDeliveryDate: { type: Date },
    cancellationReason: { type: String, trim: true },
    cancelledBy: { type: String, enum: ['user', 'admin'] },
    cancelledAt: { type: Date },
    shiprocket: {
      shipmentId: { type: Number },
      shiprocketOrderId: { type: Number },
      channelOrderId: { type: String, trim: true },
      verified: { type: Boolean, default: false },
      awb: { type: String, trim: true },
      courierName: { type: String, trim: true },
      trackingUrl: { type: String, trim: true },
      status: { type: String, trim: true },
      statusLabel: { type: String, trim: true },
      lastSyncedAt: { type: Date },
      error: { type: String, trim: true },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);