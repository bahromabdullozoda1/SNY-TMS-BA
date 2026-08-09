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

function buildHistoryEntries(previous, next, actor) {
  const changes = [];

  if (!previous) {
    return [{ date: next.createdAt, action: 'Created', actor }];
  }

  if (previous.driverId !== next.driverId) {
    const nextDriver = resolveDriver(next.driverId);
    changes.push({
      date: next.updatedAt,
      action: nextDriver ? `Assigned to ${nextDriver.name}` : 'Unassigned from driver',
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

  if (previous.pickupDate !== next.pickupDate || previous.deliveryDate !== next.deliveryDate) {
    changes.push({
      date: next.updatedAt,
      action: 'Schedule updated',
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
      [load.loadNumber, load.pickupLocation, load.deliveryLocation, load.notes]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

    return statusMatch && priorityMatch && driverMatch && searchMatch;
  });

  res.json(filtered);
}

function createLoad(req, res) {
  const payload = req.body;
  const now = new Date().toISOString();
  const normalizedDriverId = sanitizeDriverId(payload.driverId);

  if (normalizedDriverId !== null && !resolveDriver(normalizedDriverId)) {
    return res.status(400).json({ message: 'Assigned driver was not found' });
  }

  const load = {
    id: store.nextId('loads'),
    ...payload,
    driverId: normalizedDriverId,
    rate: Number(payload.rate || 0),
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
    'shipper',
    'receiver',
    'pickupLocation',
    'deliveryLocation',
    'pickupDate',
    'deliveryDate',
    'status',
    'priority',
    'rate',
    'driverId',
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
    payload.rate = Number(payload.rate || 0);
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
