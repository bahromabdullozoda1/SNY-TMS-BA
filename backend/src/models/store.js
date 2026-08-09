const bcrypt = require('bcryptjs');

const counters = {
  users: 2,
  drivers: 3,
  loads: 4,
  expenses: 2
};

const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@tms.local',
    password: bcrypt.hashSync('Admin123!', 10),
    role: 'admin'
  }
];

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
    pickupDate: '2026-08-11',
    deliveryDate: '2026-08-12',
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
    pickupDate: '2026-08-12',
    deliveryDate: '2026-08-13',
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
    pickupDate: '2026-08-10',
    deliveryDate: '2026-08-11',
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
