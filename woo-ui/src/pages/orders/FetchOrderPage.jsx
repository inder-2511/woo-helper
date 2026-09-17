import { useState } from "react";
import { Search, StickyNote } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import { retrieveOrder, listOrderNotes } from "../../api/orderApi";
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

function FetchOrderPage() {
  const [orderId, setOrderId] = useState("");

  const fetchOp = useOperation(retrieveOrder, {
    type: "order",
    success: (res) => `Fetched order #${res.data?.id}`,
  });

  const notesOp = useOperation(listOrderNotes, {
    type: "order",
    success: (res) => `Loaded ${res.count} notes`,
  });

  const submit = (e) => {
    e.preventDefault();
    notesOp.reset();
    fetchOp.run(Number(orderId));
  };

  const order = fetchOp.result?.data;

  return (
    <MainLayout
      title="Fetch Order"
      subtitle="Inspect an order, its line items and its notes"
    >
      <StoreBadge />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="woo-card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="woo-label">Order ID</label>
              <input
                className="woo-input"
                type="number"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="123"
                required
              />
            </div>
            <button
              type="submit"
              disabled={fetchOp.loading}
              className="woo-btn-primary w-full"
            >
              {fetchOp.loading ? <Spinner /> : <Search size={16} />}
              Fetch order
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {fetchOp.error && (
            <ErrorBanner error={fetchOp.error} onDismiss={fetchOp.reset} />
          )}
          {notesOp.error && (
            <ErrorBanner error={notesOp.error} onDismiss={notesOp.reset} />
          )}

          {order && (
            <>
              <div className="woo-card">
                <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                  Order #{order.id}
                </h3>
                <Field label="Status" value={order.status} />
                <Field
                  label="Total"
                  value={`${order.currency} ${order.total}`}
                />
                <Field
                  label="Customer"
                  value={[order.billing?.first_name, order.billing?.last_name]
                    .filter(Boolean)
                    .join(" ")}
                />
                <Field label="Email" value={order.billing?.email} />
                <Field label="Payment" value={order.payment_method_title} />
                <Field label="Created" value={order.date_created} />
                <Field label="Customer note" value={order.customer_note} />

                <button
                  onClick={() => notesOp.run(order.id)}
                  disabled={notesOp.loading}
                  className="woo-btn-ghost mt-4"
                >
                  {notesOp.loading ? <Spinner /> : <StickyNote size={15} />}
                  Load notes
                </button>
              </div>

              {order.line_items?.length > 0 && (
                <div className="woo-card">
                  <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                    {order.line_items.length} line items
                  </h3>
                  <ul className="space-y-2">
                    {order.line_items.map((li) => (
                      <li
                        key={li.id}
                        className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900"
                      >
                        <span className="text-gray-800 dark:text-slate-100 truncate">
                          {li.name}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0 ml-3">
                          ×{li.quantity} · {li.total}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notesOp.result && (
                <div className="woo-card">
                  <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                    {notesOp.result.count} notes
                  </h3>
                  {notesOp.result.count === 0 ? (
                    <p className="text-sm text-gray-400">No notes yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {notesOp.result.data.map((n) => (
                        <li
                          key={n.id}
                          className="text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900"
                        >
                          <p className="text-gray-700 dark:text-slate-300">
                            {n.note}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {n.date_created}
                            {n.customer_note ? " · customer-visible" : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <JsonView data={order} defaultOpen />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default FetchOrderPage;
