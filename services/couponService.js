const { getCouponData } = require("../cli/data/couponData");
const { wooError } = require("./productService");

async function createCoupons(api, inputs = {}, numOfCoupons = 1) {
  const results = [];
  for (let i = 0; i < numOfCoupons; i++) {
    try {
      const response = await api.post("/coupons", getCouponData(inputs));
      results.push(response.data);
      console.log(
        ` > > > Coupon ${i + 1}/${numOfCoupons} created. Code: ${response.data.code}`,
      );
    } catch (err) {
      throw wooError(err, "Failed to create coupon");
    }
  }
  return results;
}

async function listCouponsService(api, opts = {}) {
  const { page = 1, perPage = 20, search } = opts;
  try {
    const response = await api.get("/coupons", {
      params: {
        page: Number(page) || 1,
        per_page: Math.min(Number(perPage) || 20, 100),
        ...(search ? { search } : {}),
      },
    });
    return {
      coupons: response.data,
      page: Number(page) || 1,
      totalPages: Number(response.headers["x-wp-totalpages"]) || 1,
      total: Number(response.headers["x-wp-total"]) || response.data.length,
    };
  } catch (err) {
    throw wooError(err, "Failed to list coupons");
  }
}

async function deleteCouponService(api, couponId) {
  try {
    const response = await api.delete(`/coupons/${couponId}`, {
      params: { force: true },
    });
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to delete coupon");
  }
}

module.exports = { createCoupons, listCouponsService, deleteCouponService };
