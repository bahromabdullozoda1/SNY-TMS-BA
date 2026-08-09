const store = require('../models/store');

function listDrivers(req, res) {
  const { status, search } = req.query;

  const filtered = store.drivers.filter((driver) => {
    const statusMatch = !status || driver.status === status;
    const searchMatch = !search ||
      [driver.name, driver.phone, driver.email].join(' ').toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  res.json(filtered);
}

function createDriver(req, res) {
  const allowedFields = ['name', 'phone', 'email', 'status'];
  const payload = allowedFields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      acc[field] = req.body[field];
    }
    return acc;
  }, {});

  const driver = {
    id: store.nextId('drivers'),
    ...payload,
    rating: 0,
    loadsCount: 0,
    createdAt: new Date().toISOString()
  };

  store.drivers.push(driver);
  res.status(201).json(driver);
}

function updateDriver(req, res) {
  const id = Number(req.params.id);
  const index = store.drivers.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  const allowedFields = ['name', 'phone', 'email', 'status'];
  const payload = allowedFields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      acc[field] = req.body[field];
    }
    return acc;
  }, {});

  store.drivers[index] = { ...store.drivers[index], ...payload };
  return res.json(store.drivers[index]);
}

function deleteDriver(req, res) {
  const id = Number(req.params.id);
  const index = store.drivers.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  store.drivers.splice(index, 1);
  return res.status(204).send();
}

module.exports = {
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver
};
