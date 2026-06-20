const express = require('express');
const { getShippingConfig, getServiceability } = require('../controllers/shippingController');

const router = express.Router();

router.get('/config', getShippingConfig);
router.get('/serviceability', getServiceability);

module.exports = router;