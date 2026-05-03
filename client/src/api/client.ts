import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE as string,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
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
