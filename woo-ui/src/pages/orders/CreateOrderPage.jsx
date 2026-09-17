import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import { createOrder } from "../../api/orderApi";
import { useOperation } from "../../utils/useOperation";

function CreateOrderPage() {
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState("1");
  const [count, setCount] = useState("1");

  const op = useOperation(createOrder, {
    type: "order",
    success: (res) => `Created ${res.count} order${res.count === 1 ? "" : "s"}`,
  });

  const submit = (e) => {
    e.preventDefault();
    op.run({
      product: Number(product),
      qty: Number(qty) || 1,
      count: Number(count) || 1,
    });
  };

  return (
    <MainLayout
      title="Create Orders"
      subtitle="Billing and shipping addresses are generated per order"
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
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="119"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="woo-label">Quantity per order</label>
                <input
                  className="woo-input"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <div>
                <label className="woo-label">How many orders</label>
                <input
                  className="woo-input"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={op.loading}
              className="woo-btn-primary w-full"
            >
              {op.loading ? <Spinner /> : <ShoppingBag size={16} />}
              {op.loading ? "Creating..." : "Create orders"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

          {op.result && (
            <>
              <div className="woo-card">
                <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                  Created {op.result.count}
                </h3>
                <ul className="space-y-2">
                  {op.result.data.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900"
                    >
                      <span className="text-gray-800 dark:text-slate-100">
                        #{o.id} —{" "}
                        {[o.billing?.first_name, o.billing?.last_name]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-3">
                        {o.currency} {o.total}
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

export default CreateOrderPage;
