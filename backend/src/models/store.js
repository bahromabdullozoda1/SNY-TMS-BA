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
  {
    id: 1,
    // Personal
    firstName: 'John',
    lastName: 'Carter',
    name: 'John Carter',
    phone: '+1-555-0101',
    email: 'john@tms.local',
    address: '123 Main St',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    emergencyContactName: 'Jane Carter',
    emergencyContactPhone: '+1-555-0110',
    // Employment
    hireDate: '2022-03-15',
    terminationDate: null,
    employmentStatus: 'active',
    status: 'available',
    // License / Compliance
    cdlNumber: 'TX123456',
    cdlState: 'TX',
    cdlClass: 'A',
    cdlExpiration: '2026-03-15',
    medicalCardExpiration: '2025-09-01',
    mvrExpiration: '2025-03-15',
    drugTestDate: '2022-03-14',
    clearinghouseStatus: 'clear',
    // Assignment
    assignedTruckId: 1,
    assignedTrailerId: 1,
    currentLoadId: null,
    dispatcher: 'Mike Johnson',
    homeTerminal: 'Dallas, TX',
    // Pay
    payType: 'percentage',
    payRate: 28,
    // Stats
    totalLoads: 45,
    loadedMiles: 52000,
    deadheadMiles: 4200,
    totalMiles: 56200,
    revenueGenerated: 98000,
    driverPay: 27440,
    rating: 4.8,
    notes: '',
    files: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    firstName: 'Amina',
    lastName: 'Rahim',
    name: 'Amina Rahim',
    phone: '+1-555-0102',
    email: 'amina@tms.local',
    address: '456 Oak Ave',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85001',
    emergencyContactName: 'Hassan Rahim',
    emergencyContactPhone: '+1-555-0120',
    hireDate: '2021-07-20',
    terminationDate: null,
    employmentStatus: 'active',
    status: 'on_load',
    cdlNumber: 'AZ654321',
    cdlState: 'AZ',
    cdlClass: 'A',
    cdlExpiration: '2025-07-20',
    medicalCardExpiration: '2026-01-15',
    mvrExpiration: '2025-07-20',
    drugTestDate: '2021-07-19',
    clearinghouseStatus: 'clear',
    assignedTruckId: 2,
    assignedTrailerId: 2,
    currentLoadId: 2,
    dispatcher: 'Sarah Lee',
    homeTerminal: 'Phoenix, AZ',
    payType: 'percentage',
    payRate: 25,
    totalLoads: 38,
    loadedMiles: 41000,
    deadheadMiles: 3100,
    totalMiles: 44100,
    revenueGenerated: 72000,
    driverPay: 18000,
    rating: 4.6,
    notes: '',
    files: [],
    createdAt: new Date().toISOString()
  }
];

const trucks = [
  {
    id: 1,
    unitNumber: 'T-101',
    vin: '1HGBH41JXMN109186',
    make: 'Peterbilt',
    model: '389',
    year: 2020,
    licensePlate: 'TX-TRK101',
    plateState: 'TX',
    registrationExpiration: '2025-12-31',
    insuranceExpiration: '2025-06-30',
    iftaNumber: 'TX-IFTA-101',
    currentOdometer: 285000,
    startingOdometer: 180000,
    assignedDriverId: 1,
    assignedTrailerId: 1,
    currentLoadId: null,
    ownershipType: 'company',
    status: 'available',
    notes: '',
    files: [],
    maintenanceHistory: [],
    fuelHistory: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    unitNumber: 'T-202',
    vin: '2HGBH41JXMN109187',
    make: 'Kenworth',
    model: 'T680',
    year: 2021,
    licensePlate: 'AZ-TRK202',
    plateState: 'AZ',
    registrationExpiration: '2026-01-31',
    insuranceExpiration: '2025-08-31',
    iftaNumber: 'AZ-IFTA-202',
    currentOdometer: 195000,
    startingOdometer: 120000,
    assignedDriverId: 2,
    assignedTrailerId: 2,
    currentLoadId: 2,
    ownershipType: 'company',
    status: 'dispatched',
    notes: '',
    files: [],
    maintenanceHistory: [],
    fuelHistory: [],
    createdAt: new Date().toISOString()
  }
];

