module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'replace-me-in-production',
  nodeEnv: process.env.NODE_ENV || 'development'
};
