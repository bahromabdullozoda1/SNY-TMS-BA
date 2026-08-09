const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function serializeTruck(truck) {
  const driver = truck.assignedDriverId ? store.drivers.find((d) => d.id === truck.assignedDriverId) : null;
  const trailer = truck.assignedTrailerId ? store.trailers.find((t) => t.id === truck.assignedTrailerId) : null;
  const load = truck.currentLoadId ? store.loads.find((l) => l.id === truck.currentLoadId) : null;

  const truckLoads = store.loads.filter((l) => l.truckId === truck.id && l.status === 'delivered');
  const totalRevenue = truckLoads.reduce((sum, l) => sum + (l.rate || 0), 0);
  const totalLoadedMiles = truckLoads.reduce((sum, l) => sum + (l.loadedMiles || 0), 0);
  const totalDeadheadMiles = truckLoads.reduce((sum, l) => sum + (l.deadheadMiles || 0), 0);
  const totalMiles = totalLoadedMiles + totalDeadheadMiles;
  const fuelCost = store.fuelTransactions.filter((f) => f.truckId === truck.id).reduce((sum, f) => sum + (f.totalCost || 0), 0);
  const maintCost = store.maintenanceRecords.filter((m) => m.vehicleId === truck.id && m.vehicleType === 'truck').reduce((sum, m) => sum + (m.totalCost || 0), 0);

  return {
    ...truck,
    assignedDriverName: driver ? driver.name : null,
    assignedTrailerNumber: trailer ? trailer.trailerNumber : null,
    currentLoadNumber: load ? load.loadNumber : null,
    totalRevenue,
    totalLoadedMiles,
    totalDeadheadMiles,
    totalMiles,
    fuelCost,
    maintCost,
    costPerMile: totalMiles > 0 ? ((fuelCost + maintCost) / totalMiles).toFixed(3) : 0,
    revenuePerMile: totalMiles > 0 ? (totalRevenue / totalMiles).toFixed(3) : 0
  };
}

function listTrucks(req, res) {
  const { status, search } = req.query;
  const filtered = store.trucks.filter((t) => {
    const statusMatch = !status || t.status === status;
    const searchMatch = !search || [t.unitNumber, t.make, t.model, t.vin, t.licensePlate].join(' ').toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });
  res.json(filtered.map(serializeTruck));
}

function getTruck(req, res) {
  const id = Number(req.params.id);
  const truck = store.trucks.find((t) => t.id === id);
  if (!truck) return res.status(404).json({ message: 'Truck not found' });
  return res.json(serializeTruck(truck));
}

function createTruck(req, res) {
  const allowed = ['unitNumber','vin','make','model','year','licensePlate','plateState','registrationExpiration',
    'insuranceExpiration','iftaNumber','currentOdometer','startingOdometer','assignedDriverId','assignedTrailerId',
    'ownershipType','status','notes'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });

  if (payload.assignedDriverId) payload.assignedDriverId = Number(payload.assignedDriverId);
  if (payload.assignedTrailerId) payload.assignedTrailerId = Number(payload.assignedTrailerId);

  const truck = {
    id: store.nextId('trucks'),
    ...payload,
    currentLoadId: null,
    files: [],
    maintenanceHistory: [],
    fuelHistory: [],
    createdAt: new Date().toISOString()
  };
  store.trucks.push(truck);
  notifyClients({ type: 'truck.created', payload: serializeTruck(truck) });
  return res.status(201).json(serializeTruck(truck));
}

function updateTruck(req, res) {
  const id = Number(req.params.id);
  const idx = store.trucks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Truck not found' });

  const allowed = ['unitNumber','vin','make','model','year','licensePlate','plateState','registrationExpiration',
    'insuranceExpiration','iftaNumber','currentOdometer','startingOdometer','assignedDriverId','assignedTrailerId',
    'currentLoadId','ownershipType','status','notes','files'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });

  if (payload.assignedDriverId !== undefined) payload.assignedDriverId = payload.assignedDriverId ? Number(payload.assignedDriverId) : null;
  if (payload.assignedTrailerId !== undefined) payload.assignedTrailerId = payload.assignedTrailerId ? Number(payload.assignedTrailerId) : null;
  if (payload.currentLoadId !== undefined) payload.currentLoadId = payload.currentLoadId ? Number(payload.currentLoadId) : null;

  store.trucks[idx] = { ...store.trucks[idx], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'truck.updated', payload: serializeTruck(store.trucks[idx]) });
  return res.json(serializeTruck(store.trucks[idx]));
}

function deleteTruck(req, res) {
  const id = Number(req.params.id);
  const idx = store.trucks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Truck not found' });
  const [deleted] = store.trucks.splice(idx, 1);
  notifyClients({ type: 'truck.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

module.exports = { listTrucks, getTruck, createTruck, updateTruck, deleteTruck };
