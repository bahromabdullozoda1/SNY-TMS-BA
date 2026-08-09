const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

let token = '';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = 'Bearer ' + token;
  }
  return headers;
}

export function setToken(nextToken) {
  token = nextToken;
}

export function clearToken() {
  token = '';
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getBoard: () => request('/dispatch/board'),
  // Drivers
  getDrivers: (params = '') => request(`/drivers${params ? `?${params}` : ''}`),
  getDriver: (id) => request(`/drivers/${id}`),
  createDriver: (payload) => request('/drivers', { method: 'POST', body: JSON.stringify(payload) }),
  updateDriver: (id, payload) => request(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDriver: (id) => request(`/drivers/${id}`, { method: 'DELETE' }),
  // Loads
  getLoads: (params = '') => request(`/loads${params ? `?${params}` : ''}`),
  createLoad: (payload) => request('/loads', { method: 'POST', body: JSON.stringify(payload) }),
  updateLoad: (id, payload) => request(`/loads/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteLoad: (id) => request(`/loads/${id}`, { method: 'DELETE' }),
  // Trucks
  getTrucks: (params = '') => request(`/trucks${params ? `?${params}` : ''}`),
  getTruck: (id) => request(`/trucks/${id}`),
  createTruck: (payload) => request('/trucks', { method: 'POST', body: JSON.stringify(payload) }),
  updateTruck: (id, payload) => request(`/trucks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTruck: (id) => request(`/trucks/${id}`, { method: 'DELETE' }),
  // Trailers
  getTrailers: (params = '') => request(`/trailers${params ? `?${params}` : ''}`),
  getTrailer: (id) => request(`/trailers/${id}`),
  createTrailer: (payload) => request('/trailers', { method: 'POST', body: JSON.stringify(payload) }),
  updateTrailer: (id, payload) => request(`/trailers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTrailer: (id) => request(`/trailers/${id}`, { method: 'DELETE' }),
  // Fuel
  getFuel: (params = '') => request(`/fuel${params ? `?${params}` : ''}`),
  createFuel: (payload) => request('/fuel', { method: 'POST', body: JSON.stringify(payload) }),
  updateFuel: (id, payload) => request(`/fuel/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteFuel: (id) => request(`/fuel/${id}`, { method: 'DELETE' }),
  // Tolls
  getTolls: (params = '') => request(`/tolls${params ? `?${params}` : ''}`),
  createToll: (payload) => request('/tolls', { method: 'POST', body: JSON.stringify(payload) }),
  updateToll: (id, payload) => request(`/tolls/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteToll: (id) => request(`/tolls/${id}`, { method: 'DELETE' }),
  // Payroll
  getPayroll: (params = '') => request(`/payroll${params ? `?${params}` : ''}`),
  previewPayroll: (params) => request(`/payroll/preview?${params}`),
  createPayroll: (payload) => request('/payroll', { method: 'POST', body: JSON.stringify(payload) }),
  updatePayroll: (id, payload) => request(`/payroll/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePayroll: (id) => request(`/payroll/${id}`, { method: 'DELETE' }),
  // Customers
  getCustomers: (params = '') => request(`/customers${params ? `?${params}` : ''}`),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (payload) => request('/customers', { method: 'POST', body: JSON.stringify(payload) }),
  updateCustomer: (id, payload) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  // Maintenance
  getMaintenance: (params = '') => request(`/maintenance${params ? `?${params}` : ''}`),
  getUpcomingMaintenance: () => request('/maintenance/upcoming'),
  createMaintenance: (payload) => request('/maintenance', { method: 'POST', body: JSON.stringify(payload) }),
  updateMaintenance: (id, payload) => request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteMaintenance: (id) => request(`/maintenance/${id}`, { method: 'DELETE' }),
  // Expenses
  getExpenses: (params = '') => request(`/expenses${params ? `?${params}` : ''}`),
  createExpense: (payload) => request('/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  updateExpense: (id, payload) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  // Documents
  getDocuments: (params = '') => request(`/documents${params ? `?${params}` : ''}`),
  createDocument: (payload) => request('/documents', { method: 'POST', body: JSON.stringify(payload) }),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  // Reports
  getSummary: (params = '') => request(`/reports/summary${params ? `?${params}` : ''}`),
  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (payload) => request('/settings', { method: 'PUT', body: JSON.stringify(payload) })
};
