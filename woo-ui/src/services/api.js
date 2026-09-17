import axios from "axios";

// Locally VITE_API_URL is unset and we fall back to the dev server.
// On Vercel, set VITE_API_URL to the Render service URL.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const createOrder = (data) => API.post("/orders/create-order", data);

export const createSimpleProduct = (data) =>
  API.post("/products/create-simple-product", data);

export const createVariableProduct = (data) =>
  API.post("/products/create-variable-product", data);

export const retrieveProduct = (data) =>
  API.get(`/products/retrieve-product/${data.productId}`);

export const fetchAllProducts = () => API.get("/products/fetch-all-products");

export const duplicateProducts = (data) =>
  API.post(`/products/duplicate-product`, data);

export const updateOrder = (data) => API.put(`/orders/update-order`, data);

export const getHealth = () => API.get("/health");
