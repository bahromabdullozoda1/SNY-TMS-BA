const express = require('express');
const { getBoard } = require('../controllers/dispatchController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/board', authenticate, getBoard);

module.exports = router;
