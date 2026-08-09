const express = require('express');
const { listDrivers, getDriver, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listDrivers);
router.get('/:id', getDriver);
router.post('/', authorize('admin', 'manager'), createDriver);
router.put('/:id', authorize('admin', 'manager'), updateDriver);
router.delete('/:id', authorize('admin'), deleteDriver);

module.exports = router;
