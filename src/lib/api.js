import { apiClient, unwrapApi } from './apiClient.js';

const query = (params) => new URLSearchParams(params).toString();

export const authApi = {
  login: (payload) => apiClient.post(import.meta.env.VITE_AUTH_LOGIN_PATH || '/api/v1/auth/login', payload),
  register: (payload) => apiClient.post(import.meta.env.VITE_AUTH_REGISTER_PATH || '/api/v1/auth/register', payload),
  me: () => apiClient.get(import.meta.env.VITE_AUTH_ME_PATH || '/api/v1/users/me'),
};

export const workoutApi = {
  list: async ({ page = 0, size = 20, sort = 'startedAt,desc', workoutType } = {}) => {
    const params = { page, size, sort };
    const path = workoutType && workoutType !== 'ALL'
      ? `/api/v1/workouts/type/${encodeURIComponent(workoutType)}`
      : '/api/v1/workouts';
    const response = await apiClient.get(path, { params });
    return unwrapApi(response);
  },
  create: (payload) => apiClient.post('/api/v1/workouts', payload),
  remove: (id) => apiClient.delete(`/api/v1/workouts/${id}`),
  get: (id) => apiClient.get(`/api/v1/workouts/${id}`),
};

export const analyticsApi = {
  summary: async (start, end) => {
    const response = await apiClient.get(`/api/v1/workouts/analytics/summary?${query({ start, end })}`);
    return unwrapApi(response);
  },
};

export const coachApi = {
  recommendation: async (start, end) => unwrapApi(await apiClient.get(`/api/v1/ai/coach?${query({ start, end })}`)),
  chat: async (message) => unwrapApi(await apiClient.post('/api/v1/ai/chat', { message })),
};


export const integrationApi = {
  intervalsStatus: async () =>
    unwrapApi(await apiClient.get('/api/v1/integrations/intervals-icu/status')),

  authorizeIntervals: async () =>
    unwrapApi(await apiClient.get('/api/v1/integrations/intervals-icu/authorize-url')),

  disconnectIntervals: async () =>
    unwrapApi(await apiClient.delete('/api/v1/integrations/intervals-icu/disconnect')),

  syncIntervals: async ({ oldest, newest, limit = 200 }) =>
    unwrapApi(
      await apiClient.post(
        `/api/v1/integrations/intervals-icu/sync?${query({ oldest, newest, limit })}`,
      ),
    ),

  telegramLinkCode: async () =>
    unwrapApi(await apiClient.post('/api/v1/integrations/telegram/link-code')),
};


export function unwrapEntity(response) {
  return unwrapApi(response);
}

export function getListFromPage(value) {
  const data = unwrapApi(value);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}
