const express = require('express');
const { getProducts, getProduct } = require('../controllers/productController');
const { cachePublic } = require('../middleware/cachePublic');

const router = express.Router();

router.get('/', cachePublic(120), getProducts);
router.get('/:id', cachePublic(120), getProduct);

module.exports = router;