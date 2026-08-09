const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { once } = require('node:events');
const test = require('node:test');

process.env.SEED_ADMIN_PASSWORD = 'ChangeMe123!';
process.env.JWT_SECRET = 'test-secret';

const { createApp } = require('./app');
const store = require('./models/store');

const initialState = JSON.parse(JSON.stringify({
  users: store.users,
  drivers: store.drivers,
  loads: store.loads,
  expenses: store.expenses
}));

function resetStore() {
  store.users.splice(0, store.users.length, ...JSON.parse(JSON.stringify(initialState.users)));
  store.drivers.splice(0, store.drivers.length, ...JSON.parse(JSON.stringify(initialState.drivers)));
  store.loads.splice(0, store.loads.length, ...JSON.parse(JSON.stringify(initialState.loads)));
  store.expenses.splice(0, store.expenses.length, ...JSON.parse(JSON.stringify(initialState.expenses)));
}

async function createClient() {
  const server = createServer(createApp());
  server.listen(0);
  await once(server, 'listening');

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body };
  }

  return {
    request,
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

async function login(request) {
  const { response, body } = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@tms.local',
      password: 'ChangeMe123!'
    })
  });

  assert.equal(response.status, 200);
  assert.ok(body.token);
  return body.token;
}

function authHeaders(token) {
  return {
    Authorization: 'Bearer ' + token
  };
}

test.beforeEach(() => {
  resetStore();
});

test('admin can sign in and fetch report summary', async () => {
  const client = await createClient();

  try {
    const token = await login(client.request);
    const { response, body } = await client.request('/api/reports/summary', {
      headers: authHeaders(token)
    });

    assert.equal(response.status, 200);
    assert.equal(body.statusBreakdown.assigned, 1);
    assert.equal(body.financial.revenue, 5400);
  } finally {
    await client.close();
  }
});

test('creating a load sanitizes files and stores driver assignment', async () => {
  const client = await createClient();

  try {
    const token = await login(client.request);
    const { response, body } = await client.request('/api/loads', {
      method: 'POST',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        loadNumber: 'LD-2001',
        shipper: 'Fresh Foods',
        receiver: 'Central Market',
        pickupLocation: 'Austin, TX',
        deliveryLocation: 'Houston, TX',
        pickupDate: '2026-08-10',
        deliveryDate: '2026-08-11',
        status: 'new',
        priority: 'high',
        rate: '1750',
        driverId: 1,
        notes: 'Keep refrigerated',
        files: [{ name: 'pod.pdf', size: '2048', type: 'application/pdf', path: '/tmp/private' }]
      })
    });

    assert.equal(response.status, 201);
    assert.equal(body.driverId, 1);
    assert.equal(body.rate, 1750);
    assert.deepEqual(Object.keys(body.files[0]).sort(), ['category', 'id', 'name', 'size', 'type', 'uploadedAt'].sort());
    assert.equal(body.history.at(-1).action, 'Created');
  } finally {
    await client.close();
  }
});

test('updating a load rejects unknown drivers and records history for valid changes', async () => {
  const client = await createClient();

  try {
    const token = await login(client.request);
    const load = store.loads[0];
    const invalidDriverUpdate = await client.request(`/api/loads/${load.id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...load, driverId: 9999 })
    });

    assert.equal(invalidDriverUpdate.response.status, 400);

    const validUpdate = await client.request(`/api/loads/${load.id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...load, status: 'in_progress', notes: 'Updated note' })
    });

    assert.equal(validUpdate.response.status, 200);
    assert.equal(validUpdate.body.status, 'in_progress');
    assert.ok(validUpdate.body.history.some((entry) => entry.action === 'Status changed to in_progress'));
    assert.ok(validUpdate.body.history.some((entry) => entry.action === 'Notes updated'));
  } finally {
    await client.close();
  }
});

test('deleting a driver with assigned active loads is blocked', async () => {
  const client = await createClient();

  try {
    const token = await login(client.request);
    const { response, body } = await client.request('/api/drivers/1', {
      method: 'DELETE',
      headers: authHeaders(token)
    });

    assert.equal(response.status, 409);
    assert.equal(body.message, 'Driver is assigned to active loads');
  } finally {
    await client.close();
  }
});
