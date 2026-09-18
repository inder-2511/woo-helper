import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import ProductPicker from "../../components/common/ProductPicker";
import AddressPicker from "../../components/common/AddressPicker";
import { createOrder } from "../../api/orderApi";
import { useOperation } from "../../utils/useOperation";
import { useOrderDefaults } from "../../context/OrderDefaultsContext";

function CreateOrderPage() {
  const { defaults } = useOrderDefaults();

  const [product, setProduct] = useState({ productId: "", name: "" });
  const [qty, setQty] = useState("1");
  const [count, setCount] = useState("1");
  const [useFixedAddress, setUseFixedAddress] = useState(false);
  const [address, setAddress] = useState({ country: defaults.country });

  const op = useOperation(createOrder, {
    type: "order",
    success: (res) => `Created ${res.count} order${res.count === 1 ? "" : "s"}`,
  });

  const submit = (e) => {
    e.preventDefault();
    op.run({
      product: Number(product.productId),
      qty: Number(qty) || 1,
      count: Number(count) || 1,
      status: defaults.status,
      country: defaults.country,
      shippingTitle: defaults.shippingTitle,
      shippingTotal: defaults.shippingTotal,
      ...(useFixedAddress ? { address } : {}),
    });
  };

  return (
    <MainLayout
      title="Create Orders"
      subtitle="Bulk-generate orders for one product — addresses are faked unless you fix one below"
    >
      <StoreBadge />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <form onSubmit={submit} className="space-y-5">
          <div className="woo-card space-y-4">
            <div>
              <label className="woo-label">Product</label>
              <ProductPicker value={product} onChange={setProduct} />
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

            <p className="text-xs text-gray-500 dark:text-slate-400">
              Status <span className="font-mono">{defaults.status}</span>,
              country <span className="font-mono">{defaults.country}</span>{" "}
              and shipping come from{" "}
              <Link to="/settings" className="text-purple-600 dark:text-purple-400 hover:underline">
                Order defaults
              </Link>
              .
            </p>
          </div>

          <div className="woo-card">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={useFixedAddress}
                onChange={(e) => setUseFixedAddress(e.target.checked)}
                className="w-4 h-4 accent-purple-600"
              />
              Use one fixed address for every order in this batch
            </label>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-3">
              Leave unchecked to generate a different fake customer per order.
            </p>

            {useFixedAddress && (
              <AddressPicker value={address} onChange={setAddress} label="" />
            )}
          </div>

          <button
            type="submit"
            disabled={op.loading || !product.productId}
            className="woo-btn-primary w-full"
          >
            {op.loading ? <Spinner /> : <ShoppingBag size={16} />}
            {op.loading ? "Creating..." : "Create orders"}
          </button>
        </form>

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
