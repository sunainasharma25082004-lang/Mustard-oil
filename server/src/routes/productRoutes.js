const express = require('express');
const { getProducts, getProduct } = require('../controllers/productController');
const { noCache } = require('../middleware/cachePublic');

const router = express.Router();

router.get('/', noCache, getProducts);
router.get('/:id', noCache, getProduct);

module.exports = router;