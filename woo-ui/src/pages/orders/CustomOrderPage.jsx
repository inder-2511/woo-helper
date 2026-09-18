import { useState } from "react";
import { Plus, Trash2, Sliders } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import ProductPicker from "../../components/common/ProductPicker";
import AddressPicker from "../../components/common/AddressPicker";
import { createCustomOrder } from "../../api/orderApi";
import { useOperation } from "../../utils/useOperation";
import { ORDER_STATUSES, CURRENCIES } from "../../utils/orderConstants";

const emptyLineItem = () => ({
  key: `li_${Date.now()}_${Math.random()}`,
  productId: "",
  name: "",
  quantity: "1",
  price: "",
});

const emptyAddress = { country: "US" };

function CustomOrderPage() {
  const [lineItems, setLineItems] = useState([emptyLineItem()]);
  const [status, setStatus] = useState("processing");
  const [currency, setCurrency] = useState("USD");
  const [billing, setBilling] = useState(emptyAddress);
  const [shipToSameAsBilling, setShipToSameAsBilling] = useState(true);
  const [shipping, setShipping] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethodTitle, setPaymentMethodTitle] = useState("");
  const [shippingTitle, setShippingTitle] = useState("Flat Rate");
  const [shippingTotal, setShippingTotal] = useState("10.00");
  const [couponCode, setCouponCode] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const op = useOperation(createCustomOrder, {
    type: "order",
    success: (res) => `Created order #${res.data?.id}`,
  });

  const updateLineItem = (key, patch) =>
    setLineItems((items) =>
      items.map((li) => (li.key === key ? { ...li, ...patch } : li)),
    );

  const addLineItem = () =>
    setLineItems((items) => [...items, emptyLineItem()]);

  const removeLineItem = (key) =>
    setLineItems((items) =>
      items.length > 1 ? items.filter((li) => li.key !== key) : items,
    );

  const validItems = lineItems.filter((li) => li.productId);

  const submit = (e) => {
    e.preventDefault();
    op.run({
      status,
      currency,
      billing,
      shipping,
      shipToSameAsBilling,
      lineItems: validItems.map((li) => ({
        productId: li.productId,
        quantity: Number(li.quantity) || 1,
        price: li.price || undefined,
      })),
      paymentMethod: paymentMethod || undefined,
      paymentMethodTitle: paymentMethodTitle || undefined,
      shippingTitle: shippingTitle || undefined,
      shippingTotal: shippingTotal || undefined,
      couponCode: couponCode || undefined,
      customerNote: customerNote || undefined,
    });
  };

  return (
    <MainLayout
      title="Custom Order"
      subtitle="Build one order with exact line items, addresses and settings — nothing generated"
    >
      <StoreBadge />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <form onSubmit={submit} className="space-y-5">
          <div className="woo-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-slate-100">
                Line items
              </h3>
              <button
                type="button"
                onClick={addLineItem}
                className="woo-btn-ghost px-3 py-1.5 text-xs"
              >
                <Plus size={13} />
                Add item
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((li) => (
                <div
                  key={li.key}
                  className="rounded-xl border border-gray-100 dark:border-slate-700 p-3 space-y-2"
                >
                  <ProductPicker
                    value={li}
                    onChange={(patch) => updateLineItem(li.key, patch)}
                  />
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                    <div>
                      <label className="woo-label">Quantity</label>
                      <input
                        className="woo-input"
                        type="number"
                        min="1"
                        value={li.quantity}
                        onChange={(e) =>
                          updateLineItem(li.key, { quantity: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="woo-label">
                        Price override (optional)
                      </label>
                      <input
                        className="woo-input"
                        value={li.price}
                        onChange={(e) =>
                          updateLineItem(li.key, { price: e.target.value })
                        }
                        placeholder="uses product price"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(li.key)}
                      disabled={lineItems.length === 1}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-30 pb-2.5"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="woo-card">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">
              Order settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="woo-label">Status</label>
                <select
                  className="woo-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="woo-label">Currency</label>
                <select
                  className="woo-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="woo-label">Payment method key</label>
                <input
                  className="woo-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="bacs"
                />
              </div>
              <div>
                <label className="woo-label">Payment method title</label>
                <input
                  className="woo-input"
                  value={paymentMethodTitle}
                  onChange={(e) => setPaymentMethodTitle(e.target.value)}
                  placeholder="Direct bank transfer"
                />
              </div>
              <div>
                <label className="woo-label">Shipping method title</label>
                <input
                  className="woo-input"
                  value={shippingTitle}
                  onChange={(e) => setShippingTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="woo-label">Shipping total</label>
                <input
                  className="woo-input"
                  value={shippingTotal}
                  onChange={(e) => setShippingTotal(e.target.value)}
                />
              </div>
              <div>
                <label className="woo-label">Coupon code (optional)</label>
                <input
                  className="woo-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="SAVE10"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="woo-label">Customer note</label>
              <textarea
                className="woo-input min-h-[70px]"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
              />
            </div>
          </div>

          <div className="woo-card">
            <AddressPicker
              label="Billing address"
              value={billing}
              onChange={setBilling}
            />

            <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-4">
              <input
                type="checkbox"
                checked={shipToSameAsBilling}
                onChange={(e) => setShipToSameAsBilling(e.target.checked)}
                className="w-4 h-4 accent-purple-600"
              />
              Ship to the same address
            </label>

            {!shipToSameAsBilling && (
              <div className="mt-4">
                <AddressPicker
                  label="Shipping address"
                  value={shipping}
                  onChange={setShipping}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={op.loading || validItems.length === 0}
            className="woo-btn-primary w-full"
          >
            {op.loading ? <Spinner /> : <Sliders size={16} />}
            {validItems.length === 0
              ? "Add a product to enable"
              : "Create custom order"}
          </button>
        </form>

        <div className="space-y-4">
          {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

          {op.result && (
            <div className="woo-card">
              <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">
                Order #{op.result.data.id} created
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                {op.result.data.currency} {op.result.data.total} ·{" "}
                {op.result.data.status}
              </p>
            </div>
          )}

          {op.result && (
            <JsonView data={op.result.data} label="Created order" defaultOpen />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default CustomOrderPage;
