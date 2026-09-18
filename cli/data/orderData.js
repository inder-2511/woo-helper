const { faker } = require("@faker-js/faker");

/**
 * A saved-address record has looser required fields than Woo's schema.
 * Returns a Woo-shaped address only when it has enough to be usable, else
 * null so the caller falls back to a generated one.
 */
function normalizeFixedAddress(addr, { includeContact = false } = {}) {
  if (!addr || typeof addr !== "object") return null;
  const required = ["address_1", "city", "country", "postcode"];
  if (!required.every((k) => addr[k] && String(addr[k]).trim())) return null;

  return {
    first_name: addr.first_name || "",
    last_name: addr.last_name || "",
    company: addr.company || undefined,
    address_1: addr.address_1,
    address_2: addr.address_2 || undefined,
    city: addr.city,
    state: addr.state || "",
    postcode: addr.postcode,
    country: addr.country,
    ...(includeContact && addr.email ? { email: addr.email } : {}),
    ...(includeContact && addr.phone ? { phone: addr.phone } : {}),
  };
}

/**
 * Builds one order payload for the bulk "Create Orders" flow.
 *
 * `inputs.address`, if it resolves to a usable address, is reused for every
 * order in the batch (the loop in orderService calls this fresh each time
 * with the same inputs) — useful for repeat-customer test scenarios.
 * Everything else keeps its previous faker-generated / hardcoded defaults
 * so existing CLI and API callers are unaffected.
 */
const orderData = (inputs = {}) => {
  const status = inputs.status || "processing";
  const country = inputs.country || "US";
  const shippingTitle = inputs.shippingTitle || "Flat Rate";
  const shippingTotal =
    inputs.shippingTotal !== undefined && inputs.shippingTotal !== ""
      ? String(inputs.shippingTotal)
      : "10.00";

  const makeAddress = () => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    address_1: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    postcode: faker.location.zipCode(),
    country,
  });

  const fixedBilling = normalizeFixedAddress(inputs.address, {
    includeContact: true,
  });
  const fixedShipping = normalizeFixedAddress(inputs.address);

  // `lineItems` (an array) is what the dashboard's multi-product bulk form
  // sends; the CLI and older callers still pass a single `product`/`qty`.
  const lineItems =
    Array.isArray(inputs.lineItems) && inputs.lineItems.length
      ? inputs.lineItems
          .filter((li) => li && li.product)
          .map((li) => ({
            product_id: parseInt(li.product),
            quantity: parseInt(li.qty) || 1,
          }))
      : [
          {
            product_id: parseInt(inputs.product),
            quantity: parseInt(inputs.qty),
          },
        ];

  return {
    status,
    shipping: fixedShipping || makeAddress(),
    billing: fixedBilling || makeAddress(),
    line_items: lineItems,
    shipping_lines: [
      {
        method_id: "flat_rate",
        method_title: shippingTitle,
        total: shippingTotal,
      },
    ],
  };
};

// const metaDataPropertiesHelper = {
//   id,
//   key,
//   value,
// };

// const orderLineItemsHelper = {
//   name,
//   product_id,
//   variation_id,
//   quantity,
//   tax_class,
//   subtotal,
//   total,
//   meta_data,
// };

// const taxLinespropertiesHelper = {
//   meta_data,
// };

// const shippingLinePropertiesHelper = {
//   method_title,
//   method_id,
//   total,
//   meta_data,
// };

// const feesLinesPropertiesHelper = {
//   name,
//   tax_class,
//   tax_status,
//   total,
//   meta_data,
// };

// const couponLinePropertiesHelper = {
//   code,
//   meta_data,
// };

// const updateOrder = {
//   parent_id,
//   status,
//   currency,
//   customer_id,
//   customer_note,
//   billing: {
//     first_name,
//     last_name,
//     company,
//     address_1,
//     address_2,
//     city,
//     state,
//     postcode,
//     country,
//     email,
//     phone,
//   },
//   shipping: {
//     first_name,
//     last_name,
//     company,
//     address_1,
//     address_2,
//     city,
//     state,
//     postcode,
//     country,
//   },
//   payment_method,
//   payment_method_title,
//   transaction_id,
//   meta_data,
//   line_items,
//   shipping_lines,
//   fee_lines,
//   coupon_lines,
// };

module.exports = { orderData, normalizeFixedAddress };
