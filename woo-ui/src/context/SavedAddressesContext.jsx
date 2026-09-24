import { createContext, useContext, useEffect, useState } from "react";

const SavedAddressesContext = createContext(null);
const STORAGE_KEY = "woo_saved_addresses";

// Woo's own field names (address_1/postcode/state), not Shopify's
// (address1/zip/province), so a saved address can be dropped straight into
// a billing or shipping payload with no translation step.
const REQUIRED_FIELDS = ["name", "address_1", "city", "country", "postcode"];

const makeId = () => `addr_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

// Shown the first time the app runs so order forms aren't empty — clearly
// labeled as test data, editable or removable in Settings like anything
// else here. Same four markets as shopifyHelper's address presets, with
// Woo's own field names and its ISO 3166-1 alpha-2 country codes (Woo
// rejects full country names — "United Kingdom" is not valid, "GB" is).
const DEFAULT_ADDRESSES = [
  {
    name: "🇺🇸 Test — US customer",
    first_name: "Jane",
    last_name: "Doe",
    address_1: "123 Main St",
    city: "Needham Heights",
    state: "MA",
    postcode: "02494",
    country: "US",
    email: "jane.doe@example.com",
    phone: "+1 555 555 0100",
  },
  {
    name: "🇬🇧 Test — UK customer",
    first_name: "John",
    last_name: "Smith",
    address_1: "42 Victoria Street",
    city: "London",
    state: "",
    postcode: "SW1H 0NW",
    country: "GB",
    email: "john.smith@example.com",
    phone: "+44 20 7123 4567",
  },
  {
    name: "🇮🇳 Test — India customer",
    first_name: "Raj",
    last_name: "Sharma",
    address_1: "14 Nehru Place",
    city: "New Delhi",
    state: "Delhi",
    postcode: "110019",
    country: "IN",
    email: "raj.sharma@example.com",
    phone: "+91 98112 34567",
  },
  {
    name: "🇦🇺 Test — Australia customer",
    first_name: "Olivia",
    last_name: "Smith",
    address_1: "1 Martin Place",
    city: "Sydney",
    state: "NSW",
    postcode: "2000",
    country: "AU",
    email: "olivia.smith@example.com",
    phone: "+61 2 1234 5678",
  },
];

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First run — seed defaults. An explicit "[]" (user cleared them)
      // stays empty and is never re-seeded.
      return DEFAULT_ADDRESSES.map((a) => ({ id: makeId(), ...a }));
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const clean = (obj) => {
  const trimmed = {};
  for (const [k, v] of Object.entries(obj)) {
    trimmed[k] = typeof v === "string" ? v.trim() : v;
  }
  return trimmed;
};

const isValid = (addr) =>
  REQUIRED_FIELDS.every((k) => addr[k] && String(addr[k]).trim());

export function SavedAddressesProvider({ children }) {
  const [addresses, setAddresses] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    } catch {
      /* private mode — addresses just won't persist */
    }
  }, [addresses]);

  const addAddress = (input) => {
    const trimmed = clean(input);
    if (!isValid(trimmed)) return null;
    const id = `addr_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const record = { id, ...trimmed };
    setAddresses((prev) => [...prev, record]);
    return record;
  };

  const updateAddress = (id, patch) => {
    const trimmed = clean(patch);
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...trimmed } : a)),
    );
  };

  const removeAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAddresses = () => setAddresses([]);

  return (
    <SavedAddressesContext.Provider
      value={{
        addresses,
        addAddress,
        updateAddress,
        removeAddress,
        clearAddresses,
      }}
    >
      {children}
    </SavedAddressesContext.Provider>
  );
}

export const useSavedAddresses = () => useContext(SavedAddressesContext);
