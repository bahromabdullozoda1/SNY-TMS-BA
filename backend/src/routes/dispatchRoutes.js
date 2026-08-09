const express = require('express');
const { getBoard } = require('../controllers/dispatchController');
const { authenticate } = require('../middleware/auth');
const { protectedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/board', protectedRateLimiter, authenticate, getBoard);

module.exports = router;
