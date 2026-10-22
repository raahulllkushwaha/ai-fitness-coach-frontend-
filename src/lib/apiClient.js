import axios from 'axios';
import { useAuthStore } from '../features/auth/authStore.js';

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL,
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') window.location.assign('/login?expired=1');
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) {
    return `Could not reach the backend at ${baseURL}. Check that Spring Boot is running and VITE_API_BASE_URL is correct.`;
  }
  const payload = error.response.data;
  return payload?.detail || payload?.message || payload?.title || payload?.error || fallback;
}

export function unwrapApi(value) {
  let data = value?.data !== undefined && value?.status !== undefined ? value.data : value;
  for (let i = 0; i < 4; i += 1) {
    if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data') && (data.success === true || data.status === 'success')) {
      data = data.data;
    } else {
      break;
    }
  }
  return data;
}

export function findToken(value) {
  const queue = [value];
  const seen = new Set();
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    for (const key of ['accessToken', 'access_token', 'token', 'jwt', 'idToken']) {
      if (typeof current[key] === 'string' && current[key].split('.').length === 3) return current[key];
    }
    for (const key of ['data', 'result', 'payload', 'auth', 'tokens']) {
      if (current[key] && typeof current[key] === 'object') queue.push(current[key]);
    }
  }
  if (typeof value === 'string' && value.split('.').length === 3) return value;
  return null;
}

export function decodeJwt(token) {
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    return {
      id: payload.userId ?? payload.id ?? payload.uid ?? null,
      username: payload.username ?? payload.preferred_username ?? payload.sub ?? 'Athlete',
      email: payload.email ?? '',
      role: payload.role ?? 'USER',
      firstName: payload.firstName ?? payload.first_name ?? '',
      lastName: payload.lastName ?? payload.last_name ?? '',
    };
  } catch {
    return { id: null, username: 'Athlete', email: '', role: 'USER' };
  }
}
