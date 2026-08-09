const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const loadRoutes = require('./routes/loadRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const reportRoutes = require('./routes/reportRoutes');
const truckRoutes = require('./routes/truckRoutes');
const trailerRoutes = require('./routes/trailerRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const tollRoutes = require('./routes/tollRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const customerRoutes = require('./routes/customerRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const documentRoutes = require('./routes/documentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

function createApp() {
  const app = express();
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

  app.use(helmet());
  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json({ limit: '5mb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/drivers', driverRoutes);
  app.use('/api/loads', loadRoutes);
  app.use('/api/dispatch', dispatchRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/trucks', truckRoutes);
  app.use('/api/trailers', trailerRoutes);
  app.use('/api/fuel', fuelRoutes);
  app.use('/api/tolls', tollRoutes);
  app.use('/api/payroll', payrollRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/settings', settingsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
