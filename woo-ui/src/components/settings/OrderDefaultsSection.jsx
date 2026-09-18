import { FilePenLine } from "lucide-react";
import { useOrderDefaults } from "../../context/OrderDefaultsContext";
import { ORDER_STATUSES } from "../../utils/orderConstants";

function OrderDefaultsSection() {
  const { defaults, setDefaults, resetDefaults } = useOrderDefaults();

  return (
    <div className="woo-card">
      <div className="flex items-center gap-2 mb-1">
        <FilePenLine size={18} className="text-purple-500" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
          Order defaults
        </h2>
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
        Used by bulk "Create Orders" — the generated billing/shipping country
        and the placeholder shipping line. Custom Order sets these per-order
        instead.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="woo-label">Default status</label>
          <select
            className="woo-input"
            value={defaults.status}
            onChange={(e) => setDefaults({ status: e.target.value })}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="woo-label">Default country</label>
          <input
            className="woo-input"
            value={defaults.country}
            onChange={(e) => setDefaults({ country: e.target.value })}
            placeholder="US"
          />
        </div>
        <div>
          <label className="woo-label">Shipping method title</label>
          <input
            className="woo-input"
            value={defaults.shippingTitle}
            onChange={(e) => setDefaults({ shippingTitle: e.target.value })}
          />
        </div>
        <div>
          <label className="woo-label">Shipping total</label>
          <input
            className="woo-input"
            value={defaults.shippingTotal}
            onChange={(e) => setDefaults({ shippingTotal: e.target.value })}
          />
        </div>
      </div>

      <button onClick={resetDefaults} className="woo-btn-ghost mt-4">
        Reset to defaults
      </button>
    </div>
  );
}

export default OrderDefaultsSection;
