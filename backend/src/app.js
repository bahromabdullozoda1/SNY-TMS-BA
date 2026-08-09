const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const loadRoutes = require('./routes/loadRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/drivers', driverRoutes);
  app.use('/api/loads', loadRoutes);
  app.use('/api/dispatch', dispatchRoutes);
  app.use('/api/reports', reportRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
