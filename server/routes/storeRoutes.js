const express = require("express");
const router = express.Router();

const { resolveStore } = require("../middleware/resolveStore");
const { testConnectionService } = require("../../services/storeService");

router.post("/test-connection", resolveStore, async (req, res) => {
  try {
    const data = await testConnectionService(req.woo);
    res.json({
      success: true,
      storeUrl: req.storeUrl,
      usingRequestCredentials: req.usingRequestCredentials,
      ...data,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
});

module.exports = router;
