const { wooError } = require("./productService");

/**
 * Cheapest authenticated call we can make — confirms the URL resolves,
 * the keys are valid and the REST API is reachable.
 */
async function testConnectionService(api) {
  try {
    const response = await api.get("/products", { params: { per_page: 1 } });
    return {
      reachable: true,
      productCount: Number(response.headers["x-wp-total"]) || 0,
    };
  } catch (err) {
    throw wooError(err, "Could not reach the store");
  }
}

module.exports = { testConnectionService };
