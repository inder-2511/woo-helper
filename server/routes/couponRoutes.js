const express = require("express");
const router = express.Router();

const { resolveStore } = require("../middleware/resolveStore");
const {
  createCoupons,
  listCouponsService,
  deleteCouponService,
} = require("../../services/couponService");

router.use(resolveStore);

const fail = (res, err) =>
  res.status(err.status || 500).json({ success: false, message: err.message });

router.get("/", async (req, res) => {
  try {
    const result = await listCouponsService(req.woo, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/create-coupon", async (req, res) => {
  try {
    const data = await createCoupons(
      req.woo,
      { discountType: req.body.discountType, amount: req.body.amount },
      Number(req.body.count) || 1,
    );
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.delete("/:couponId", async (req, res) => {
  try {
    const data = await deleteCouponService(req.woo, req.params.couponId);
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

module.exports = router;
