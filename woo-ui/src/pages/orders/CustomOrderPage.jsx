import { useState } from "react";
import { Plus, Trash2, Sliders } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import ProductPicker from "../../components/common/ProductPicker";
import AddressPicker from "../../components/common/AddressPicker";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SplitLayout from "../../components/ui/SplitLayout";
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

      <SplitLayout
        sidebar={
          (op.error || op.result) && (
            <>
              {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

              {op.result && (
                <>
                  <Card>
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">
                      Order #{op.result.data.id} created
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      {op.result.data.currency} {op.result.data.total} ·{" "}
                      {op.result.data.status}
                    </p>
                  </Card>
                  <JsonView
                    data={op.result.data}
                    label="Created order"
                    defaultOpen
                  />
                </>
              )}
            </>
          )
        }
      >
        <form onSubmit={submit} className="space-y-5">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-slate-100">
                Line items
              </h3>
              <Button variant="ghost" size="sm" icon={Plus} onClick={addLineItem}>
                Add item
              </Button>
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
                    <FormField
                      label="Quantity"
                      type="number"
                      min="1"
                      value={li.quantity}
                      onChange={(e) =>
                        updateLineItem(li.key, { quantity: e.target.value })
                      }
                    />
                    <FormField
                      label="Price override (optional)"
                      value={li.price}
                      onChange={(e) =>
                        updateLineItem(li.key, { price: e.target.value })
                      }
                      placeholder="uses product price"
                    />
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
          </Card>

          <Card>
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">
              Order settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Status"
                type="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={ORDER_STATUSES}
              />
              <FormField
                label="Currency"
                type="select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={CURRENCIES}
              />
              <FormField
                label="Payment method key"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="bacs"
              />
              <FormField
                label="Payment method title"
                value={paymentMethodTitle}
                onChange={(e) => setPaymentMethodTitle(e.target.value)}
                placeholder="Direct bank transfer"
              />
              <FormField
                label="Shipping method title"
                value={shippingTitle}
                onChange={(e) => setShippingTitle(e.target.value)}
              />
              <FormField
                label="Shipping total"
                value={shippingTotal}
                onChange={(e) => setShippingTotal(e.target.value)}
              />
              <FormField
                label="Coupon code (optional)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="SAVE10"
              />
            </div>

            <FormField
              className="mt-4"
              label="Customer note"
              type="textarea"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
            />
          </Card>

          <Card>
            <AddressPicker
              label="Billing address"
              value={billing}
              onChange={setBilling}
            />

            <FormField
              className="mt-4"
              type="checkbox"
              label="Ship to the same address"
              checked={shipToSameAsBilling}
              onChange={(e) => setShipToSameAsBilling(e.target.checked)}
            />

            {!shipToSameAsBilling && (
              <div className="mt-4">
                <AddressPicker
                  label="Shipping address"
                  value={shipping}
                  onChange={setShipping}
                />
              </div>
            )}
          </Card>

          <Button
            type="submit"
            fullWidth
            icon={Sliders}
            loading={op.loading}
            disabled={validItems.length === 0}
          >
            {validItems.length === 0
              ? "Add a product to enable"
              : "Create custom order"}
          </Button>
        </form>
      </SplitLayout>
    </MainLayout>
  );
}

export default CustomOrderPage;
