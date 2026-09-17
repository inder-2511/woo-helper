const { faker } = require("@faker-js/faker");

/**
 * discountType: "percent" | "fixed_cart" | "fixed_product"
 */
const getCouponData = ({ discountType = "percent", amount = "10" } = {}) => ({
  code: `${faker.word.adjective()}-${faker.string.alphanumeric(6)}`.toLowerCase(),
  discount_type: discountType,
  amount: String(amount),
  description: faker.commerce.productDescription(),
  individual_use: false,
  usage_limit: 100,
  free_shipping: false,
});

module.exports = { getCouponData };
