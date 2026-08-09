const express = require('express');
const { listFuel, createFuel, updateFuel, deleteFuel } = require('../controllers/fuelController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listFuel);
router.post('/', authorize('admin', 'manager', 'accountant'), createFuel);
router.put('/:id', authorize('admin', 'manager', 'accountant'), updateFuel);
router.delete('/:id', authorize('admin', 'manager'), deleteFuel);

module.exports = router;
