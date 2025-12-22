import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ej: http://127.0.0.1:8000/api
});

// 1) REQUEST: meter access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

function processQueue(error, token = null) {
  pendingRequests.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  pendingRequests = [];
}

// 2) RESPONSE: si 401, intentar refresh y reintentar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh");
    if (!refresh) return Promise.reject(error);

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((newToken) => {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      });
    }

    isRefreshing = true;

    try {
      // Si VITE_API_URL ya trae /api, esto pega a /api/token/refresh/
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/token/refresh/`, {
        refresh,
      });

      localStorage.setItem("access", res.data.access);

      if (res.data.refresh) {
        localStorage.setItem("refresh", res.data.refresh);
      }

      processQueue(null, res.data.access);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${res.data.access}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);