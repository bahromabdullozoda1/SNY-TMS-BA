const express = require('express');
const { body } = require('express-validator');
const { listLoads, createLoad, updateLoad, deleteLoad } = require('../controllers/loadController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listLoads);

router.post(
  '/',
  authorize('admin', 'manager'),
  body('loadNumber').trim().notEmpty(),
  body('status').isIn(['new', 'assigned', 'in_transit', 'in_progress', 'at_pickup', 'loaded', 'at_delivery', 'delivered', 'invoiced', 'cancelled']),
  body('priority').isIn(['high', 'medium', 'low']),
  body('driverId').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('rate').optional().isNumeric(),
  body('loadedMiles').optional().isNumeric(),
  body('deadheadMiles').optional().isNumeric(),
  body('driverPayPercent').optional().isNumeric(),
  validate,
  createLoad
);

router.put('/:id', authorize('admin', 'manager'), updateLoad);
router.delete('/:id', authorize('admin', 'manager'), deleteLoad);

module.exports = router;
