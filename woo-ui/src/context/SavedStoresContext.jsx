import { createContext, useContext, useEffect, useState } from "react";
import { setActiveStore } from "../api/axios";

const SavedStoresContext = createContext(null);

const STORES_KEY = "woo_saved_stores";
const ACTIVE_KEY = "woo_active_store_id";

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * "mystore.com"          -> "https://mystore.com"
 * "https://mystore.com/" -> "https://mystore.com"
 */
export const normalizeStoreUrl = (raw) => {
  if (!raw) return "";
  let v = String(raw).trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v.replace(/\/+$/, "");
};

export function SavedStoresProvider({ children }) {
  const [stores, setStores] = useState(() => read(STORES_KEY, []));
  const [activeId, setActiveId] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    } catch {
      /* private mode — stores just won't persist */
    }
  }, [stores]);

  const active = stores.find((s) => s.id === activeId) ?? null;

  // Keep the axios interceptor in sync with whichever store is selected.
  // No active store means requests go without credential headers and the
  // backend falls back to its own .env (unless it requires them).
  useEffect(() => {
    setActiveStore(
      active
        ? { baseUrl: active.baseUrl, key: active.key, secret: active.secret }
        : { baseUrl: "", key: "", secret: "" },
    );
    try {
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  }, [active, activeId]);

  const addStore = ({ name, baseUrl, key, secret }) => {
    const record = {
      id: `store_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      name: (name ?? "").trim(),
      baseUrl: normalizeStoreUrl(baseUrl),
      key: (key ?? "").trim(),
      secret: (secret ?? "").trim(),
    };
    if (!record.name || !record.baseUrl || !record.key || !record.secret) {
      return null;
    }
    setStores((prev) => [...prev, record]);
    // First store added becomes the active one.
    setActiveId((prev) => prev ?? record.id);
    return record;
  };

  const updateStore = (id, patch) => {
    const next = { ...patch };
    if (typeof next.name === "string") next.name = next.name.trim();
    if (typeof next.baseUrl === "string")
      next.baseUrl = normalizeStoreUrl(next.baseUrl);
    if (typeof next.key === "string") next.key = next.key.trim();
    if (typeof next.secret === "string") next.secret = next.secret.trim();
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...next } : s)));
  };

  const removeStore = (id) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  };

  const clearStores = () => {
    setStores([]);
    setActiveId(null);
  };

  return (
    <SavedStoresContext.Provider
      value={{
        stores,
        active,
        activeId,
        setActiveId,
        addStore,
        updateStore,
        removeStore,
        clearStores,
      }}
    >
      {children}
    </SavedStoresContext.Provider>
  );
}

export const useSavedStores = () => useContext(SavedStoresContext);
