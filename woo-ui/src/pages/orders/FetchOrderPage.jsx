import { useState } from "react";
import { Search, StickyNote } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SplitLayout from "../../components/ui/SplitLayout";
import { retrieveOrder, listOrderNotes } from "../../api/orderApi";
import { useOperation } from "../../utils/useOperation";

function Row({ label, value }) {
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

      <SplitLayout
        sidebar={
          (fetchOp.error || notesOp.error || order) && (
            <>
              {fetchOp.error && (
                <ErrorBanner error={fetchOp.error} onDismiss={fetchOp.reset} />
              )}
              {notesOp.error && (
                <ErrorBanner error={notesOp.error} onDismiss={notesOp.reset} />
              )}

              {order && (
                <>
                  <Card>
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                      Order #{order.id}
                    </h3>
                    <Row label="Status" value={order.status} />
                    <Row
                      label="Total"
                      value={`${order.currency} ${order.total}`}
                    />
                    <Row
                      label="Customer"
                      value={[order.billing?.first_name, order.billing?.last_name]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <Row label="Email" value={order.billing?.email} />
                    <Row label="Payment" value={order.payment_method_title} />
                    <Row label="Created" value={order.date_created} />
                    <Row label="Customer note" value={order.customer_note} />

                    <Button
                      variant="ghost"
                      className="mt-4"
                      icon={StickyNote}
                      loading={notesOp.loading}
                      onClick={() => notesOp.run(order.id)}
                    >
                      Load notes
                    </Button>
                  </Card>

                  {order.line_items?.length > 0 && (
                    <Card title={`${order.line_items.length} line items`}>
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
                    </Card>
                  )}

                  {notesOp.result && (
                    <Card title={`${notesOp.result.count} notes`}>
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
                    </Card>
                  )}

                  <JsonView data={order} defaultOpen />
                </>
              )}
            </>
          )
        }
      >
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <FormField
              label="Order ID"
              type="number"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="123"
              required
            />
            <Button type="submit" fullWidth icon={Search} loading={fetchOp.loading}>
              Fetch order
            </Button>
          </form>
        </Card>
      </SplitLayout>
    </MainLayout>
  );
}

export default FetchOrderPage;
