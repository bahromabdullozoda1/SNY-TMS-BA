const express = require('express');
const { body } = require('express-validator');
const { listLoads, createLoad, updateLoad, deleteLoad } = require('../controllers/loadController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/', listLoads);

router.post(
  '/',
  authorize('admin', 'manager'),
  body('loadNumber').trim().notEmpty(),
  body('status').isIn(['new', 'in_progress', 'delivered', 'cancelled']),
  body('priority').isIn(['high', 'medium', 'low']),
  body('driverId').optional().isInt(),
  validate,
  createLoad
);

router.put('/:id', authorize('admin', 'manager'), updateLoad);
router.delete('/:id', authorize('admin', 'manager'), deleteLoad);

module.exports = router;
