import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE as string,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const requestUrl: string = err.config?.url ?? '';
      // /auth/me and /auth/admin-me are session hydration checks — a 401 just means
      // "not logged in", which is expected for guests. Never redirect for these.
      if (requestUrl.endsWith('/auth/me') || requestUrl.endsWith('/auth/admin-me')) {
        return Promise.reject(err);
      }

      const path = window.location.pathname;
      const excluded = ['/login', '/register', '/admin/login'];
      if (!excluded.includes(path)) {
        window.location.href = path.startsWith('/admin') ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;
