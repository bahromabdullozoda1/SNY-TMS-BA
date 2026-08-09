const express = require('express');
const { listTrucks, getTruck, createTruck, updateTruck, deleteTruck } = require('../controllers/truckController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listTrucks);
router.get('/:id', getTruck);
router.post('/', authorize('admin', 'manager'), createTruck);
router.put('/:id', authorize('admin', 'manager'), updateTruck);
router.delete('/:id', authorize('admin', 'manager'), deleteTruck);

module.exports = router;
