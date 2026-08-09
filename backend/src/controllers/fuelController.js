const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function serializeFuel(f) {
  const driver = f.driverId ? store.drivers.find((d) => d.id === f.driverId) : null;
  const truck = f.truckId ? store.trucks.find((t) => t.id === f.truckId) : null;
  const load = f.loadId ? store.loads.find((l) => l.id === f.loadId) : null;
  return {
    ...f,
    driverName: driver ? driver.name : null,
    truckNumber: truck ? truck.unitNumber : null,
    loadNumber: load ? load.loadNumber : null
  };
}

function listFuel(req, res) {
  const { driverId, truckId, loadId, startDate, endDate } = req.query;
  let items = [...store.fuelTransactions];
  if (driverId) items = items.filter((f) => f.driverId === Number(driverId));
  if (truckId) items = items.filter((f) => f.truckId === Number(truckId));
  if (loadId) items = items.filter((f) => f.loadId === Number(loadId));
  if (startDate) items = items.filter((f) => f.date >= startDate);
  if (endDate) items = items.filter((f) => f.date <= endDate);

  const totalGallons = items.reduce((s, f) => s + (f.gallons || 0), 0);
  const totalCost = items.reduce((s, f) => s + (f.totalCost || 0), 0);
  const avgPrice = totalGallons > 0 ? totalCost / totalGallons : 0;

  res.json({
    transactions: items.map(serializeFuel),
    summary: { totalGallons, totalCost, avgPricePerGallon: avgPrice.toFixed(3) }
  });
}

function createFuel(req, res) {
  const allowed = ['date','time','driverId','truckId','loadId','location','city','state','gallons',
    'pricePerGallon','totalCost','odometer','fuelType','fuelCard','transactionNumber','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.driverId) payload.driverId = Number(payload.driverId);
  if (payload.truckId) payload.truckId = Number(payload.truckId);
  if (payload.loadId) payload.loadId = payload.loadId ? Number(payload.loadId) : null;
  payload.gallons = Number(payload.gallons || 0);
  payload.pricePerGallon = Number(payload.pricePerGallon || 0);
  payload.totalCost = Number(payload.totalCost || payload.gallons * payload.pricePerGallon);

  const item = { id: store.nextId('fuelTransactions'), ...payload, files: payload.files || [], createdAt: new Date().toISOString() };
  store.fuelTransactions.push(item);
  notifyClients({ type: 'fuel.created', payload: serializeFuel(item) });
  return res.status(201).json(serializeFuel(item));
}

function updateFuel(req, res) {
  const id = Number(req.params.id);
  const idx = store.fuelTransactions.findIndex((f) => f.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Fuel transaction not found' });

  const allowed = ['date','time','driverId','truckId','loadId','location','city','state','gallons',
    'pricePerGallon','totalCost','odometer','fuelType','fuelCard','transactionNumber','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.driverId !== undefined) payload.driverId = payload.driverId ? Number(payload.driverId) : null;
  if (payload.truckId !== undefined) payload.truckId = payload.truckId ? Number(payload.truckId) : null;
  if (payload.loadId !== undefined) payload.loadId = payload.loadId ? Number(payload.loadId) : null;

  store.fuelTransactions[idx] = { ...store.fuelTransactions[idx], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'fuel.updated', payload: serializeFuel(store.fuelTransactions[idx]) });
  return res.json(serializeFuel(store.fuelTransactions[idx]));
}

function deleteFuel(req, res) {
  const id = Number(req.params.id);
  const idx = store.fuelTransactions.findIndex((f) => f.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Fuel transaction not found' });
  const [deleted] = store.fuelTransactions.splice(idx, 1);
  notifyClients({ type: 'fuel.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

module.exports = { listFuel, createFuel, updateFuel, deleteFuel };
