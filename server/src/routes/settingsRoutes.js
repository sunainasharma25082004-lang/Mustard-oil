const express = require('express');
const { getDeliverySettings } = require('../controllers/settingsController');

const router = express.Router();

router.get('/delivery', getDeliverySettings);

module.exports = router;