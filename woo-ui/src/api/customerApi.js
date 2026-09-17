import api from "./axios";

export const listCustomers = (params) =>
  api.get("/customers", { params }).then((r) => r.data);

export const createCustomers = (count) =>
  api.post("/customers/create-customer", { count }).then((r) => r.data);

export const deleteCustomer = (customerId) =>
  api.delete(`/customers/${customerId}`).then((r) => r.data);
