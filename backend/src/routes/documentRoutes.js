const express = require('express');
const { listDocuments, createDocument, deleteDocument } = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(protectedRateLimiter);
router.use(authenticate);

router.get('/', listDocuments);
router.post('/', authenticate, createDocument);
router.delete('/:id', authorize('admin', 'manager'), deleteDocument);

module.exports = router;
