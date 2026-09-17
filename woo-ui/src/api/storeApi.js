import api from "./axios";

export const getHealth = () => api.get("/health").then((r) => r.data);

export const testConnection = () =>
  api.post("/store/test-connection").then((r) => r.data);
