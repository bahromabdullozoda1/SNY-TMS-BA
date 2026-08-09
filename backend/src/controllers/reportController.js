const store = require('../models/store');

function getSummary(req, res) {
  const statusBreakdown = store.loads.reduce((acc, load) => {
    acc[load.status] = (acc[load.status] || 0) + 1;
    return acc;
  }, {});

  const driverPerformance = store.drivers.map((driver) => ({
    driverId: driver.id,
    name: driver.name,
    status: driver.status,
    completedLoads: store.loads.filter((load) => load.driverId === driver.id && load.status === 'delivered').length
  }));

  const financial = {
    revenue: store.loads.reduce((sum, load) => sum + Number(load.rate || 0), 0),
    expenses: store.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  };

  res.json({ statusBreakdown, driverPerformance, financial });
}

module.exports = { getSummary };
