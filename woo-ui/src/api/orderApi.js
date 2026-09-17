import api from "./axios";

export const listOrders = (params) =>
  api.get("/orders", { params }).then((r) => r.data);

export const retrieveOrder = (orderId) =>
  api.get(`/orders/retrieve-order/${orderId}`).then((r) => r.data);

export const createOrder = (data) =>
  api.post("/orders/create-order", data).then((r) => r.data);

export const duplicateOrder = (data) =>
  api.post("/orders/duplicate-order", data).then((r) => r.data);

export const updateOrder = (data) =>
  api.put("/orders/update-order", data).then((r) => r.data);

export const deleteOrder = (orderId) =>
  api.delete(`/orders/${orderId}`).then((r) => r.data);

export const listOrderNotes = (orderId) =>
  api.get(`/orders/${orderId}/notes`).then((r) => r.data);

export const addOrderNote = (orderId, note, customerNote = false) =>
  api.post(`/orders/${orderId}/notes`, { note, customerNote }).then((r) => r.data);

export const refundOrder = (orderId, { amount, reason } = {}) =>
  api.post(`/orders/${orderId}/refund`, { amount, reason }).then((r) => r.data);
