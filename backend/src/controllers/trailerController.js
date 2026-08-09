const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function serializeTrailer(trailer) {
  const driver = trailer.assignedDriverId ? store.drivers.find((d) => d.id === trailer.assignedDriverId) : null;
  const truck = trailer.assignedTruckId ? store.trucks.find((t) => t.id === trailer.assignedTruckId) : null;
  const load = trailer.currentLoadId ? store.loads.find((l) => l.id === trailer.currentLoadId) : null;
  return {
    ...trailer,
    assignedDriverName: driver ? driver.name : null,
    assignedTruckNumber: truck ? truck.unitNumber : null,
    currentLoadNumber: load ? load.loadNumber : null
  };
}

function listTrailers(req, res) {
  const { status, search } = req.query;
  const filtered = store.trailers.filter((t) => {
    const statusMatch = !status || t.status === status;
    const searchMatch = !search || [t.trailerNumber, t.make, t.model, t.vin, t.plate].join(' ').toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });
  res.json(filtered.map(serializeTrailer));
}

function getTrailer(req, res) {
  const id = Number(req.params.id);
  const trailer = store.trailers.find((t) => t.id === id);
  if (!trailer) return res.status(404).json({ message: 'Trailer not found' });
  return res.json(serializeTrailer(trailer));
}

function createTrailer(req, res) {
  const allowed = ['trailerNumber','vin','trailerType','make','model','year','plate','plateState',
    'registrationExpiration','assignedTruckId','assignedDriverId','status','notes'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });

  if (payload.assignedTruckId) payload.assignedTruckId = Number(payload.assignedTruckId);
  if (payload.assignedDriverId) payload.assignedDriverId = Number(payload.assignedDriverId);

  const trailer = {
    id: store.nextId('trailers'),
    ...payload,
    currentLoadId: null,
    files: [],
    maintenanceHistory: [],
    createdAt: new Date().toISOString()
  };
  store.trailers.push(trailer);
  notifyClients({ type: 'trailer.created', payload: serializeTrailer(trailer) });
  return res.status(201).json(serializeTrailer(trailer));
}

function updateTrailer(req, res) {
  const id = Number(req.params.id);
  const idx = store.trailers.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Trailer not found' });

  const allowed = ['trailerNumber','vin','trailerType','make','model','year','plate','plateState',
    'registrationExpiration','assignedTruckId','assignedDriverId','currentLoadId','status','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });

  if (payload.assignedTruckId !== undefined) payload.assignedTruckId = payload.assignedTruckId ? Number(payload.assignedTruckId) : null;
  if (payload.assignedDriverId !== undefined) payload.assignedDriverId = payload.assignedDriverId ? Number(payload.assignedDriverId) : null;
  if (payload.currentLoadId !== undefined) payload.currentLoadId = payload.currentLoadId ? Number(payload.currentLoadId) : null;

  store.trailers[idx] = { ...store.trailers[idx], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'trailer.updated', payload: serializeTrailer(store.trailers[idx]) });
  return res.json(serializeTrailer(store.trailers[idx]));
}

function deleteTrailer(req, res) {
  const id = Number(req.params.id);
  const idx = store.trailers.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Trailer not found' });
  const [deleted] = store.trailers.splice(idx, 1);
  notifyClients({ type: 'trailer.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

module.exports = { listTrailers, getTrailer, createTrailer, updateTrailer, deleteTrailer };
