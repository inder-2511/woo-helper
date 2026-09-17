const {
  getSimpleProductData,
  getVariableProductData,
  getVariantData,
} = require("../cli/data/productData");

/** Turn an axios/Woo failure into an Error carrying the HTTP status. */
function wooError(err, fallback) {
  const e = new Error(
    err.response?.data?.message || err.message || fallback || "Request failed",
  );
  e.status = err.response?.status || 500;
  e.data = err.response?.data;
  return e;
}

async function createProduct(api, simpleProductInput, numOfProducts) {
  const productResults = [];

  for (let i = 0; i < numOfProducts; i++) {
    const payload = getSimpleProductData(simpleProductInput);
    try {
      const response = await api.post("/products", payload);
      productResults.push(response.data);
      console.log(
        ` > > > ${i + 1}. Simple Product Created... ✅   ➡️  ID: ${response.data.id}  ➡️  Name: ${response.data.name}`,
      );
    } catch (err) {
      throw wooError(err, "Failed to create product");
    }
  }
  return productResults;
}

async function createVariableProduct(
  api,
  variableInput,
  variantInput,
  numOfProducts,
) {
  const result = [];
  for (let i = 0; i < numOfProducts; i++) {
    try {
      const variableRes = await api.post(
        "/products",
        getVariableProductData(variableInput),
      );
      result.push(variableRes.data);
      console.log(
        ` > > > ${i + 1}. Variable Product Created...👍   ➡️  ID: ${variableRes.data.id}  ➡️  Name: ${variableRes.data.name}`,
      );

      const variantRes = await api.post(
        `/products/${variableRes.data.id}/variations`,
        getVariantData(variantInput),
      );
      console.log(`          Variant created, ID: ${variantRes.data.id}`);
    } catch (err) {
      throw wooError(err, "Failed to create variable product");
    }
  }
  return result;
}

async function retrieveProductService(api, productId) {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to retrieve product");
  }
}

async function duplicateProductService(api, productId, numOfProducts) {
  const res = [];
  try {
    for (let i = 0; i < numOfProducts; i++) {
      const result = await api.post(`/products/${productId}/duplicate`, {});
      // A duplicate lands as a draft; publish the copy (not the source).
      const published = await api.put(`/products/${result.data.id}`, {
        status: "publish",
      });
      res.push(published.data);
      console.log(
        ` > > > Duplicated ${i + 1}/${numOfProducts}. ID: ${published.data.id}, Name: ${published.data.name}`,
      );
    }
    return res;
  } catch (err) {
    throw wooError(err, "Failed to duplicate product");
  }
}

async function fetchAllProductsService(api) {
  let page = 1;
  let totalPages = 1;
  let allProducts = [];

  try {
    while (page <= totalPages) {
      const response = await api.get("/products", {
        params: { per_page: 100, page },
      });
      totalPages = Number(response.headers["x-wp-totalpages"]) || 1;
      allProducts = [...allProducts, ...response.data];
      page++;
    }
    return allProducts;
  } catch (err) {
    throw wooError(err, "Failed to fetch products");
  }
}

/** One page of products, with optional search / status / order filters. */
async function listProductsService(api, opts = {}) {
  const {
    page = 1,
    perPage = 20,
    search,
    status,
    type,
    orderby = "date",
    order = "desc",
  } = opts;

  try {
    const response = await api.get("/products", {
      params: {
        page: Number(page) || 1,
        per_page: Math.min(Number(perPage) || 20, 100),
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        orderby,
        order,
      },
    });

    return {
      products: response.data,
      page: Number(page) || 1,
      totalPages: Number(response.headers["x-wp-totalpages"]) || 1,
      total: Number(response.headers["x-wp-total"]) || response.data.length,
    };
  } catch (err) {
    throw wooError(err, "Failed to list products");
  }
}

async function updateProductService(api, productId, updateDetails) {
  try {
    const response = await api.put(`/products/${productId}`, updateDetails);
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to update product");
  }
}

/** force=true skips the trash and deletes permanently. */
async function deleteProductService(api, productId, force = true) {
  try {
    const response = await api.delete(`/products/${productId}`, {
      params: { force: Boolean(force) },
    });
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to delete product");
  }
}

/** Woo caps batch operations at 100 items per call. */
async function batchDeleteProductsService(api, productIds, force = true) {
  const ids = (productIds || []).map(Number).filter(Boolean);
  if (!ids.length) {
    const e = new Error("No product IDs provided");
    e.status = 400;
    throw e;
  }

  const deleted = [];
  try {
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      const response = await api.post(
        "/products/batch",
        { delete: chunk },
        { params: { force: Boolean(force) } },
      );
      deleted.push(...(response.data.delete || []));
    }
    return deleted;
  } catch (err) {
    throw wooError(err, "Failed to batch delete products");
  }
}

async function listCategoriesService(api) {
  try {
    const response = await api.get("/products/categories", {
      params: { per_page: 100 },
    });
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to list categories");
  }
}

async function listVariationsService(api, productId) {
  try {
    const response = await api.get(`/products/${productId}/variations`, {
      params: { per_page: 100 },
    });
    return response.data;
  } catch (err) {
    throw wooError(err, "Failed to list variations");
  }
}

module.exports = {
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
  wooError,
};
