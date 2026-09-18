import { useState } from "react";
import { Copy } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import { duplicateOrder } from "../../api/orderApi";
import { useOperation } from "../../utils/useOperation";

function DuplicateOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [numOfOrders, setNumOfOrders] = useState("1");

  const op = useOperation(duplicateOrder, {
    type: "order",
    success: (res) => `Created ${res.count} copy of order`,
  });

  const submit = (e) => {
    e.preventDefault();
    op.run({
      orderId: Number(orderId),
      numOfOrders: Number(numOfOrders) || 1,
    });
  };

  return (
    <MainLayout
      title="Duplicate Order"
      subtitle="WooCommerce has no duplicate endpoint — the source order is read and re-posted"
    >
      <StoreBadge />

      <div
        className={`grid grid-cols-1 gap-5 ${
          op.error || op.result ? "xl:grid-cols-2" : "max-w-2xl"
        }`}
      >
        <div className="woo-card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="woo-label">Source order ID</label>
              <input
                className="woo-input"
                type="number"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="123"
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
                value={numOfOrders}
                onChange={(e) => setNumOfOrders(e.target.value)}
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Line items, shipping lines, fees, billing, shipping, status and
              payment fields are copied. Totals, dates and IDs are recalculated
              by WooCommerce.
            </p>

            <button
              type="submit"
              disabled={op.loading}
              className="woo-btn-primary w-full"
            >
              {op.loading ? <Spinner /> : <Copy size={16} />}
              {op.loading ? "Duplicating..." : "Duplicate order"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

          {op.result && (
            <>
              <div className="woo-card">
                <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">
                  {op.result.count} copies created
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                  from order #{op.result.source?.id} ({op.result.source?.status}
                  )
                </p>
                <ul className="space-y-2">
                  {op.result.data.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900"
                    >
                      <span className="text-gray-800 dark:text-slate-100">
                        #{o.id}
                      </span>
                      <span className="text-xs text-gray-400">
                        {o.currency} {o.total} · {o.status}
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

export default DuplicateOrderPage;
