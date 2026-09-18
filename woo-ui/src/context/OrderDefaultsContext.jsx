import { createContext, useContext, useEffect, useState } from "react";

const OrderDefaultsContext = createContext(null);
const STORAGE_KEY = "woo_order_defaults";

export const DEFAULT_ORDER_DEFAULTS = {
  status: "processing",
  country: "US",
  shippingTitle: "Flat Rate",
  shippingTotal: "10.00",
};

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ORDER_DEFAULTS;
    return { ...DEFAULT_ORDER_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ORDER_DEFAULTS;
  }
};

/**
 * Bulk "Create Orders" hardcoded status/country/shipping — this exposes
 * those as an editable Settings section instead, similar in spirit to
 * shopifyHelper's Order Settings, but there is no WooCommerce equivalent of
 * Shopify's "orders aren't editable by another app" limitation, so this
 * covers order-creation defaults rather than an editable-orders toggle.
 */
export function OrderDefaultsProvider({ children }) {
  const [defaults, setDefaultsState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch {
      /* private mode — defaults just won't persist */
    }
  }, [defaults]);

  const setDefaults = (patch) =>
    setDefaultsState((prev) => ({ ...prev, ...patch }));

  const resetDefaults = () => setDefaultsState(DEFAULT_ORDER_DEFAULTS);

  return (
    <OrderDefaultsContext.Provider
      value={{ defaults, setDefaults, resetDefaults }}
    >
      {children}
    </OrderDefaultsContext.Provider>
  );
}

export const useOrderDefaults = () => useContext(OrderDefaultsContext);
