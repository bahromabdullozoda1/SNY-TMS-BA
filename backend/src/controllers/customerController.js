const store = require('../models/store');
const { notifyClients } = require('../utils/websocket');

function serializeCustomer(c) {
  const loads = store.loads.filter((l) => l.customerId === c.id);
  const totalRevenue = loads.reduce((s, l) => s + (l.rate || 0), 0);
  const totalMiles = loads.reduce((s, l) => s + (l.loadedMiles || 0) + (l.deadheadMiles || 0), 0);
  const avgRate = loads.length > 0 ? totalRevenue / loads.length : 0;
  const avgRpm = totalMiles > 0 ? totalRevenue / totalMiles : 0;
  return {
    ...c,
    totalLoads: loads.length,
    totalRevenue,
    avgRate,
    avgRpm: avgRpm.toFixed(3)
  };
}

function listCustomers(req, res) {
  const { type, search } = req.query;
  const filtered = store.customers.filter((c) => {
    const typeMatch = !type || c.type === type;
    const searchMatch = !search || [c.companyName, c.contactPerson, c.email, c.mcNumber].join(' ').toLowerCase().includes(search.toLowerCase());
    return typeMatch && searchMatch;
  });
  res.json(filtered.map(serializeCustomer));
}

function getCustomer(req, res) {
  const id = Number(req.params.id);
  const c = store.customers.find((item) => item.id === id);
  if (!c) return res.status(404).json({ message: 'Customer not found' });
  const loads = store.loads.filter((l) => l.customerId === id);
  return res.json({ ...serializeCustomer(c), loads });
}

function createCustomer(req, res) {
  const allowed = ['companyName','type','mcNumber','dotNumber','phone','email','address','city','state',
    'zip','contactPerson','paymentTerms','creditLimit','factoringStatus','notes'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });

  const item = { id: store.nextId('customers'), ...payload, createdAt: new Date().toISOString() };
  store.customers.push(item);
  notifyClients({ type: 'customer.created', payload: serializeCustomer(item) });
  return res.status(201).json(serializeCustomer(item));
}

function updateCustomer(req, res) {
  const id = Number(req.params.id);
  const idx = store.customers.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });

  const allowed = ['companyName','type','mcNumber','dotNumber','phone','email','address','city','state',
    'zip','contactPerson','paymentTerms','creditLimit','factoringStatus','notes'];
  const payload = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(req.body, f)) payload[f] = req.body[f]; });

  store.customers[idx] = { ...store.customers[idx], ...payload, updatedAt: new Date().toISOString() };
  notifyClients({ type: 'customer.updated', payload: serializeCustomer(store.customers[idx]) });
  return res.json(serializeCustomer(store.customers[idx]));
}

function deleteCustomer(req, res) {
  const id = Number(req.params.id);
  const idx = store.customers.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });
  const [deleted] = store.customers.splice(idx, 1);
  notifyClients({ type: 'customer.deleted', payload: { id: deleted.id } });
  return res.status(204).send();
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
