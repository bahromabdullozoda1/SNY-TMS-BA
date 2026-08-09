const express = require('express');
const { listStatements, getStatement, previewStatement, createStatement, updateStatement, deleteStatement } = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listStatements);
router.get('/preview', previewStatement);
router.get('/:id', getStatement);
router.post('/', authorize('admin', 'manager', 'accountant'), createStatement);
router.put('/:id', authorize('admin', 'manager', 'accountant'), updateStatement);
router.delete('/:id', authorize('admin', 'manager'), deleteStatement);

module.exports = router;
