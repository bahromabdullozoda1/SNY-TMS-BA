const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function serializeExpense(e) {
  const driver = e.driverId ? store.drivers.find((d) => d.id === e.driverId) : null;
  const truck = e.truckId ? store.trucks.find((t) => t.id === e.truckId) : null;
  const trailer = e.trailerId ? store.trailers.find((t) => t.id === e.trailerId) : null;
  const load = e.loadId ? store.loads.find((l) => l.id === e.loadId) : null;
  return {
    ...e,
    driverName: driver ? driver.name : null,
    truckNumber: truck ? truck.unitNumber : null,
    trailerNumber: trailer ? trailer.trailerNumber : null,
    loadNumber: load ? load.loadNumber : null
  };
}

function listExpenses(req, res) {
  const { category, driverId, truckId, startDate, endDate } = req.query;
  let items = [...store.expenses];
  if (category) items = items.filter((e) => e.category === category);
  if (driverId) items = items.filter((e) => e.driverId === Number(driverId));
  if (truckId) items = items.filter((e) => e.truckId === Number(truckId));
  if (startDate) items = items.filter((e) => e.date >= startDate);
  if (endDate) items = items.filter((e) => e.date <= endDate);

  const totalAmount = items.reduce((s, e) => s + (e.amount || 0), 0);
  const byCategory = items.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});

  res.json({ expenses: items.map(serializeExpense), summary: { totalAmount, byCategory } });
}

function createExpense(req, res) {
  const allowed = ['date','category','driverId','truckId','trailerId','loadId','vendor','amount','paymentMethod','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.driverId) payload.driverId = Number(payload.driverId);
  if (payload.truckId) payload.truckId = payload.truckId ? Number(payload.truckId) : null;
  if (payload.trailerId) payload.trailerId = payload.trailerId ? Number(payload.trailerId) : null;
  if (payload.loadId) payload.loadId = payload.loadId ? Number(payload.loadId) : null;
  payload.amount = Number(payload.amount || 0);

  const item = { id: store.nextId('expenses'), ...payload, files: payload.files || [], createdAt: new Date().toISOString() };
  store.expenses.push(item);
  notifyClients({ type: 'expense.created', payload: serializeExpense(item) });
  return res.status(201).json(serializeExpense(item));
}

function updateExpense(req, res) {
  const id = Number(req.params.id);
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Expense not found' });

  const allowed = ['date','category','driverId','truckId','trailerId','loadId','vendor','amount','paymentMethod','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.driverId !== undefined) payload.driverId = payload.driverId ? Number(payload.driverId) : null;
  if (payload.truckId !== undefined) payload.truckId = payload.truckId ? Number(payload.truckId) : null;
  if (payload.trailerId !== undefined) payload.trailerId = payload.trailerId ? Number(payload.trailerId) : null;
  if (payload.loadId !== undefined) payload.loadId = payload.loadId ? Number(payload.loadId) : null;

  store.expenses[idx] = { ...store.expenses[idx], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'expense.updated', payload: serializeExpense(store.expenses[idx]) });
  return res.json(serializeExpense(store.expenses[idx]));
}

function deleteExpense(req, res) {
  const id = Number(req.params.id);
  const idx = store.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Expense not found' });
  const [deleted] = store.expenses.splice(idx, 1);
  notifyClients({ type: 'expense.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

module.exports = { listExpenses, createExpense, updateExpense, deleteExpense };
