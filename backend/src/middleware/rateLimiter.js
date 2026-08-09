const { rateLimit } = require('express-rate-limit');

const protectedRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

module.exports = {
  protectedRateLimiter
};
