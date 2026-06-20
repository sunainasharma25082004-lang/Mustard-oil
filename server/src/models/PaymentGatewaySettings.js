const mongoose = require('mongoose');

const gatewayCredentialSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    keyId: { type: String, default: '' },
    keySecret: { type: String, default: '' },
    merchantId: { type: String, default: '' },
    merchantKey: { type: String, default: '' },
    website: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    authToken: { type: String, default: '' },
    salt: { type: String, default: '' },
    appId: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    environment: { type: String, enum: ['test', 'production'], default: 'test' },
    lastValidatedAt: { type: Date },
    validationStatus: { type: String, enum: ['unknown', 'valid', 'invalid'], default: 'unknown' },
  },
  { _id: false }
);

const paymentGatewaySettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true, default: 'payment_gateways' },
    activeGateway: {
      type: String,
      enum: ['razorpay', 'paytm', 'instamojo', 'cashfree', 'none'],
      default: 'razorpay',
    },
    razorpay: { type: gatewayCredentialSchema, default: () => ({}) },
    paytm: { type: gatewayCredentialSchema, default: () => ({}) },
    instamojo: { type: gatewayCredentialSchema, default: () => ({}) },
    cashfree: { type: gatewayCredentialSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentGatewaySettings', paymentGatewaySettingsSchema);