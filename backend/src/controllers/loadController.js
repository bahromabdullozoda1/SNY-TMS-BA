const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

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
  const load = {
    id: store.nextId('loads'),
    ...payload,
    files: payload.files || [],
    history: [{ date: now, action: 'Created', actor: req.user?.email || 'system' }],
    createdAt: now,
    updatedAt: now
  };

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

  const updated = {
    ...previous,
    ...payload,
    updatedAt: new Date().toISOString(),
    history: [
      ...(previous.history || []),
      {
        date: new Date().toISOString(),
        action: 'Updated',
        actor: req.user?.email || 'system'
      }
    ]
  };

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