const trailers = [
  {
    id: 1,
    trailerNumber: 'TR-201',
    vin: '3HGBH41JXMN109188',
    trailerType: 'dry_van',
    make: 'Wabash',
    model: 'DuraPlate',
    year: 2019,
    plate: 'TX-TRL201',
    plateState: 'TX',
    registrationExpiration: '2025-12-31',
    assignedTruckId: 1,
    assignedDriverId: 1,
    currentLoadId: null,
    status: 'available',
    notes: '',
    files: [],
    maintenanceHistory: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    trailerNumber: 'TR-304',
    vin: '4HGBH41JXMN109189',
    trailerType: 'reefer',
    make: 'Great Dane',
    model: 'Everest',
    year: 2020,
    plate: 'AZ-TRL304',
    plateState: 'AZ',
    registrationExpiration: '2026-03-31',
    assignedTruckId: 2,
    assignedDriverId: 2,
    currentLoadId: 2,
    status: 'assigned',
    notes: '',
    files: [],
    maintenanceHistory: [],
    createdAt: new Date().toISOString()
  }
];

const loads = [
  {
    id: 1,
    loadNumber: 'LD-1001',
    brokerLoadNumber: 'ATL-2024-001',
    broker: 'Atlas Freight Brokerage',
    customerId: 1,
    customer: 'Atlas Inc',
    dispatcher: 'Mike Johnson',
    shipper: 'Atlas Inc',
    receiver: 'North Hub',
    pickupCompany: 'Atlas Inc',
    pickupAddress: '1200 Commerce St',
    pickupCity: 'Dallas',
    pickupState: 'TX',
    pickupZip: '75201',
    pickupDate: dateFromToday(1),
    pickupTime: '08:00',
    pickupLocation: 'Dallas, TX',
    deliveryCompany: 'North Hub Distribution',
    deliveryAddress: '400 N Clark St',
    deliveryCity: 'Chicago',
    deliveryState: 'IL',
    deliveryZip: '60610',
    deliveryDate: dateFromToday(2),
    deliveryTime: '18:00',
    deliveryLocation: 'Chicago, IL',
    driverId: 1,
    truckId: 1,
    truckNumber: 'T-101',
    trailerId: 1,
    trailerNumber: 'TR-201',
    loadedMiles: 920,
    deadheadMiles: 45,
    rate: 2200,
    driverPayType: 'percentage',
    driverPayPercent: 28,
    driverPayAmount: 616,
    grossProfit: 1584,
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
    customerId: 2,
    customer: 'Rapid Cargo',
    dispatcher: 'Sarah Lee',
    shipper: 'Rapid Cargo',
    receiver: 'West DC',
    pickupCompany: 'Rapid Cargo Warehouse',
    pickupAddress: '8800 W Van Buren St',
    pickupCity: 'Phoenix',
    pickupState: 'AZ',
    pickupZip: '85043',
    pickupDate: dateFromToday(0),
    pickupTime: '09:30',
    pickupLocation: 'Phoenix, AZ',
    deliveryCompany: 'West DC Fulfillment',
    deliveryAddress: '3600 S Valley View Blvd',
    deliveryCity: 'Las Vegas',
    deliveryState: 'NV',
    deliveryZip: '89103',
    deliveryDate: dateFromToday(1),
    deliveryTime: '15:00',
    deliveryLocation: 'Las Vegas, NV',
    driverId: 2,
    truckId: 2,
    truckNumber: 'T-202',
    trailerId: 2,
    trailerNumber: 'TR-304',
    loadedMiles: 295,
    deadheadMiles: 22,
    rate: 1400,
    driverPayType: 'percentage',
    driverPayPercent: 25,
    driverPayAmount: 350,
    grossProfit: 1050,
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
    customerId: 3,
    customer: 'Blue Road',
    dispatcher: 'Mike Johnson',
    shipper: 'Blue Road',
    receiver: 'South Yard',
    pickupCompany: 'Blue Road Miami Hub',
    pickupAddress: '7900 NW 25th St',
    pickupCity: 'Miami',
    pickupState: 'FL',
    pickupZip: '33122',
    pickupDate: dateFromToday(-1),
    pickupTime: '06:00',
    pickupLocation: 'Miami, FL',
    deliveryCompany: 'South Yard Terminal',
    deliveryAddress: '2200 Sullivan Rd',
    deliveryCity: 'Atlanta',
    deliveryState: 'GA',
    deliveryZip: '30337',
    deliveryDate: dateFromToday(0),
    deliveryTime: '17:00',
    deliveryLocation: 'Atlanta, GA',
    driverId: 1,
    truckId: 1,
    truckNumber: 'T-101',
    trailerId: 1,
    trailerNumber: 'TR-201',
    loadedMiles: 662,
    deadheadMiles: 30,
    rate: 1800,
    driverPayType: 'percentage',
    driverPayPercent: 27,
    driverPayAmount: 486,
    grossProfit: 1314,
    status: 'delivered',
    priority: 'low',
    notes: 'POD received',
    files: [],
    history: [{ date: new Date().toISOString(), action: 'Seed created', actor: 'system' }]
  }
];

