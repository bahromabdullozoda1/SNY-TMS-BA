const crypto = require('crypto');
const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function sanitizeDriverId(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }

  return Number(value);
}

function sanitizeFiles(files = []) {
  if (!Array.isArray(files)) {
    return [];
  }

  return files
    .filter((file) => file && typeof file === 'object')
    .map((file) => ({
      id: String(file.id || crypto.randomUUID()),
      name: String(file.name || 'document'),
      size: Number(file.size || 0),
      type: String(file.type || 'application/octet-stream'),
      uploadedAt: file.uploadedAt || new Date().toISOString()
    }));
}

function resolveDriver(driverId) {
  if (driverId === null) {
    return null;
  }

  return store.drivers.find((driver) => driver.id === driverId) || null;
}

function deriveLocation(city, state) {
  const parts = [city, state].filter(Boolean);
  return parts.length ? parts.join(', ') : '';
}

function buildHistoryEntries(previous, next, actor) {
  const changes = [];

  if (!previous) {
    return [{ date: next.createdAt, action: 'Created', actor }];
  }

  if (previous.driverId !== next.driverId) {
    const nextDriver = resolveDriver(next.driverId);
    changes.push({
      date: next.updatedAt,
      action: nextDriver ? `Driver assigned: ${nextDriver.name}` : 'Driver unassigned',
      actor
    });
  }

  if (previous.status !== next.status) {
    changes.push({
      date: next.updatedAt,
      action: `Status changed to ${next.status}`,
      actor
    });
  }

  if (previous.pickupDate !== next.pickupDate || previous.pickupTime !== next.pickupTime ||
      previous.deliveryDate !== next.deliveryDate || previous.deliveryTime !== next.deliveryTime) {
    changes.push({
      date: next.updatedAt,
      action: 'Schedule updated',
      actor
    });
  }

  if (previous.pickupCity !== next.pickupCity || previous.pickupState !== next.pickupState ||
      previous.deliveryCity !== next.deliveryCity || previous.deliveryState !== next.deliveryState) {
    changes.push({
      date: next.updatedAt,
      action: 'Route updated',
      actor
    });
  }

  if (previous.truckNumber !== next.truckNumber || previous.trailerNumber !== next.trailerNumber) {
    changes.push({
      date: next.updatedAt,
      action: 'Equipment updated',
      actor
    });
  }

  if (previous.rate !== next.rate || previous.driverPayPercent !== next.driverPayPercent) {
    changes.push({
      date: next.updatedAt,
      action: 'Financials updated',
      actor
    });
  }

  if (previous.notes !== next.notes) {
    changes.push({
      date: next.updatedAt,
      action: 'Notes updated',
      actor
    });
  }

  if (JSON.stringify(previous.files || []) !== JSON.stringify(next.files || [])) {
    changes.push({
      date: next.updatedAt,
      action: 'Documents updated',
      actor
    });
  }

  if (!changes.length) {
    changes.push({
      date: next.updatedAt,
      action: 'Updated',
      actor
    });
  }

  return changes;
}

