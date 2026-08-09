const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    brokerLoadNumber: 'ATL-2024-001',
    broker: 'Atlas Freight Brokerage',
    customer: 'Atlas Inc',
    dispatcher: 'Mike Johnson',
    shipper: 'Atlas Inc',
    receiver: 'North Hub',
    // Pickup
    pickupCompany: 'Atlas Inc',
    pickupAddress: '1200 Commerce St',
    pickupCity: 'Dallas',
    pickupState: 'TX',
    pickupZip: '75201',
    pickupDate: dateFromToday(1),
    pickupTime: '08:00',
    pickupLocation: 'Dallas, TX',
    // Delivery
    deliveryCompany: 'North Hub Distribution',
    deliveryAddress: '400 N Clark St',
    deliveryCity: 'Chicago',
    deliveryState: 'IL',
    deliveryZip: '60610',
    deliveryDate: dateFromToday(2),
    deliveryTime: '18:00',
    deliveryLocation: 'Chicago, IL',
    // Assignment
    driverId: 1,
    truckNumber: 'T-101',
    trailerNumber: 'TR-201',
    // Financials
    loadedMiles: 920,
    deadheadMiles: 45,
    rate: 2200,
    driverPayPercent: 28,
    status: 'assigned',
    priority: 'high',
    notes: 'Handle with care — fragile electronics',
    files: [],
    history: [{ date: new Date().toISOString(), action: 'Seed created', actor: 'system' }]
  },
  {
    id: 2,
    loadNumber: 'LD-1002',
    brokerLoadNumber: 'RPC-7788',
    broker: 'Rapid Cargo Solutions',
    customer: 'Rapid Cargo',
    dispatcher: 'Sarah Lee',
    shipper: 'Rapid Cargo',
    receiver: 'West DC',
    // Pickup
    pickupCompany: 'Rapid Cargo Warehouse',
    pickupAddress: '8800 W Van Buren St',
    pickupCity: 'Phoenix',
    pickupState: 'AZ',
    pickupZip: '85043',
    pickupDate: dateFromToday(0),
    pickupTime: '09:30',
    pickupLocation: 'Phoenix, AZ',
    // Delivery
    deliveryCompany: 'West DC Fulfillment',
    deliveryAddress: '3600 S Valley View Blvd',
    deliveryCity: 'Las Vegas',
    deliveryState: 'NV',
    deliveryZip: '89103',
    deliveryDate: dateFromToday(1),
    deliveryTime: '15:00',
    deliveryLocation: 'Las Vegas, NV',
    // Assignment
    driverId: 2,
    truckNumber: 'T-202',
    trailerNumber: 'TR-304',
    // Financials
    loadedMiles: 295,
    deadheadMiles: 22,
    rate: 1400,
    driverPayPercent: 25,
    status: 'in_transit',
    priority: 'medium',
    notes: '',
    files: [],
    history: [{ date: new Date().toISOString(), action: 'Seed created', actor: 'system' }]
  },
  {
    id: 3,
    loadNumber: 'LD-1003',
    brokerLoadNumber: 'BRD-5500',
    broker: 'Blue Road Logistics',
    customer: 'Blue Road',
    dispatcher: 'Mike Johnson',
    shipper: 'Blue Road',
    receiver: 'South Yard',
    // Pickup
    pickupCompany: 'Blue Road Miami Hub',
    pickupAddress: '7900 NW 25th St',
    pickupCity: 'Miami',
    pickupState: 'FL',
    pickupZip: '33122',
    pickupDate: dateFromToday(-1),
    pickupTime: '06:00',
    pickupLocation: 'Miami, FL',
    // Delivery
    deliveryCompany: 'South Yard Terminal',
    deliveryAddress: '2200 Sullivan Rd',
    deliveryCity: 'Atlanta',
    deliveryState: 'GA',
    deliveryZip: '30337',
    deliveryDate: dateFromToday(0),
    deliveryTime: '17:00',
    deliveryLocation: 'Atlanta, GA',
    // Assignment
    driverId: 1,
    truckNumber: 'T-101',
    trailerNumber: 'TR-105',
    // Financials
    loadedMiles: 662,
    deadheadMiles: 30,
    rate: 1800,
    driverPayPercent: 27,
    status: 'delivered',
    priority: 'low',
    notes: 'POD received',
    files: [],
    history: [{ date: new Date().toISOString(), action: 'Seed created', actor: 'system' }]
  }
];

const expenses = [
  { id: 1, category: 'fuel', amount: 250 },
  { id: 2, category: 'maintenance', amount: 420 }
];

const counters = {
  users: Math.max(...users.map((user) => user.id), 0) + 1,
  drivers: Math.max(...drivers.map((driver) => driver.id), 0) + 1,
  loads: Math.max(...loads.map((load) => load.id), 0) + 1,
  expenses: Math.max(...expenses.map((expense) => expense.id), 0) + 1
};

function nextId(entity) {
  if (!Object.prototype.hasOwnProperty.call(counters, entity)) {
    throw new Error(`Unknown entity counter: ${entity}`);
  }

  const value = counters[entity];
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
