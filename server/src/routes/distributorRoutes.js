const express = require('express');
const {
  createDistributor,
  getDistributorStatus,
} = require('../controllers/distributorController');

const router = express.Router();

router.get('/status/:phone', getDistributorStatus);
router.post('/', createDistributor);

module.exports = router;