function listLoads(req, res) {
  const { status, priority, driverId, search } = req.query;

  const filtered = store.loads.filter((load) => {
    const statusMatch = !status || load.status === status;
    const priorityMatch = !priority || load.priority === priority;
    const driverMatch = !driverId || Number(driverId) === load.driverId;
    const searchMatch = !search ||
      [
        load.loadNumber,
        load.brokerLoadNumber,
        load.broker,
        load.customer,
        load.dispatcher,
        load.pickupCompany,
        load.pickupCity,
        load.pickupState,
        load.pickupLocation,
        load.deliveryCompany,
        load.deliveryCity,
        load.deliveryState,
        load.deliveryLocation,
        load.truckNumber,
        load.trailerNumber,
        load.notes
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

    return statusMatch && priorityMatch && driverMatch && searchMatch;
  });

  res.json(filtered);
}

function sanitizeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function createLoad(req, res) {
  const payload = req.body;
  const now = new Date().toISOString();
  const normalizedDriverId = sanitizeDriverId(payload.driverId);

  if (normalizedDriverId !== null && !resolveDriver(normalizedDriverId)) {
    return res.status(400).json({ message: 'Assigned driver was not found' });
  }

  const pickupCity = String(payload.pickupCity || '');
  const pickupState = String(payload.pickupState || '');
  const deliveryCity = String(payload.deliveryCity || '');
  const deliveryState = String(payload.deliveryState || '');

  const load = {
    id: store.nextId('loads'),
    ...payload,
    driverId: normalizedDriverId,
    rate: sanitizeNumber(payload.rate),
    loadedMiles: sanitizeNumber(payload.loadedMiles),
    deadheadMiles: sanitizeNumber(payload.deadheadMiles),
    driverPayPercent: sanitizeNumber(payload.driverPayPercent),
    pickupLocation: deriveLocation(pickupCity, pickupState) || String(payload.pickupLocation || ''),
    deliveryLocation: deriveLocation(deliveryCity, deliveryState) || String(payload.deliveryLocation || ''),
    files: sanitizeFiles(payload.files),
    createdAt: now,
    updatedAt: now
  };
  load.history = buildHistoryEntries(null, load, req.user?.email || 'system');

  store.loads.push(load);
  notifyClients({ type: 'load.created', payload: load });
  res.status(201).json(load);
}

function updateLoad(req, res) {
  const id = Number(req.params.id);
  const index = store.loads.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Load not found' });
  }

  const previous = store.loads[index];
  const allowedFields = [
    'loadNumber',
    'brokerLoadNumber',
    'broker',
    'customer',
    'dispatcher',
    'shipper',
    'receiver',
    // Pickup
    'pickupCompany',
    'pickupAddress',
    'pickupCity',
    'pickupState',
    'pickupZip',
    'pickupDate',
    'pickupTime',
    'pickupLocation',
    // Delivery
    'deliveryCompany',
    'deliveryAddress',
    'deliveryCity',
    'deliveryState',
    'deliveryZip',
    'deliveryDate',
    'deliveryTime',
    'deliveryLocation',
    // Assignment
    'driverId',
    'truckNumber',
    'trailerNumber',
    // Financials
    'rate',
    'loadedMiles',
    'deadheadMiles',
    'driverPayPercent',
    // Meta
    'status',
    'priority',
    'notes',
    'files'
  ];

  const payload = allowedFields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      acc[field] = req.body[field];
    }
    return acc;
  }, {});

  if (Object.prototype.hasOwnProperty.call(payload, 'driverId')) {
    payload.driverId = sanitizeDriverId(payload.driverId);
    if (payload.driverId !== null && !resolveDriver(payload.driverId)) {
      return res.status(400).json({ message: 'Assigned driver was not found' });
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'files')) {
    payload.files = sanitizeFiles(payload.files);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'rate')) {
    payload.rate = sanitizeNumber(payload.rate);
  }

  for (const numField of ['loadedMiles', 'deadheadMiles', 'driverPayPercent']) {
    if (Object.prototype.hasOwnProperty.call(payload, numField)) {
      payload[numField] = sanitizeNumber(payload[numField]);
    }
  }

  if (payload.pickupCity !== undefined || payload.pickupState !== undefined) {
    const city = payload.pickupCity !== undefined ? payload.pickupCity : previous.pickupCity;
    const state = payload.pickupState !== undefined ? payload.pickupState : previous.pickupState;
    payload.pickupLocation = deriveLocation(city, state) || previous.pickupLocation || '';
  }

  if (payload.deliveryCity !== undefined || payload.deliveryState !== undefined) {
    const city = payload.deliveryCity !== undefined ? payload.deliveryCity : previous.deliveryCity;
    const state = payload.deliveryState !== undefined ? payload.deliveryState : previous.deliveryState;
    payload.deliveryLocation = deriveLocation(city, state) || previous.deliveryLocation || '';
  }

  const updated = {
    ...previous,
    ...payload,
    updatedAt: new Date().toISOString()
  };
  updated.history = [
    ...(previous.history || []),
    ...buildHistoryEntries(previous, updated, req.user?.email || 'system')
  ];

  store.loads[index] = updated;
  notifyClients({ type: 'load.updated', payload: updated });
  return res.json(updated);
}

function deleteLoad(req, res) {
  const id = Number(req.params.id);
  const index = store.loads.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Load not found' });
  }

  const [removed] = store.loads.splice(index, 1);
  notifyClients({ type: 'load.deleted', payload: { id: removed.id } });
  return res.status(204).send();
}

module.exports = {
  listLoads,
  createLoad,
  updateLoad,
  deleteLoad
};
