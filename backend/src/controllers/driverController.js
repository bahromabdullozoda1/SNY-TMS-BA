const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

const DRIVER_FIELDS = [
  'firstName','lastName','name','phone','email','address','city','state','zip',
  'emergencyContactName','emergencyContactPhone','hireDate','terminationDate',
  'employmentStatus','status','cdlNumber','cdlState','cdlClass','cdlExpiration',
  'medicalCardExpiration','mvrExpiration','drugTestDate','clearinghouseStatus',
  'assignedTruckId','assignedTrailerId','currentLoadId','dispatcher','homeTerminal',
  'payType','payRate','notes','files'
];

function serializeDriver(driver) {
  const truck = driver.assignedTruckId ? store.trucks.find((t) => t.id === driver.assignedTruckId) : null;
  const trailer = driver.assignedTrailerId ? store.trailers.find((t) => t.id === driver.assignedTrailerId) : null;
  const currentLoad = driver.currentLoadId ? store.loads.find((l) => l.id === driver.currentLoadId) : null;

  const driverLoads = store.loads.filter((l) => l.driverId === driver.id);
  const deliveredLoads = driverLoads.filter((l) => l.status === 'delivered');
  const totalRevenue = deliveredLoads.reduce((s, l) => s + (l.rate || 0), 0);
  const totalPay = deliveredLoads.reduce((s, l) => s + (l.driverPayAmount || 0), 0);
  const loadedMiles = deliveredLoads.reduce((s, l) => s + (l.loadedMiles || 0), 0);
  const deadheadMiles = deliveredLoads.reduce((s, l) => s + (l.deadheadMiles || 0), 0);
  const totalMiles = loadedMiles + deadheadMiles;

  return {
    ...driver,
    loadsCount: driverLoads.length,
    assignedTruckNumber: truck ? truck.unitNumber : null,
    assignedTrailerNumber: trailer ? trailer.trailerNumber : null,
    currentLoadNumber: currentLoad ? currentLoad.loadNumber : null,
    totalLoads: deliveredLoads.length,
    loadedMiles,
    deadheadMiles,
    totalMiles,
    revenueGenerated: totalRevenue,
    driverPay: totalPay,
    avgRevenuePerMile: totalMiles > 0 ? (totalRevenue / totalMiles).toFixed(3) : 0
  };
}

function listDrivers(req, res) {
  const { status, employmentStatus, search } = req.query;

  const filtered = store.drivers.filter((driver) => {
    const statusMatch = !status || driver.status === status;
    const empMatch = !employmentStatus || driver.employmentStatus === employmentStatus;
    const searchMatch = !search ||
      [driver.name, driver.firstName, driver.lastName, driver.phone, driver.email, driver.cdlNumber].join(' ').toLowerCase().includes(search.toLowerCase());
    return statusMatch && empMatch && searchMatch;
  });

  res.json(filtered.map(serializeDriver));
}

function getDriver(req, res) {
  const id = Number(req.params.id);
  const driver = store.drivers.find((d) => d.id === id);
  if (!driver) return res.status(404).json({ message: 'Driver not found' });
  const loads = store.loads.filter((l) => l.driverId === id);
  return res.json({ ...serializeDriver(driver), loads });
}

function createDriver(req, res) {
  const payload = {};
  DRIVER_FIELDS.forEach((f) => {
    if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f];
  });

  if (payload.firstName || payload.lastName) {
    payload.name = [payload.firstName, payload.lastName].filter(Boolean).join(' ');
  }
  if (payload.assignedTruckId) payload.assignedTruckId = Number(payload.assignedTruckId);
  if (payload.assignedTrailerId) payload.assignedTrailerId = Number(payload.assignedTrailerId);

  const driver = {
    id: store.nextId('drivers'),
    ...payload,
    rating: 0,
    files: payload.files || [],
    createdAt: new Date().toISOString()
  };

  store.drivers.push(driver);
  notifyClients({ type: 'driver.created', payload: serializeDriver(driver) });
  return res.status(201).json(serializeDriver(driver));
}

function updateDriver(req, res) {
  const id = Number(req.params.id);
  const index = store.drivers.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  const payload = {};
  DRIVER_FIELDS.forEach((f) => {
    if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f];
  });

  if (payload.firstName !== undefined || payload.lastName !== undefined) {
    const fn = payload.firstName ?? store.drivers[index].firstName ?? '';
    const ln = payload.lastName ?? store.drivers[index].lastName ?? '';
    payload.name = [fn, ln].filter(Boolean).join(' ');
  }
  if (payload.assignedTruckId !== undefined) payload.assignedTruckId = payload.assignedTruckId ? Number(payload.assignedTruckId) : null;
  if (payload.assignedTrailerId !== undefined) payload.assignedTrailerId = payload.assignedTrailerId ? Number(payload.assignedTrailerId) : null;
  if (payload.currentLoadId !== undefined) payload.currentLoadId = payload.currentLoadId ? Number(payload.currentLoadId) : null;

  store.drivers[index] = { ...store.drivers[index], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'driver.updated', payload: serializeDriver(store.drivers[index]) });
  return res.json(serializeDriver(store.drivers[index]));
}

function deleteDriver(req, res) {
  const id = Number(req.params.id);
  const index = store.drivers.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  if (store.loads.some((load) => load.driverId === id && !['cancelled', 'delivered'].includes(load.status))) {
    return res.status(409).json({ message: 'Driver is assigned to active loads' });
  }

  const [deletedDriver] = store.drivers.splice(index, 1);
  notifyClients({ type: 'driver.deleted', payload: { id: deletedDriver.id } });
  return res.status(204).send();
}

module.exports = {
  listDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver
};
