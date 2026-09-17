import api from "./axios";

export const listCoupons = (params) =>
  api.get("/coupons", { params }).then((r) => r.data);

export const createCoupons = (data) =>
  api.post("/coupons/create-coupon", data).then((r) => r.data);

export const deleteCoupon = (couponId) =>
  api.delete(`/coupons/${couponId}`).then((r) => r.data);
