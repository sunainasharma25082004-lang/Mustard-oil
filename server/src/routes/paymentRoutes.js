const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentConfig,
} = require('../controllers/paymentController');

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;