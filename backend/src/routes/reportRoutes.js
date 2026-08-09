const express = require('express');
const { getSummary } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', authenticate, authorize('admin', 'manager', 'accountant'), getSummary);

module.exports = router;
