const express = require('express');
const { getDeliverySettings, getGeneralSettings } = require('../controllers/settingsController');

const router = express.Router();

router.get('/delivery', getDeliverySettings);
router.get('/general', getGeneralSettings);

module.exports = router;