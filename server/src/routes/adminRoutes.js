const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/adminController');
const {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { getAllContacts, updateContactStatus } = require('../controllers/contactController');
const {
  getAllDistributors,
  updateDistributorStatus,
} = require('../controllers/distributorController');
const { uploadImage } = require('../controllers/uploadController');
const { updateDeliverySettings } = require('../controllers/settingsController');
const { getAllUsers, getUserById } = require('../controllers/userController');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.patch('/settings/delivery', updateDeliverySettings);

router.get('/products', getAllProductsAdmin);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getAllOrders);
router.patch('/orders/:id', updateOrderStatus);

router.get('/contacts', getAllContacts);
router.patch('/contacts/:id', updateContactStatus);

router.get('/distributors', getAllDistributors);
router.patch('/distributors/:id', updateDistributorStatus);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);

router.post('/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadImage);

module.exports = router;