const express = require('express');
const { listMaintenance, createMaintenance, updateMaintenance, deleteMaintenance, getUpcoming } = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listMaintenance);
router.get('/upcoming', getUpcoming);
router.post('/', authorize('admin', 'manager'), createMaintenance);
router.put('/:id', authorize('admin', 'manager'), updateMaintenance);
router.delete('/:id', authorize('admin', 'manager'), deleteMaintenance);

module.exports = router;
