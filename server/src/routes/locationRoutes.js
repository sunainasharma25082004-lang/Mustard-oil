const express = require('express');
const { getByPincode, getByCity } = require('../controllers/locationController');

const router = express.Router();

router.get('/pincode/:pincode', getByPincode);
router.get('/city/:city', getByCity);

module.exports = router;