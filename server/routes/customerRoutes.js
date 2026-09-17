const express = require("express");
const router = express.Router();

const { resolveStore } = require("../middleware/resolveStore");
const {
  createCustomers,
  listCustomersService,
  retrieveCustomerService,
  deleteCustomerService,
} = require("../../services/customerService");

router.use(resolveStore);

const fail = (res, err) =>
  res.status(err.status || 500).json({ success: false, message: err.message });

router.get("/", async (req, res) => {
  try {
    const result = await listCustomersService(req.woo, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    fail(res, err);
  }
});

router.get("/:customerId", async (req, res) => {
  try {
    const data = await retrieveCustomerService(req.woo, req.params.customerId);
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/create-customer", async (req, res) => {
  try {
    const data = await createCustomers(req.woo, Number(req.body.count) || 1);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.delete("/:customerId", async (req, res) => {
  try {
    const data = await deleteCustomerService(req.woo, req.params.customerId);
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

module.exports = router;
