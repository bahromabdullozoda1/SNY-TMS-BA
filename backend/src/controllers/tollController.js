const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function serializeToll(t) {
  const driver = t.driverId ? store.drivers.find((d) => d.id === t.driverId) : null;
  const truck = t.truckId ? store.trucks.find((tr) => tr.id === t.truckId) : null;
  const load = t.loadId ? store.loads.find((l) => l.id === t.loadId) : null;
  return {
    ...t,
    driverName: driver ? driver.name : null,
    truckNumber: truck ? truck.unitNumber : null,
    loadNumber: load ? load.loadNumber : null
  };
}

function listTolls(req, res) {
  const { driverId, truckId, loadId, startDate, endDate } = req.query;
  let items = [...store.tollTransactions];
  if (driverId) items = items.filter((t) => t.driverId === Number(driverId));
  if (truckId) items = items.filter((t) => t.truckId === Number(truckId));
  if (loadId) items = items.filter((t) => t.loadId === Number(loadId));
  if (startDate) items = items.filter((t) => t.date >= startDate);
  if (endDate) items = items.filter((t) => t.date <= endDate);

  const totalAmount = items.reduce((s, t) => s + (t.amount || 0), 0);
  res.json({ transactions: items.map(serializeToll), summary: { totalAmount } });
}

function createToll(req, res) {
  const allowed = ['date','driverId','truckId','loadId','tollAuthority','tollRoad','entryLocation',
    'exitLocation','state','amount','transponder','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.driverId) payload.driverId = Number(payload.driverId);
  if (payload.truckId) payload.truckId = Number(payload.truckId);
  if (payload.loadId) payload.loadId = payload.loadId ? Number(payload.loadId) : null;
  payload.amount = Number(payload.amount || 0);

  const item = { id: store.nextId('tollTransactions'), ...payload, files: payload.files || [], createdAt: new Date().toISOString() };
  store.tollTransactions.push(item);
  notifyClients({ type: 'toll.created', payload: serializeToll(item) });
  return res.status(201).json(serializeToll(item));
}

function updateToll(req, res) {
  const id = Number(req.params.id);
  const idx = store.tollTransactions.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Toll not found' });

  const allowed = ['date','driverId','truckId','loadId','tollAuthority','tollRoad','entryLocation',
    'exitLocation','state','amount','transponder','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.driverId !== undefined) payload.driverId = payload.driverId ? Number(payload.driverId) : null;
  if (payload.truckId !== undefined) payload.truckId = payload.truckId ? Number(payload.truckId) : null;
  if (payload.loadId !== undefined) payload.loadId = payload.loadId ? Number(payload.loadId) : null;

  store.tollTransactions[idx] = { ...store.tollTransactions[idx], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'toll.updated', payload: serializeToll(store.tollTransactions[idx]) });
  return res.json(serializeToll(store.tollTransactions[idx]));
}

function deleteToll(req, res) {
  const id = Number(req.params.id);
  const idx = store.tollTransactions.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Toll not found' });
  const [deleted] = store.tollTransactions.splice(idx, 1);
  notifyClients({ type: 'toll.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

module.exports = { listTolls, createToll, updateToll, deleteToll };
