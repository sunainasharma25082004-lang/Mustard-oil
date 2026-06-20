const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  googleAuth,
  getGoogleConfig,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/google/config', getGoogleConfig);
router.post('/google', googleAuth);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, changePassword);

module.exports = router;