const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function serializeMaintenance(m) {
  const truck = m.vehicleType === 'truck' ? store.trucks.find((t) => t.id === m.vehicleId) : null;
  const trailer = m.vehicleType === 'trailer' ? store.trailers.find((t) => t.id === m.vehicleId) : null;
  return {
    ...m,
    vehicleLabel: truck ? truck.unitNumber : (trailer ? trailer.trailerNumber : m.vehicleLabel)
  };
}

function listMaintenance(req, res) {
  const { vehicleType, vehicleId, status, search } = req.query;
  let items = [...store.maintenanceRecords];
  if (vehicleType) items = items.filter((m) => m.vehicleType === vehicleType);
  if (vehicleId) items = items.filter((m) => m.vehicleId === Number(vehicleId));
  if (status) items = items.filter((m) => m.status === status);
  if (search) items = items.filter((m) =>
    [m.vehicleLabel, m.serviceCategory, m.description, m.vendor].join(' ').toLowerCase().includes(search.toLowerCase())
  );
  res.json(items.map(serializeMaintenance));
}

function createMaintenance(req, res) {
  const allowed = ['vehicleType','vehicleId','serviceDate','serviceCategory','description','vendor',
    'odometer','laborCost','partsCost','totalCost','nextServiceMileage','nextServiceDate','status','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.vehicleId) payload.vehicleId = Number(payload.vehicleId);
  payload.laborCost = Number(payload.laborCost || 0);
  payload.partsCost = Number(payload.partsCost || 0);
  payload.totalCost = Number(payload.totalCost || payload.laborCost + payload.partsCost);

  const item = { id: store.nextId('maintenanceRecords'), ...payload, files: payload.files || [], createdAt: new Date().toISOString() };
  store.maintenanceRecords.push(item);
  notifyClients({ type: 'maintenance.created', payload: serializeMaintenance(item) });
  return res.status(201).json(serializeMaintenance(item));
}

function updateMaintenance(req, res) {
  const id = Number(req.params.id);
  const idx = store.maintenanceRecords.findIndex((m) => m.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Maintenance record not found' });

  const allowed = ['vehicleType','vehicleId','serviceDate','serviceCategory','description','vendor',
    'odometer','laborCost','partsCost','totalCost','nextServiceMileage','nextServiceDate','status','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });
  if (payload.vehicleId !== undefined) payload.vehicleId = payload.vehicleId ? Number(payload.vehicleId) : null;

  store.maintenanceRecords[idx] = { ...store.maintenanceRecords[idx], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'maintenance.updated', payload: serializeMaintenance(store.maintenanceRecords[idx]) });
  return res.json(serializeMaintenance(store.maintenanceRecords[idx]));
}

function deleteMaintenance(req, res) {
  const id = Number(req.params.id);
  const idx = store.maintenanceRecords.findIndex((m) => m.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Maintenance record not found' });
  const [deleted] = store.maintenanceRecords.splice(idx, 1);
  notifyClients({ type: 'maintenance.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

function getUpcoming(req, res) {
  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const upcoming = store.maintenanceRecords.filter((m) =>
    m.nextServiceDate && m.nextServiceDate >= today && m.nextServiceDate <= in30Days
  );
  res.json(upcoming.map(serializeMaintenance));
}

module.exports = { listMaintenance, createMaintenance, updateMaintenance, deleteMaintenance, getUpcoming };
