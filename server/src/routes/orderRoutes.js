const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  cancelMyOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/track/:orderNumber', getOrderByNumber);
router.get('/my-orders', protect, getMyOrders);
router.patch('/:id/cancel', protect, cancelMyOrder);

module.exports = router;