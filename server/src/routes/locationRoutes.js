const express = require('express');
const { getByPincode, getByCity, reverseGeocode } = require('../controllers/locationController');

const router = express.Router();

router.get('/pincode/:pincode', getByPincode);
router.get('/city/:city', getByCity);
router.get('/reverse', reverseGeocode);

module.exports = router;