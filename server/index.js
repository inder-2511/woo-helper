const express = require("express");
const cors = require("cors");
require("dotenv").config();

const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const couponRoutes = require("./routes/couponRoutes");
const storeRoutes = require("./routes/storeRoutes");
const { hasEnvCredentials } = require("../utils/wooClient");

const app = express();

// Comma-separated list of allowed frontend origins.
// Leave FRONTEND_ORIGIN unset locally to allow any origin.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

//Middleware
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-woo-url",
      "x-woo-key",
      "x-woo-secret",
    ],
  }),
);
app.use(express.json());

//Routes
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/coupons", couponRoutes);
app.use("/store", storeRoutes);

//Test Route
app.get("/", (req, res) => {
  res.send("Api running ...");
});

//Health Route
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    storeConfigured: hasEnvCredentials(),
    requiresStoreCredentials:
      process.env.REQUIRE_STORE_CREDENTIALS === "true",
    version: process.env.version || null,
  });
});

//Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
