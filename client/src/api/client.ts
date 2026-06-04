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
      // /auth/me is the session hydration check — a 401 just means "not logged in",
      // which is expected for guests browsing public pages. Never redirect for this.
      if (requestUrl.includes('/auth/me')) return Promise.reject(err);

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
