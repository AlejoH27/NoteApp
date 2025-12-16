import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({ baseURL:
  import.meta.env.VITE_API_URL,
 });

// ---- Helpers tokens
const getAccess = () => localStorage.getItem("access");
const getRefresh = () => localStorage.getItem("refresh");
const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
};
const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

// ---- Request: agrega Authorization
api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Response: si 401, intenta refresh 1 vez
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Si no hay config o ya reintentó, falla
    if (!original || original._retry) return Promise.reject(error);

    // Si es 401, intenta refresh
    if (error.response?.status === 401) {
      const refresh = getRefresh();
      if (!refresh) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Importante: usar axios "crudo" para no meter interceptor y crear loop
        const res = await axios.post(`${baseURL}/token/refresh/, { refresh }`);
        const newAccess = res.data.access;

        setTokens({ access: newAccess });
        processQueue(null, newAccess);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        processQueue(e, null);
        clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  async login(email, password) {
    const { data } = await api.post("/token/", { email, password });
    // SimpleJWT normalmente devuelve {access, refresh}
    setTokens(data);
    return data;
  },
  logout() {
    clearTokens();
  },
  isLoggedIn() {
    return !!getAccess();
  },
};