const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const counters = {
  users: 2,
  drivers: 3,
  loads: 4,
  expenses: 3
};

const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(24).toString('hex');

if (!process.env.SEED_ADMIN_PASSWORD) {
  // eslint-disable-next-line no-console
  console.warn('SEED_ADMIN_PASSWORD is not set. Seed admin password was generated for this runtime.');
}

const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@tms.local',
    password: bcrypt.hashSync(seedAdminPassword, 10),
    role: 'admin'
  }
];

const toISODate = (date) => date.toISOString().slice(0, 10);
const dateFromToday = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toISODate(date);
};

const drivers = [
  { id: 1, name: 'John Carter', phone: '+1-555-0101', email: 'john@tms.local', status: 'active', rating: 4.8 },
  { id: 2, name: 'Amina Rahim', phone: '+1-555-0102', email: 'amina@tms.local', status: 'on_leave', rating: 4.6 }
];

const loads = [
  {
    id: 1,
    loadNumber: 'LD-1001',
    shipper: 'Atlas Inc',
    receiver: 'North Hub',
    pickupLocation: 'Dallas, TX',
    deliveryLocation: 'Chicago, IL',
    pickupDate: dateFromToday(1),
    deliveryDate: dateFromToday(2),
    status: 'new',
    priority: 'high',
    rate: 2200,
    driverId: 1,
    notes: 'Handle with care',
    files: [],
    history: [{ date: new Date().toISOString(), action: 'Seed created', actor: 'system' }]
  },
  {
    id: 2,
    loadNumber: 'LD-1002',
    shipper: 'Rapid Cargo',
    receiver: 'West DC',
    pickupLocation: 'Phoenix, AZ',
    deliveryLocation: 'Las Vegas, NV',
    pickupDate: dateFromToday(2),
    deliveryDate: dateFromToday(3),
    status: 'in_progress',
    priority: 'medium',
    rate: 1400,
    driverId: 2,
    notes: '',
    files: [],
    history: [{ date: new Date().toISOString(), action: 'Seed created', actor: 'system' }]
  },
  {
    id: 3,
    loadNumber: 'LD-1003',
    shipper: 'Blue Road',
    receiver: 'South Yard',
    pickupLocation: 'Miami, FL',
    deliveryLocation: 'Atlanta, GA',
    pickupDate: dateFromToday(0),
    deliveryDate: dateFromToday(1),
    status: 'delivered',
    priority: 'low',
    rate: 1800,
    driverId: 1,
    notes: '',
    files: [],
    history: [{ date: new Date().toISOString(), action: 'Seed created', actor: 'system' }]
  }
];

const expenses = [
  { id: 1, category: 'fuel', amount: 250 },
  { id: 2, category: 'maintenance', amount: 420 }
];

function nextId(entity) {
  const value = counters[entity] || 1;
  counters[entity] = value + 1;
  return value;
}

module.exports = {
  users,
  drivers,
  loads,
  expenses,
  nextId
};
