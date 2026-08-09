const express = require('express');
const { listExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listExpenses);
router.post('/', authorize('admin', 'manager', 'accountant'), createExpense);
router.put('/:id', authorize('admin', 'manager', 'accountant'), updateExpense);
router.delete('/:id', authorize('admin', 'manager'), deleteExpense);

module.exports = router;
