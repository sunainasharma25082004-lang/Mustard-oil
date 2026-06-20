const express = require('express');
const { protect } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const {
  getApprovedReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { noCache } = require('../middleware/cachePublic');

const router = express.Router();

router.get('/', noCache, optionalAuth, getApprovedReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;