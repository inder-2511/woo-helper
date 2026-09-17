const express = require("express");
const router = express.Router();

const { resolveStore } = require("../middleware/resolveStore");
const {
  createOrder,
  updateOrderService,
  retrieveOrderService,
  listOrdersService,
  duplicateOrderService,
  deleteOrderService,
  listOrderNotesService,
  addOrderNoteService,
  createRefundService,
} = require("../../services/orderService");

router.use(resolveStore);

const fail = (res, err) =>
  res.status(err.status || 500).json({ success: false, message: err.message });

router.get("/", async (req, res) => {
  try {
    const result = await listOrdersService(req.woo, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    fail(res, err);
  }
});

router.get("/retrieve-order/:orderId", async (req, res) => {
  try {
    const data = await retrieveOrderService(req.woo, req.params.orderId);
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get("/:orderId/notes", async (req, res) => {
  try {
    const data = await listOrderNotesService(req.woo, req.params.orderId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/create-order", async (req, res) => {
  try {
    const data = await createOrder(
      req.woo,
      req.body,
      Number(req.body.count) || 1,
    );
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/duplicate-order", async (req, res) => {
  try {
    const { orderId, numOfOrders } = req.body;
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId is required" });
    }
    const { source, created } = await duplicateOrderService(
      req.woo,
      orderId,
      Number(numOfOrders) || 1,
    );
    res.json({ success: true, count: created.length, source, data: created });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/:orderId/notes", async (req, res) => {
  try {
    const { note, customerNote } = req.body;
    if (!note) {
      return res
        .status(400)
        .json({ success: false, message: "note is required" });
    }
    const data = await addOrderNoteService(
      req.woo,
      req.params.orderId,
      note,
      customerNote,
    );
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/:orderId/refund", async (req, res) => {
  try {
    const data = await createRefundService(req.woo, req.params.orderId, {
      amount: req.body.amount,
      reason: req.body.reason,
    });
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.put("/update-order", async (req, res) => {
  try {
    const { orderId, updateDetails } = req.body;
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId is required" });
    }
    const data = await updateOrderService(req.woo, orderId, updateDetails);
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.delete("/:orderId", async (req, res) => {
  try {
    const data = await deleteOrderService(
      req.woo,
      req.params.orderId,
      req.query.force !== "false",
    );
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

module.exports = router;
