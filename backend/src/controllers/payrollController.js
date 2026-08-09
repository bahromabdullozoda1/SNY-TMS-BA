const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function serializeStatement(s) {
  const driver = s.driverId ? store.drivers.find((d) => d.id === s.driverId) : null;
  return {
    ...s,
    driverName: driver ? driver.name : null
  };
}

function buildStatementFromLoads(driverId, periodStart, periodEnd) {
  const driver = store.drivers.find((d) => d.id === driverId);
  if (!driver) return null;

  const completedLoads = store.loads.filter((l) =>
    l.driverId === driverId &&
    l.status === 'delivered' &&
    l.deliveryDate >= periodStart &&
    l.deliveryDate <= periodEnd
  );

  const grossLoadRevenue = completedLoads.reduce((s, l) => s + (l.rate || 0), 0);
  const payRate = driver.payRate || 0;
  const payType = driver.payType || 'percentage';

  let driverGrossPay = 0;
  if (payType === 'percentage') {
    driverGrossPay = grossLoadRevenue * (payRate / 100);
  } else if (payType === 'per_mile') {
    const miles = completedLoads.reduce((s, l) => s + (l.loadedMiles || 0), 0);
    driverGrossPay = miles * payRate;
  } else if (payType === 'flat') {
    driverGrossPay = completedLoads.length * payRate;
  }

  const fuelDeductions = store.fuelTransactions
    .filter((f) => f.driverId === driverId && f.date >= periodStart && f.date <= periodEnd)
    .reduce((s, f) => s + (f.totalCost || 0), 0);

  const tollDeductions = store.tollTransactions
    .filter((t) => t.driverId === driverId && t.date >= periodStart && t.date <= periodEnd)
    .reduce((s, t) => s + (t.amount || 0), 0);

  return {
    driverId,
    periodStart,
    periodEnd,
    loadIds: completedLoads.map((l) => l.id),
    loadsCompleted: completedLoads.length,
    grossLoadRevenue,
    payType,
    payRate,
    driverGrossPay,
    advances: 0,
    fuelDeductions,
    tollDeductions,
    otherDeductions: 0,
    reimbursements: 0,
    bonuses: 0,
    adjustments: 0,
    netDriverPay: driverGrossPay - fuelDeductions - tollDeductions,
    paymentStatus: 'draft',
    paidDate: null,
    notes: ''
  };
}

function listStatements(req, res) {
  const { driverId, paymentStatus } = req.query;
  let items = [...store.payrollStatements];
  if (driverId) items = items.filter((s) => s.driverId === Number(driverId));
  if (paymentStatus) items = items.filter((s) => s.paymentStatus === paymentStatus);
  res.json(items.map(serializeStatement));
}

function getStatement(req, res) {
  const id = Number(req.params.id);
  const s = store.payrollStatements.find((item) => item.id === id);
  if (!s) return res.status(404).json({ message: 'Statement not found' });
  return res.json(serializeStatement(s));
}

function previewStatement(req, res) {
  const { driverId, periodStart, periodEnd } = req.query;
  if (!driverId || !periodStart || !periodEnd) {
    return res.status(400).json({ message: 'driverId, periodStart, and periodEnd are required' });
  }
  const preview = buildStatementFromLoads(Number(driverId), periodStart, periodEnd);
  if (!preview) return res.status(404).json({ message: 'Driver not found' });
  return res.json(preview);
}

function createStatement(req, res) {
  const allowed = ['driverId','periodStart','periodEnd','loadIds','loadsCompleted','grossLoadRevenue',
    'payType','payRate','driverGrossPay','advances','fuelDeductions','tollDeductions','otherDeductions',
    'reimbursements','bonuses','adjustments','netDriverPay','paymentStatus','paidDate','notes'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.driverId) payload.driverId = Number(payload.driverId);

  const item = { id: store.nextId('payrollStatements'), ...payload, createdAt: new Date().toISOString() };
  store.payrollStatements.push(item);
  notifyClients({ type: 'payroll.created', payload: serializeStatement(item) });
  return res.status(201).json(serializeStatement(item));
}

function updateStatement(req, res) {
  const id = Number(req.params.id);
  const idx = store.payrollStatements.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Statement not found' });

  const allowed = ['paymentStatus','paidDate','advances','fuelDeductions','tollDeductions','otherDeductions',
    'reimbursements','bonuses','adjustments','netDriverPay','notes'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });

  store.payrollStatements[idx] = { ...store.payrollStatements[idx], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'payroll.updated', payload: serializeStatement(store.payrollStatements[idx]) });
  return res.json(serializeStatement(store.payrollStatements[idx]));
}

function deleteStatement(req, res) {
  const id = Number(req.params.id);
  const idx = store.payrollStatements.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Statement not found' });
  const [deleted] = store.payrollStatements.splice(idx, 1);
  notifyClients({ type: 'payroll.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

module.exports = { listStatements, getStatement, previewStatement, createStatement, updateStatement, deleteStatement };
