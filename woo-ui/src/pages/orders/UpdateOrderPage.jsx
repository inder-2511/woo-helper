import { useState } from "react";
import { Save, StickyNote, Undo2 } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import { updateOrder, addOrderNote, refundOrder } from "../../api/orderApi";
import { useOperation } from "../../utils/useOperation";
import { ORDER_STATUSES, CURRENCIES } from "../../utils/orderConstants";

/**
 * Only the fields the user ticks are sent, so an update never clobbers
 * something they didn't mean to touch.
 */
const FIELDS = [
  { key: "status", label: "Status", type: "select", options: ORDER_STATUSES },
  { key: "currency", label: "Currency", type: "select", options: CURRENCIES },
  { key: "customer_note", label: "Customer note", type: "text" },
  { key: "payment_method", label: "Payment method", type: "text" },
  { key: "payment_method_title", label: "Payment method title", type: "text" },
  { key: "transaction_id", label: "Transaction ID", type: "text" },
];

const BILLING_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "address_1",
  "city",
  "state",
  "postcode",
  "country",
];

function UpdateOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [enabled, setEnabled] = useState({});
  const [values, setValues] = useState({ status: "completed", currency: "USD" });
  const [billingEnabled, setBillingEnabled] = useState({});
  const [billing, setBilling] = useState({});

  const [note, setNote] = useState("");
  const [customerNote, setCustomerNote] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const updateOp = useOperation(updateOrder, {
    type: "order",
    success: (res) => `Order #${res.data?.id} updated`,
  });

  const noteOp = useOperation(addOrderNote, {
    type: "order",
    success: () => "Note added",
  });

  const refundOp = useOperation(refundOrder, {
    type: "order",
    success: (res) => `Refunded ${res.data?.amount ?? ""}`,
  });

  const toggle = (k) => setEnabled((e) => ({ ...e, [k]: !e[k] }));
  const toggleBilling = (k) =>
    setBillingEnabled((e) => ({ ...e, [k]: !e[k] }));

  const buildUpdateDetails = () => {
    const details = {};
    for (const f of FIELDS) {
      if (enabled[f.key] && values[f.key] !== undefined) {
        details[f.key] = values[f.key];
      }
    }
    const billingPatch = {};
    for (const k of BILLING_FIELDS) {
      if (billingEnabled[k] && billing[k] !== undefined) {
        billingPatch[k] = billing[k];
      }
    }
    if (Object.keys(billingPatch).length) details.billing = billingPatch;
    return details;
  };

  const updateDetails = buildUpdateDetails();
  const nothingSelected = Object.keys(updateDetails).length === 0;

  const submit = (e) => {
    e.preventDefault();
    updateOp.run({ orderId: Number(orderId), updateDetails });
  };

  return (
    <MainLayout
      title="Update Order"
      subtitle="Tick only the fields you want to change — untouched fields are left alone"
    >
      <StoreBadge />

      <div
        className={`grid grid-cols-1 gap-5 ${
          updateOp.error ||
          noteOp.error ||
          refundOp.error ||
          !nothingSelected ||
          updateOp.result ||
          noteOp.result ||
          refundOp.result
            ? "xl:grid-cols-2"
            : "max-w-2xl"
        }`}
      >
        <div className="space-y-5">
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

              <div className="space-y-3 pt-2">
                {FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!enabled[f.key]}
                      onChange={() => toggle(f.key)}
                      className="w-4 h-4 accent-purple-600 shrink-0"
                    />
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 w-40 shrink-0">
                      {f.label}
                    </span>
                    {f.type === "select" ? (
                      <select
                        className="woo-input"
                        disabled={!enabled[f.key]}
                        value={values[f.key] ?? ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [f.key]: e.target.value }))
                        }
                      >
                        {f.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="woo-input"
                        disabled={!enabled[f.key]}
                        value={values[f.key] ?? ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [f.key]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-3">
                  Billing fields
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {BILLING_FIELDS.map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!billingEnabled[k]}
                        onChange={() => toggleBilling(k)}
                        className="w-4 h-4 accent-purple-600 shrink-0"
                      />
                      <input
                        className="woo-input"
                        placeholder={k}
                        disabled={!billingEnabled[k]}
                        value={billing[k] ?? ""}
                        onChange={(e) =>
                          setBilling((b) => ({ ...b, [k]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={updateOp.loading || nothingSelected}
                className="woo-btn-primary w-full"
              >
                {updateOp.loading ? <Spinner /> : <Save size={16} />}
                {nothingSelected ? "Tick a field to enable" : "Update order"}
              </button>
            </form>
          </div>

          <div className="woo-card">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
              Add a note
            </h3>
            <div className="space-y-3">
              <textarea
                className="woo-input min-h-[80px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Internal note text"
              />
              <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={customerNote}
                  onChange={(e) => setCustomerNote(e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
                Visible to customer
              </label>
              <button
                onClick={() =>
                  noteOp.run(Number(orderId), note, customerNote)
                }
                disabled={noteOp.loading || !orderId || !note.trim()}
                className="woo-btn-ghost w-full"
              >
                {noteOp.loading ? <Spinner /> : <StickyNote size={15} />}
                Add note
              </button>
            </div>
          </div>

          <div className="woo-card">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">
              Refund
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
              Leave the amount blank to refund the full order total. This
              records a refund in WooCommerce; it does not call the payment
              gateway.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="woo-input"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Amount (optional)"
                />
                <input
                  className="woo-input"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason (optional)"
                />
              </div>
              <button
                onClick={() =>
                  refundOp.run(Number(orderId), {
                    amount: refundAmount || undefined,
                    reason: refundReason || undefined,
                  })
                }
                disabled={refundOp.loading || !orderId}
                className="woo-btn-danger w-full"
              >
                {refundOp.loading ? <Spinner /> : <Undo2 size={15} />}
                Create refund
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {updateOp.error && (
            <ErrorBanner error={updateOp.error} onDismiss={updateOp.reset} />
          )}
          {noteOp.error && (
            <ErrorBanner error={noteOp.error} onDismiss={noteOp.reset} />
          )}
          {refundOp.error && (
            <ErrorBanner error={refundOp.error} onDismiss={refundOp.reset} />
          )}

          {!nothingSelected && (
            <JsonView
              data={updateDetails}
              label="Payload that will be sent"
              defaultOpen
            />
          )}

          {updateOp.result && (
            <JsonView data={updateOp.result.data} label="Updated order" />
          )}
          {noteOp.result && (
            <JsonView data={noteOp.result.data} label="Note created" />
          )}
          {refundOp.result && (
            <JsonView data={refundOp.result.data} label="Refund created" />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default UpdateOrderPage;
