const express = require('express');
const { body } = require('express-validator');
const { listDrivers, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/', listDrivers);

router.post(
  '/',
  authorize('admin', 'manager'),
  body('name').trim().notEmpty(),
  body('email').optional().isEmail(),
  body('status').isIn(['active', 'inactive', 'on_leave']),
  validate,
  createDriver
);

router.put('/:id', authorize('admin', 'manager'), updateDriver);
router.delete('/:id', authorize('admin'), deleteDriver);

module.exports = router;
