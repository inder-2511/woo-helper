import { useState } from "react";
import { ShoppingBag, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
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
import { createOrder } from "../../api/orderApi";
import { useOperation } from "../../utils/useOperation";
import { useOrderDefaults } from "../../context/OrderDefaultsContext";

const emptyLine = () => ({
  key: `li_${Date.now()}_${Math.random()}`,
  productId: "",
  name: "",
  qty: "1",
});

function CreateOrderPage() {
  const { defaults } = useOrderDefaults();

  const [lineItems, setLineItems] = useState([emptyLine()]);
  const [count, setCount] = useState("1");
  const [address, setAddress] = useState({ country: defaults.country });

  const op = useOperation(createOrder, {
    type: "order",
    success: (res) => `Created ${res.count} order${res.count === 1 ? "" : "s"}`,
  });

  const updateLine = (key, patch) =>
    setLineItems((items) =>
      items.map((li) => (li.key === key ? { ...li, ...patch } : li)),
    );

  const addLine = () => setLineItems((items) => [...items, emptyLine()]);

  const removeLine = (key) =>
    setLineItems((items) =>
      items.length > 1 ? items.filter((li) => li.key !== key) : items,
    );

  const validLines = lineItems.filter((li) => li.productId);

  const submit = (e) => {
    e.preventDefault();
    op.run({
      lineItems: validLines.map((li) => ({
        product: li.productId,
        qty: Number(li.qty) || 1,
      })),
      count: Number(count) || 1,
      status: defaults.status,
      country: defaults.country,
      shippingTitle: defaults.shippingTitle,
      shippingTotal: defaults.shippingTotal,
      // The backend only applies this when enough fields are filled — an
      // untouched picker (just the default country) falls back to a fresh
      // faker address per order, same as leaving it blank.
      address,
    });
  };

  return (
    <MainLayout
      title="Create Orders"
      subtitle="Bulk-generate N orders, each with the same line items"
    >
      <StoreBadge />

      <SplitLayout
        sidebar={
          (op.error || op.result) && (
            <>
              {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

              {op.result && (
                <>
                  <Card title={`Created ${op.result.count}`}>
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
                  </Card>
                  <JsonView data={op.result.data} />
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
                Products
              </h3>
              <Button variant="ghost" size="sm" icon={Plus} onClick={addLine}>
                Add product
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((li) => (
                <div
                  key={li.key}
                  className="rounded-xl border border-gray-100 dark:border-slate-700 p-3 space-y-2"
                >
                  <ProductPicker
                    value={{ productId: li.productId, name: li.name }}
                    onChange={(patch) =>
                      updateLine(li.key, {
                        productId: patch.productId,
                        name: patch.name,
                      })
                    }
                  />
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                    <FormField
                      label="Quantity per order"
                      type="number"
                      min="1"
                      value={li.qty}
                      onChange={(e) =>
                        updateLine(li.key, { qty: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(li.key)}
                      disabled={lineItems.length === 1}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-30 pb-2.5"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              className="mt-4"
              label="How many orders"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
              Status <span className="font-mono">{defaults.status}</span>,
              country <span className="font-mono">{defaults.country}</span>{" "}
              and shipping come from{" "}
              <Link
                to="/settings"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Order defaults
              </Link>
              .
            </p>
          </Card>

          <Card>
            <AddressPicker
              value={address}
              onChange={setAddress}
              label="Fixed address (optional)"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
              Leave the required fields blank to generate a different fake
              customer for every order. Fill them in and the same address is
              used for the whole batch.
            </p>
          </Card>

          <Button
            type="submit"
            fullWidth
            icon={ShoppingBag}
            loading={op.loading}
            disabled={validLines.length === 0}
          >
            {op.loading
              ? "Creating..."
              : validLines.length === 0
                ? "Add a product to enable"
                : "Create orders"}
          </Button>
        </form>
      </SplitLayout>
    </MainLayout>
  );
}

export default CreateOrderPage;
