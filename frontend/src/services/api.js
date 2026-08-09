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
  getDrivers: (params = '') => request(`/drivers${params ? `?${params}` : ''}`),
  createDriver: (payload) => request('/drivers', { method: 'POST', body: JSON.stringify(payload) }),
  updateDriver: (id, payload) => request(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDriver: (id) => request(`/drivers/${id}`, { method: 'DELETE' }),
  getLoads: (params = '') => request(`/loads${params ? `?${params}` : ''}`),
  createLoad: (payload) => request('/loads', { method: 'POST', body: JSON.stringify(payload) }),
  updateLoad: (id, payload) => request(`/loads/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteLoad: (id) => request(`/loads/${id}`, { method: 'DELETE' }),
  getSummary: () => request('/reports/summary')
};
