const express = require("express");
const router = express.Router();

const { resolveStore } = require("../middleware/resolveStore");
const {
  createProduct,
  createVariableProduct,
  retrieveProductService,
  duplicateProductService,
  fetchAllProductsService,
  listProductsService,
  updateProductService,
  deleteProductService,
  batchDeleteProductsService,
  listCategoriesService,
  listVariationsService,
} = require("../../services/productService.js");

router.use(resolveStore);

const fail = (res, err) =>
  res.status(err.status || 500).json({ success: false, message: err.message });

router.get("/", async (req, res) => {
  try {
    const result = await listProductsService(req.woo, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    fail(res, err);
  }
});

router.get("/categories", async (req, res) => {
  try {
    const data = await listCategoriesService(req.woo);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get("/fetch-all-products", async (req, res) => {
  try {
    const products = await fetchAllProductsService(req.woo);
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    fail(res, err);
  }
});

router.get("/retrieve-product/:productId", async (req, res) => {
  try {
    const data = await retrieveProductService(req.woo, req.params.productId);
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.get("/:productId/variations", async (req, res) => {
  try {
    const data = await listVariationsService(req.woo, req.params.productId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/create-simple-product", async (req, res) => {
  try {
    const data = await createProduct(
      req.woo,
      req.body,
      Number(req.body.count) || 1,
    );
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/create-variable-product", async (req, res) => {
  try {
    const data = await createVariableProduct(
      req.woo,
      req.body,
      req.body,
      Number(req.body.count) || 1,
    );
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.post("/duplicate-product", async (req, res) => {
  try {
    const data = await duplicateProductService(
      req.woo,
      req.body.productId,
      Number(req.body.numOfProducts) || 1,
    );
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.put("/update-product", async (req, res) => {
  try {
    const { productId, updateDetails } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }
    const data = await updateProductService(req.woo, productId, updateDetails);
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

router.delete("/batch", async (req, res) => {
  try {
    const data = await batchDeleteProductsService(
      req.woo,
      req.body.productIds,
      req.body.force !== false,
    );
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    fail(res, err);
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const data = await deleteProductService(
      req.woo,
      req.params.productId,
      req.query.force !== "false",
    );
    res.json({ success: true, data });
  } catch (err) {
    fail(res, err);
  }
});

module.exports = router;
