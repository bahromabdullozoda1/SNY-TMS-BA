const crypto = require('crypto');

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET is not set. Using an ephemeral secret for this runtime.');
}

module.exports = {
  jwtSecret,
  nodeEnv
};
