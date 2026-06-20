const express = require('express');
const { protect, admin, superAdmin } = require('../middleware/auth');
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
const {
  getAllReviewsAdmin,
  moderateReview,
  deleteReviewAdmin,
} = require('../controllers/reviewController');
const {
  getGatewaySettings,
  updateGatewaySettings,
} = require('../controllers/gatewaySettingsController');
const {
  getSettings: getShiprocketSettings,
  updateSettings: updateShiprocketSettings,
  testConnection: testShiprocketConnection,
  createShipment: createShiprocketShipment,
  trackShipment: trackShiprocketShipment,
  verifyShipment: verifyShiprocketShipment,
  resetAndCreateShipment: resetShiprocketShipment,
  getLiveOrderStatus: getShiprocketLiveStatus,
} = require('../controllers/shiprocketController');
const {
  getAllYouTubeVideosAdmin,
  createYouTubeVideo,
  updateYouTubeVideo,
  deleteYouTubeVideo,
  getAllRecipesAdmin,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getAllCertificatesAdmin,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/contentController');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.patch('/settings/delivery', updateDeliverySettings);

router.get('/reviews', getAllReviewsAdmin);
router.patch('/reviews/:id', moderateReview);
router.delete('/reviews/:id', deleteReviewAdmin);

router.get('/settings/payment-gateways', superAdmin, getGatewaySettings);
router.put('/settings/payment-gateways', superAdmin, updateGatewaySettings);

router.get('/settings/shipping', getShiprocketSettings);
router.put('/settings/shipping', updateShiprocketSettings);
router.post('/settings/shipping/test', testShiprocketConnection);
router.post('/orders/:id/shiprocket/create', createShiprocketShipment);
router.post('/orders/:id/shiprocket/verify', verifyShiprocketShipment);
router.post('/orders/:id/shiprocket/resync', resetShiprocketShipment);
router.get('/orders/:id/shiprocket/track', trackShiprocketShipment);
router.get('/orders/:id/shiprocket/live', getShiprocketLiveStatus);

router.get('/youtube', getAllYouTubeVideosAdmin);
router.post('/youtube', createYouTubeVideo);
router.put('/youtube/:id', updateYouTubeVideo);
router.delete('/youtube/:id', deleteYouTubeVideo);

router.get('/recipes', getAllRecipesAdmin);
router.post('/recipes', createRecipe);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

router.get('/certificates', getAllCertificatesAdmin);
router.post('/certificates', createCertificate);
router.put('/certificates/:id', updateCertificate);
router.delete('/certificates/:id', deleteCertificate);

router.get('/testimonials', getAllTestimonialsAdmin);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

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