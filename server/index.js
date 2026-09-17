const express = require("express");
const cors = require("cors");
require("dotenv").config();

const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");

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
  }),
);
app.use(express.json());

//Routes
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);

//Test Route
app.get("/", (req, res) => {
  res.send("Api running ...");
});

//Health Route
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    storeConfigured: Boolean(
      process.env.BASE_URL &&
        process.env.CONSUMER_KEY &&
        process.env.CONSUMER_SECRET,
    ),
    version: process.env.version || null,
  });
});

//Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