const customers = [
  {
    id: 1,
    companyName: 'Atlas Inc',
    type: 'customer',
    mcNumber: 'MC-123456',
    dotNumber: 'DOT-789012',
    phone: '+1-800-555-0101',
    email: 'billing@atlasinc.com',
    address: '1200 Commerce St',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    contactPerson: 'Tom Harris',
    paymentTerms: 'Net 30',
    creditLimit: 50000,
    factoringStatus: 'none',
    notes: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    companyName: 'Rapid Cargo Solutions',
    type: 'broker',
    mcNumber: 'MC-654321',
    dotNumber: '',
    phone: '+1-800-555-0202',
    email: 'ops@rapidcargo.com',
    address: '8800 W Van Buren St',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85043',
    contactPerson: 'Lisa Park',
    paymentTerms: 'Net 21',
    creditLimit: 75000,
    factoringStatus: 'factored',
    notes: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    companyName: 'Blue Road Logistics',
    type: 'broker',
    mcNumber: 'MC-111222',
    dotNumber: '',
    phone: '+1-800-555-0303',
    email: 'dispatch@blueroad.com',
    address: '7900 NW 25th St',
    city: 'Miami',
    state: 'FL',
    zip: '33122',
    contactPerson: 'Carlos Mendez',
    paymentTerms: 'Net 45',
    creditLimit: 30000,
    factoringStatus: 'none',
    notes: '',
    createdAt: new Date().toISOString()
  }
];

const fuelTransactions = [
  {
    id: 1,
    date: dateFromToday(-2),
    time: '11:30',
    driverId: 1,
    truckId: 1,
    loadId: 3,
    location: 'Love\'s Travel Stop',
    city: 'Atlanta',
    state: 'GA',
    gallons: 120,
    pricePerGallon: 3.85,
    totalCost: 462,
    odometer: 284500,
    fuelType: 'diesel',
    fuelCard: 'EFS',
    transactionNumber: 'EFS-20240601',
    notes: '',
    files: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    date: dateFromToday(-1),
    time: '14:00',
    driverId: 2,
    truckId: 2,
    loadId: 2,
    location: 'Pilot Flying J',
    city: 'Flagstaff',
    state: 'AZ',
    gallons: 95,
    pricePerGallon: 3.92,
    totalCost: 372.40,
    odometer: 194200,
    fuelType: 'diesel',
    fuelCard: 'Comdata',
    transactionNumber: 'CMD-20240602',
    notes: '',
    files: [],
    createdAt: new Date().toISOString()
  }
];

const tollTransactions = [
  {
    id: 1,
    date: dateFromToday(-2),
    driverId: 1,
    truckId: 1,
    loadId: 3,
    tollAuthority: 'Georgia DOT',
    tollRoad: 'I-75 GA Toll',
    entryLocation: 'Macon, GA',
    exitLocation: 'Atlanta, GA',
    state: 'GA',
    amount: 14.50,
    transponder: 'Bestpass',
    notes: '',
    files: [],
    createdAt: new Date().toISOString()
  }
];

