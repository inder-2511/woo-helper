const { getCustomerData } = require("../cli/data/customerData");
const { wooError } = require("./productService");

async function createCustomers(api, numOfCustomers = 1) {
  const results = [];
  for (let i = 0; i < numOfCustomers; i++) {
    try {
      const response = await api.post("/customers", getCustomerData());
      results.push(response.data);
      console.log(
        ` > > > Customer ${i + 1}/${numOfCustomers} created. ID: ${response.data.id}, Email: ${response.data.email}`,
      );
    } catch (err) {
      throw wooError(err, "Failed to create customer");
    }
  }
  return results;
}

async function listCustomersService(api, opts = {}) {
  const { page = 1, perPage = 20, search } = opts;
  try {
    const response = await api.get("/customers", {
      params: {
        page: Number(page) || 1,
        per_page: Math.min(Number(perPage) || 20, 100),
        ...(search ? { search } : {}),
      },
    });
    return {
      customers: response.data,
      page: Number(page) || 1,
      totalPages: Number(response.headers["x-wp-totalpages"]) || 1,
      total: Number(response.headers["x-wp-total"]) || response.data.length,
    };
  } catch (err) {
    throw wooError(err, "Failed to list customers");
  }
}

async function retrieveCustomerService(api, customerId) {
  try {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to retrieve customer");
  }
}

async function deleteCustomerService(api, customerId) {
  try {
    // Woo requires force=true for customers — they cannot be trashed.
    const response = await api.delete(`/customers/${customerId}`, {
      params: { force: true },
    });
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to delete customer");
  }
}

module.exports = {
  createCustomers,
  listCustomersService,
  retrieveCustomerService,
  deleteCustomerService,
};
