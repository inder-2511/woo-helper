import { useState } from "react";
import { Copy } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import { duplicateProducts } from "../../api/productApi";
import { useOperation } from "../../utils/useOperation";

function DuplicateProductPage() {
  const [productId, setProductId] = useState("");
  const [numOfProducts, setNumOfProducts] = useState("1");

  const op = useOperation(duplicateProducts, {
    type: "product",
    success: (res) => `Duplicated into ${res.count} new product(s)`,
  });

  const submit = (e) => {
    e.preventDefault();
    op.run({
      productId: Number(productId),
      numOfProducts: Number(numOfProducts) || 1,
    });
  };

  return (
    <MainLayout
      title="Duplicate Product"
      subtitle="Copies are published automatically — WooCommerce creates them as drafts"
    >
      <StoreBadge />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="woo-card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="woo-label">Source product ID</label>
              <input
                className="woo-input"
                type="number"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="119"
                required
              />
            </div>

            <div>
              <label className="woo-label">How many copies</label>
              <input
                className="woo-input"
                type="number"
                min="1"
                max="50"
                value={numOfProducts}
                onChange={(e) => setNumOfProducts(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={op.loading}
              className="woo-btn-primary w-full"
            >
              {op.loading ? <Spinner /> : <Copy size={16} />}
              {op.loading ? "Duplicating..." : "Duplicate"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

          {op.result && (
            <>
              <div className="woo-card">
                <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                  {op.result.count} copies created
                </h3>
                <ul className="space-y-2">
                  {op.result.data.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900"
                    >
                      <span className="text-gray-800 dark:text-slate-100 truncate">
                        {p.name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-3">
                        #{p.id} · {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <JsonView data={op.result.data} />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default DuplicateProductPage;
