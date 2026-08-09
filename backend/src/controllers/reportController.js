const store = require('../models/store');

function filterByDateRange(items, dateField, startDate, endDate) {
  return items.filter((item) => {
    if (startDate && item[dateField] < startDate) return false;
    if (endDate && item[dateField] > endDate) return false;
    return true;
  });
}

function getSummary(req, res) {
  const { startDate, endDate } = req.query;

  const loads = startDate || endDate
    ? filterByDateRange(store.loads, 'deliveryDate', startDate, endDate)
    : store.loads;

  const deliveredLoads = loads.filter((l) => l.status === 'delivered');

  const statusBreakdown = store.loads.reduce((acc, load) => {
    acc[load.status] = (acc[load.status] || 0) + 1;
    return acc;
  }, {});

  // Financial
  const grossRevenue = deliveredLoads.reduce((s, l) => s + (l.rate || 0), 0);
  const driverPay = deliveredLoads.reduce((s, l) => s + (l.driverPayAmount || 0), 0);

  const fuelExpenses = store.fuelTransactions.reduce((s, f) => s + (f.totalCost || 0), 0);
  const tollExpenses = store.tollTransactions.reduce((s, t) => s + (t.amount || 0), 0);
  const maintExpenses = store.maintenanceRecords.reduce((s, m) => s + (m.totalCost || 0), 0);
  const otherExpenses = store.expenses
    .filter((e) => !['fuel','tolls','maintenance'].includes(e.category))
    .reduce((s, e) => s + (e.amount || 0), 0);

  const totalExpenses = fuelExpenses + tollExpenses + maintExpenses + otherExpenses + driverPay;
  const grossProfit = grossRevenue - driverPay;
  const netProfit = grossRevenue - totalExpenses;

  const totalMiles = deliveredLoads.reduce((s, l) => s + (l.loadedMiles || 0) + (l.deadheadMiles || 0), 0);

  // Load performance
  const avgRate = deliveredLoads.length > 0 ? grossRevenue / deliveredLoads.length : 0;
  const avgRpm = totalMiles > 0 ? grossRevenue / totalMiles : 0;
  const avgCostPerMile = totalMiles > 0 ? totalExpenses / totalMiles : 0;
  const avgMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

  // Driver performance
  const driverPerformance = store.drivers.map((driver) => {
    const dLoads = deliveredLoads.filter((l) => l.driverId === driver.id);
    const dRevenue = dLoads.reduce((s, l) => s + (l.rate || 0), 0);
    const dPay = dLoads.reduce((s, l) => s + (l.driverPayAmount || 0), 0);
    const dLoadedMiles = dLoads.reduce((s, l) => s + (l.loadedMiles || 0), 0);
    const dDeadheadMiles = dLoads.reduce((s, l) => s + (l.deadheadMiles || 0), 0);
    return {
      driverId: driver.id,
      name: driver.name,
      status: driver.status,
      completedLoads: dLoads.length,
      revenue: dRevenue,
      driverPay: dPay,
      loadedMiles: dLoadedMiles,
      deadheadMiles: dDeadheadMiles,
      totalMiles: dLoadedMiles + dDeadheadMiles
    };
  });

  // Truck performance
  const truckPerformance = store.trucks.map((truck) => {
    const tLoads = deliveredLoads.filter((l) => l.truckId === truck.id);
    const tRevenue = tLoads.reduce((s, l) => s + (l.rate || 0), 0);
    const tFuel = store.fuelTransactions.filter((f) => f.truckId === truck.id).reduce((s, f) => s + (f.totalCost || 0), 0);
    const tMaint = store.maintenanceRecords.filter((m) => m.vehicleId === truck.id && m.vehicleType === 'truck').reduce((s, m) => s + (m.totalCost || 0), 0);
    const tMiles = tLoads.reduce((s, l) => s + (l.loadedMiles || 0) + (l.deadheadMiles || 0), 0);
    return {
      truckId: truck.id,
      unitNumber: truck.unitNumber,
      loads: tLoads.length,
      revenue: tRevenue,
      fuelCost: tFuel,
      maintCost: tMaint,
      miles: tMiles,
      costPerMile: tMiles > 0 ? ((tFuel + tMaint) / tMiles).toFixed(3) : 0,
      revenuePerMile: tMiles > 0 ? (tRevenue / tMiles).toFixed(3) : 0
    };
  });

  // Customer performance
  const customerPerformance = store.customers.map((c) => {
    const cLoads = deliveredLoads.filter((l) => l.customerId === c.id);
    const cRevenue = cLoads.reduce((s, l) => s + (l.rate || 0), 0);
    const cMiles = cLoads.reduce((s, l) => s + (l.loadedMiles || 0), 0);
    const avgCRate = cLoads.length > 0 ? cRevenue / cLoads.length : 0;
    const cRpm = cMiles > 0 ? cRevenue / cMiles : 0;
    return {
      customerId: c.id,
      companyName: c.companyName,
      type: c.type,
      loads: cLoads.length,
      revenue: cRevenue,
      avgRate: avgCRate,
      avgRpm: cRpm.toFixed(3)
    };
  });

  res.json({
    statusBreakdown,
    financial: {
      grossRevenue,
      driverPay,
      fuelExpenses,
      tollExpenses,
      maintExpenses,
      otherExpenses,
      totalExpenses,
      grossProfit,
      netProfit
    },
    loadPerformance: {
      totalLoads: deliveredLoads.length,
      avgRate,
      avgRpm,
      avgCostPerMile,
      avgMargin,
      totalMiles
    },
    driverPerformance,
    truckPerformance,
    customerPerformance
  });
}

module.exports = { getSummary };
