const express = require('express');
const { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.post('/', authorize('admin', 'manager'), createCustomer);
router.put('/:id', authorize('admin', 'manager'), updateCustomer);
router.delete('/:id', authorize('admin', 'manager'), deleteCustomer);

module.exports = router;
