import { useState } from "react";
import { Search, Layers } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import { retrieveProduct, listVariations } from "../../api/productApi";
import { useOperation } from "../../utils/useOperation";

function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 dark:border-slate-700/60 last:border-0">
      <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">
        {label}
      </span>
      <span className="text-xs font-medium text-gray-800 dark:text-slate-200 text-right break-words">
        {value === null || value === undefined || value === "" ? "—" : value}
      </span>
    </div>
  );
}

function FetchProductPage() {
  const [productId, setProductId] = useState("");

  const fetchOp = useOperation(retrieveProduct, {
    type: "product",
    success: (res) => `Fetched "${res.data?.name}"`,
  });

  const variationsOp = useOperation(listVariations, {
    type: "product",
    success: (res) => `Loaded ${res.count} variations`,
  });

  const submit = (e) => {
    e.preventDefault();
    variationsOp.reset();
    fetchOp.run(Number(productId));
  };

  const product = fetchOp.result?.data;

  return (
    <MainLayout
      title="Fetch Product"
      subtitle="Look up a single product and inspect its raw payload"
    >
      <StoreBadge />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="woo-card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="woo-label">Product ID</label>
              <input
                className="woo-input"
                type="number"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="119"
                required
              />
            </div>
            <button
              type="submit"
              disabled={fetchOp.loading}
              className="woo-btn-primary w-full"
            >
              {fetchOp.loading ? <Spinner /> : <Search size={16} />}
              Fetch product
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {fetchOp.error && (
            <ErrorBanner error={fetchOp.error} onDismiss={fetchOp.reset} />
          )}
          {variationsOp.error && (
            <ErrorBanner
              error={variationsOp.error}
              onDismiss={variationsOp.reset}
            />
          )}

          {product && (
            <>
              <div className="woo-card">
                <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                  {product.name}
                </h3>
                <Field label="ID" value={product.id} />
                <Field label="Type" value={product.type} />
                <Field label="Status" value={product.status} />
                <Field label="SKU" value={product.sku} />
                <Field label="Price" value={product.price} />
                <Field label="Regular price" value={product.regular_price} />
                <Field label="Stock" value={product.stock_quantity} />
                <Field label="Weight" value={product.weight} />
                <Field
                  label="Dimensions"
                  value={
                    product.dimensions
                      ? `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height}`
                      : "—"
                  }
                />
                <Field label="Permalink" value={product.permalink} />

                {product.type === "variable" && (
                  <button
                    onClick={() => variationsOp.run(product.id)}
                    disabled={variationsOp.loading}
                    className="woo-btn-ghost mt-4"
                  >
                    {variationsOp.loading ? (
                      <Spinner />
                    ) : (
                      <Layers size={15} />
                    )}
                    Load variations
                  </button>
                )}
              </div>

              {variationsOp.result && (
                <div className="woo-card">
                  <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                    {variationsOp.result.count} variations
                  </h3>
                  <ul className="space-y-1.5">
                    {variationsOp.result.data.map((v) => (
                      <li
                        key={v.id}
                        className="text-sm text-gray-600 dark:text-slate-300"
                      >
                        #{v.id} — {v.price}{" "}
                        <span className="text-xs text-gray-400">
                          {(v.attributes ?? [])
                            .map((a) => `${a.name}: ${a.option}`)
                            .join(", ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <JsonView data={product} defaultOpen />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default FetchProductPage;
