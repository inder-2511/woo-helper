const { orderData, normalizeFixedAddress } = require("../cli/data/orderData");
const { wooError } = require("./productService");

/**
 * Builds a single order payload from the Custom Order form: explicit line
 * items, addresses and settings instead of faker output. Throws a 400 Error
 * (not a Woo error) when the shape is unusable, so the route can tell "you
 * gave us garbage" apart from "Woo rejected this".
 */
function buildCustomOrderPayload(payload = {}) {
  const {
    status = "processing",
    currency,
    customerNote,
    paymentMethod,
    paymentMethodTitle,
    billing,
    shipping,
    shipToSameAsBilling,
    lineItems = [],
    shippingTitle,
    shippingTotal,
    couponCode,
  } = payload;

  const items = (lineItems || [])
    .filter((li) => li && li.productId)
    .map((li) => {
      const item = {
        product_id: Number(li.productId),
        quantity: Number(li.quantity) || 1,
      };
      if (li.variationId) item.variation_id = Number(li.variationId);
      // An explicit price overrides Woo's own price lookup for this line.
      if (li.price !== undefined && li.price !== "" && li.price !== null) {
        const lineTotal = String(
          (Number(li.price) || 0) * (Number(li.quantity) || 1),
        );
        item.subtotal = lineTotal;
        item.total = lineTotal;
      }
      return item;
    });

  if (!items.length) {
    const e = new Error("At least one line item with a product is required");
    e.status = 400;
    throw e;
  }

  const body = { status, line_items: items };

  if (currency) body.currency = currency;
  if (customerNote) body.customer_note = customerNote;
  if (paymentMethod) body.payment_method = paymentMethod;
  if (paymentMethodTitle) body.payment_method_title = paymentMethodTitle;

  const normalizedBilling = normalizeFixedAddress(billing, {
    includeContact: true,
  });
  if (normalizedBilling) body.billing = normalizedBilling;

  if (shipToSameAsBilling) {
    // Woo's shipping address has no email field — drop it rather than send
    // a property the schema doesn't define.
    if (normalizedBilling) {
      const { email, ...shippingFromBilling } = normalizedBilling;
      body.shipping = shippingFromBilling;
    }
  } else {
    const normalizedShipping = normalizeFixedAddress(shipping);
    if (normalizedShipping) body.shipping = normalizedShipping;
  }

  if (shippingTitle || shippingTotal) {
    body.shipping_lines = [
      {
        method_id: "flat_rate",
        method_title: shippingTitle || "Flat Rate",
        total:
          shippingTotal !== undefined && shippingTotal !== ""
            ? String(shippingTotal)
            : "0.00",
      },
    ];
  }

  if (couponCode) body.coupon_lines = [{ code: couponCode }];

  return body;
}

async function createCustomOrder(api, payload) {
  const body = buildCustomOrderPayload(payload);
  try {
    const response = await api.post("/orders", body);
    console.log(
      ` > > > Custom order created ✅ ID: ${response.data.id}, ${response.data.line_items?.length ?? 0} line items`,
    );
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to create custom order");
  }
}

async function createOrder(api, inputs, numOfOrders) {
  const results = [];
  for (let i = 0; i < numOfOrders; i++) {
    try {
      const response = await api.post("/orders", orderData(inputs));
      results.push(response.data);
      console.log(
        ` > > > Completed ✅ Order ${i + 1}/${numOfOrders} created. ID:`,
        response.data.id,
      );
    } catch (err) {
      throw wooError(err, "Failed to create order");
    }
  }
  return results;
}

async function updateOrderService(api, orderId, updateDetails) {
  try {
    const response = await api.put(`/orders/${orderId}`, updateDetails);
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to update order");
  }
}

async function retrieveOrderService(api, orderId) {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to retrieve order");
  }
}

async function listOrdersService(api, opts = {}) {
  const {
    page = 1,
    perPage = 20,
    status,
    search,
    orderby = "date",
    order = "desc",
  } = opts;

  try {
    const response = await api.get("/orders", {
      params: {
        page: Number(page) || 1,
        per_page: Math.min(Number(perPage) || 20, 100),
        ...(status && status !== "any" ? { status } : {}),
        ...(search ? { search } : {}),
        orderby,
        order,
      },
    });

    return {
      orders: response.data,
      page: Number(page) || 1,
      totalPages: Number(response.headers["x-wp-totalpages"]) || 1,
      total: Number(response.headers["x-wp-total"]) || response.data.length,
    };
  } catch (err) {
    throw wooError(err, "Failed to list orders");
  }
}

/**
 * Woo has no order-duplicate endpoint, so read the source order and
 * re-post the parts that are writable. IDs, totals and dates are
 * recalculated by Woo on create.
 */
async function duplicateOrderService(api, orderId, numOfOrders = 1) {
  let source;
  try {
    source = (await api.get(`/orders/${orderId}`)).data;
  } catch (err) {
    throw wooError(err, "Failed to read the order being duplicated");
  }

  const payload = {
    status: source.status,
    currency: source.currency,
    customer_id: source.customer_id,
    customer_note: source.customer_note,
    billing: source.billing,
    shipping: source.shipping,
    payment_method: source.payment_method,
    payment_method_title: source.payment_method_title,
    line_items: (source.line_items || []).map((li) => ({
      product_id: li.product_id,
      ...(li.variation_id ? { variation_id: li.variation_id } : {}),
      quantity: li.quantity,
    })),
    shipping_lines: (source.shipping_lines || []).map((sl) => ({
      method_id: sl.method_id,
      method_title: sl.method_title,
      total: sl.total,
    })),
    fee_lines: (source.fee_lines || []).map((fl) => ({
      name: fl.name,
      total: fl.total,
      tax_class: fl.tax_class,
      tax_status: fl.tax_status,
    })),
  };

  const created = [];
  try {
    for (let i = 0; i < numOfOrders; i++) {
      const response = await api.post("/orders", payload);
      created.push(response.data);
      console.log(
        ` > > > Duplicated order ${i + 1}/${numOfOrders} from #${orderId}. New ID: ${response.data.id}`,
      );
    }
    return { source, created };
  } catch (err) {
    throw wooError(err, "Failed to duplicate order");
  }
}

async function deleteOrderService(api, orderId, force = true) {
  try {
    const response = await api.delete(`/orders/${orderId}`, {
      params: { force: Boolean(force) },
    });
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to delete order");
  }
}

async function listOrderNotesService(api, orderId) {
  try {
    const response = await api.get(`/orders/${orderId}/notes`);
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to list order notes");
  }
}

async function addOrderNoteService(api, orderId, note, customerNote = false) {
  try {
    const response = await api.post(`/orders/${orderId}/notes`, {
      note,
      customer_note: Boolean(customerNote),
    });
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to add order note");
  }
}

/** Omit amount to refund the full order total. */
async function createRefundService(api, orderId, { amount, reason } = {}) {
  try {
    const response = await api.post(`/orders/${orderId}/refunds`, {
      ...(amount ? { amount: String(amount) } : {}),
      ...(reason ? { reason } : {}),
    });
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to create refund");
  }
}

module.exports = {
  createOrder,
  createCustomOrder,
  updateOrderService,
  retrieveOrderService,
  listOrdersService,
  duplicateOrderService,
  deleteOrderService,
  listOrderNotesService,
  addOrderNoteService,
  createRefundService,
};