const payrollStatements = [
  {
    id: 1,
    driverId: 1,
    periodStart: dateFromToday(-14),
    periodEnd: dateFromToday(-1),
    loadIds: [3],
    loadsCompleted: 1,
    grossLoadRevenue: 1800,
    payType: 'percentage',
    payRate: 27,
    driverGrossPay: 486,
    advances: 0,
    fuelDeductions: 0,
    tollDeductions: 0,
    otherDeductions: 0,
    reimbursements: 0,
    bonuses: 0,
    adjustments: 0,
    netDriverPay: 486,
    paymentStatus: 'paid',
    paidDate: dateFromToday(-1),
    notes: '',
    createdAt: new Date().toISOString()
  }
];

const maintenanceRecords = [
  {
    id: 1,
    vehicleType: 'truck',
    vehicleId: 1,
    vehicleLabel: 'T-101',
    serviceDate: dateFromToday(-30),
    serviceCategory: 'oil_change',
    description: 'Full synthetic oil change + filters',
    vendor: 'Peterbilt Dallas',
    odometer: 280000,
    laborCost: 120,
    partsCost: 85,
    totalCost: 205,
    nextServiceMileage: 295000,
    nextServiceDate: dateFromToday(60),
    status: 'completed',
    notes: '',
    files: [],
    createdAt: new Date().toISOString()
  }
];

const expenses = [
  {
    id: 1,
    date: dateFromToday(-5),
    category: 'fuel',
    driverId: 1,
    truckId: 1,
    trailerId: null,
    loadId: 3,
    vendor: 'Love\'s Travel Stop',
    amount: 462,
    paymentMethod: 'fuel_card',
    notes: '',
    files: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    date: dateFromToday(-30),
    category: 'maintenance',
    driverId: null,
    truckId: 1,
    trailerId: null,
    loadId: null,
    vendor: 'Peterbilt Dallas',
    amount: 205,
    paymentMethod: 'check',
    notes: 'Oil change + filters',
    files: [],
    createdAt: new Date().toISOString()
  }
];

const documents = [
  {
    id: 1,
    name: 'Rate Confirmation LD-1001',
    type: 'rate_confirmation',
    linkedType: 'load',
    linkedId: 1,
    uploadedAt: new Date().toISOString(),
    notes: '',
    size: 0,
    mimeType: 'application/pdf'
  }
];

const settings = {
  companyName: 'SNY Trucking LLC',
  dotNumber: 'DOT-9876543',
  mcNumber: 'MC-456789',
  address: '100 Freight Way',
  city: 'Dallas',
  state: 'TX',
  zip: '75201',
  phone: '+1-800-555-0001',
  email: 'ops@snytms.com',
  defaultDriverPayType: 'percentage',
  defaultDriverPayPercent: 27,
  currency: 'USD',
  timezone: 'America/Chicago',
  dateFormat: 'MM/DD/YYYY'
};

const counters = {
  users: Math.max(...users.map((u) => u.id), 0) + 1,
  drivers: Math.max(...drivers.map((d) => d.id), 0) + 1,
  trucks: Math.max(...trucks.map((t) => t.id), 0) + 1,
  trailers: Math.max(...trailers.map((t) => t.id), 0) + 1,
  loads: Math.max(...loads.map((l) => l.id), 0) + 1,
  customers: Math.max(...customers.map((c) => c.id), 0) + 1,
  fuelTransactions: Math.max(...fuelTransactions.map((f) => f.id), 0) + 1,
  tollTransactions: Math.max(...tollTransactions.map((t) => t.id), 0) + 1,
  payrollStatements: Math.max(...payrollStatements.map((p) => p.id), 0) + 1,
  maintenanceRecords: Math.max(...maintenanceRecords.map((m) => m.id), 0) + 1,
  expenses: Math.max(...expenses.map((e) => e.id), 0) + 1,
  documents: Math.max(...documents.map((d) => d.id), 0) + 1
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
  trucks,
  trailers,
  loads,
  customers,
  fuelTransactions,
  tollTransactions,
  payrollStatements,
  maintenanceRecords,
  expenses,
  documents,
  settings,
  nextId
};
