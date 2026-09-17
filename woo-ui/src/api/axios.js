import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_BASE_URL });

/**
 * The active store's credentials travel as headers on every request so the
 * backend never has to hold them. Kept in module scope (not React state) so
 * the axios interceptor can read them without a re-render.
 */
let activeStore = { baseUrl: "", key: "", secret: "" };

export const setActiveStore = (store) => {
  activeStore = {
    baseUrl: store?.baseUrl ?? "",
    key: store?.key ?? "",
    secret: store?.secret ?? "",
  };
};

export const getActiveStore = () => ({ ...activeStore });

api.interceptors.request.use((config) => {
  const { baseUrl, key, secret } = activeStore;
  // All three or none — a partial set would make the backend fall back to
  // its own .env, which is confusing when the user meant a different store.
  if (baseUrl && key && secret) {
    config.headers["x-woo-url"] = baseUrl;
    config.headers["x-woo-key"] = key;
    config.headers["x-woo-secret"] = secret;
  }
  return config;
});

export default api;
