import api from "./axios";

export const listProducts = (params) =>
  api.get("/products", { params }).then((r) => r.data);

export const fetchAllProducts = () =>
  api.get("/products/fetch-all-products").then((r) => r.data);

export const retrieveProduct = (productId) =>
  api.get(`/products/retrieve-product/${productId}`).then((r) => r.data);

export const listVariations = (productId) =>
  api.get(`/products/${productId}/variations`).then((r) => r.data);

export const listCategories = () =>
  api.get("/products/categories").then((r) => r.data);

export const createSimpleProduct = (data) =>
  api.post("/products/create-simple-product", data).then((r) => r.data);

export const createVariableProduct = (data) =>
  api.post("/products/create-variable-product", data).then((r) => r.data);

export const duplicateProducts = (data) =>
  api.post("/products/duplicate-product", data).then((r) => r.data);

export const updateProduct = (productId, updateDetails) =>
  api
    .put("/products/update-product", { productId, updateDetails })
    .then((r) => r.data);

export const deleteProduct = (productId) =>
  api.delete(`/products/${productId}`).then((r) => r.data);

export const batchDeleteProducts = (productIds) =>
  api.delete("/products/batch", { data: { productIds } }).then((r) => r.data);
