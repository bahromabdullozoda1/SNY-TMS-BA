const express = require('express');
const { listTolls, createToll, updateToll, deleteToll } = require('../controllers/tollController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listTolls);
router.post('/', authorize('admin', 'manager', 'accountant'), createToll);
router.put('/:id', authorize('admin', 'manager', 'accountant'), updateToll);
router.delete('/:id', authorize('admin', 'manager'), deleteToll);

module.exports = router;
