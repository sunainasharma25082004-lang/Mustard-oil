const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;