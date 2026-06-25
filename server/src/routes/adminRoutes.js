const express = require('express');
const { protect, admin, superAdmin, requirePermission, requireAnyPermission } = require('../middleware/auth');
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
const { updateDeliverySettings, updateGeneralSettings } = require('../controllers/settingsController');
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
} = require('../controllers/contentController');
const upload = require('../middleware/upload');
const {
  getAdminSiteImages,
  updateSiteImages,
} = require('../controllers/siteImagesController');
const {
  getPermissionCatalog,
  getAdminTeam,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
} = require('../controllers/adminStaffController');

const router = express.Router();

router.use(protect, admin);

router.get('/permissions', getPermissionCatalog);
router.get('/team', superAdmin, getAdminTeam);
router.post('/team', superAdmin, createAdminStaff);
router.put('/team/:id', superAdmin, updateAdminStaff);
router.delete('/team/:id', superAdmin, deleteAdminStaff);

router.get('/stats', requirePermission('dashboard'), getDashboardStats);
router.patch('/settings/delivery', requirePermission('orders'), updateDeliverySettings);
router.put('/settings/general', superAdmin, updateGeneralSettings);
router.get('/site-images', requirePermission('site-images'), getAdminSiteImages);
router.put('/site-images', requirePermission('site-images'), updateSiteImages);

router.get('/reviews', requirePermission('reviews'), getAllReviewsAdmin);
router.patch('/reviews/:id', requirePermission('reviews'), moderateReview);
router.delete('/reviews/:id', requirePermission('reviews'), deleteReviewAdmin);

router.get('/settings/payment-gateways', superAdmin, getGatewaySettings);
router.put('/settings/payment-gateways', superAdmin, updateGatewaySettings);

router.get('/settings/shipping', requirePermission('shipping'), getShiprocketSettings);
router.put('/settings/shipping', requirePermission('shipping'), updateShiprocketSettings);
router.post('/settings/shipping/test', requirePermission('shipping'), testShiprocketConnection);
router.post('/orders/:id/shiprocket/create', requirePermission('orders'), createShiprocketShipment);
router.post('/orders/:id/shiprocket/verify', requirePermission('orders'), verifyShiprocketShipment);
router.post('/orders/:id/shiprocket/resync', requirePermission('orders'), resetShiprocketShipment);
router.get('/orders/:id/shiprocket/track', requirePermission('orders'), trackShiprocketShipment);
router.get('/orders/:id/shiprocket/live', requirePermission('orders'), getShiprocketLiveStatus);

router.get('/youtube', requirePermission('youtube'), getAllYouTubeVideosAdmin);
router.post('/youtube', requirePermission('youtube'), createYouTubeVideo);
router.put('/youtube/:id', requirePermission('youtube'), updateYouTubeVideo);
router.delete('/youtube/:id', requirePermission('youtube'), deleteYouTubeVideo);

router.get('/recipes', requirePermission('recipes'), getAllRecipesAdmin);
router.post('/recipes', requirePermission('recipes'), createRecipe);
router.put('/recipes/:id', requirePermission('recipes'), updateRecipe);
router.delete('/recipes/:id', requirePermission('recipes'), deleteRecipe);

router.get('/certificates', requirePermission('certificates'), getAllCertificatesAdmin);
router.post('/certificates', requirePermission('certificates'), createCertificate);
router.put('/certificates/:id', requirePermission('certificates'), updateCertificate);
router.delete('/certificates/:id', requirePermission('certificates'), deleteCertificate);

router.get('/products', requirePermission('products'), getAllProductsAdmin);
router.post('/products', requirePermission('products'), createProduct);
router.put('/products/:id', requirePermission('products'), updateProduct);
router.delete('/products/:id', requirePermission('products'), deleteProduct);

router.get('/orders', requirePermission('orders'), getAllOrders);
router.patch('/orders/:id', requirePermission('orders'), updateOrderStatus);

router.get('/contacts', requirePermission('contacts'), getAllContacts);
router.patch('/contacts/:id', requirePermission('contacts'), updateContactStatus);

router.get('/distributors', requirePermission('distributors'), getAllDistributors);
router.patch('/distributors/:id', requirePermission('distributors'), updateDistributorStatus);

router.get('/users', requirePermission('users'), getAllUsers);
router.get('/users/:id', requirePermission('users'), getUserById);

router.post('/upload', requireAnyPermission(
  'products',
  'certificates',
  'recipes',
  'site-images'
), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadImage);

module.exports = router;