const express = require('express');
const { listTrailers, getTrailer, createTrailer, updateTrailer, deleteTrailer } = require('../controllers/trailerController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listTrailers);
router.get('/:id', getTrailer);
router.post('/', authorize('admin', 'manager'), createTrailer);
router.put('/:id', authorize('admin', 'manager'), updateTrailer);
router.delete('/:id', authorize('admin', 'manager'), deleteTrailer);

module.exports = router;
