const express = require('express');
const { handleWebhook } = require('../controllers/shiprocketController');

const router = express.Router();

router.post('/shiprocket', handleWebhook);

module.exports = router;