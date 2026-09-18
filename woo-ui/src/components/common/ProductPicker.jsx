import { useEffect, useRef, useState } from "react";
import { Search, Loader2, Keyboard, X } from "lucide-react";
import { listProducts } from "../../api/productApi";

/**
 * Typeahead product search that resolves to a { productId, name, price }.
 * Falls back to typing a bare ID when the store has too many products to
 * browse comfortably, or search is being slow.
 */
function ProductPicker({ value, onChange, placeholder = "Search products…" }) {
  const [manual, setManual] = useState(false);
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // Gates the fetch so idle pickers (e.g. unused rows in a line-item list)
  // don't all hit the API on mount — only after the field is actually used.
  const [hasInteracted, setHasInteracted] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (manual || !hasInteracted) return undefined;
    setLoading(true);
    clearTimeout(debounceRef.current);
    // An empty query still fetches — clicking in shows a starter list
    // instead of an empty box, so there's always something to pick from.
    const trimmed = query.trim();
    debounceRef.current = setTimeout(
      async () => {
        try {
          const res = await listProducts(
            trimmed ? { search: trimmed, perPage: 8 } : { perPage: 8 },
          );
          setResults(res.products || []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      },
      trimmed ? 350 : 0,
    );
    return () => clearTimeout(debounceRef.current);
  }, [query, manual, hasInteracted]);

  const openWithResults = () => {
    setOpen(true);
    setHasInteracted(true);
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const pick = (p) => {
    onChange({ productId: String(p.id), name: p.name, price: p.price });
    setQuery(p.name);
    setOpen(false);
  };

  const clear = () => {
    onChange({ productId: "", name: "", price: "" });
    setQuery("");
  };

  if (manual) {
    return (
      <div className="flex gap-2">
        <input
          className="woo-input"
          type="number"
          value={value?.productId ?? ""}
          onChange={(e) =>
            onChange({ ...value, productId: e.target.value, name: "" })
          }
          placeholder="Product ID"
        />
        <button
          type="button"
          onClick={() => setManual(false)}
          title="Switch to search"
          className="woo-btn-ghost px-3"
        >
          <Search size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            className="woo-input pr-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              openWithResults();
              if (value?.productId) onChange({ productId: "", name: "" });
            }}
            onFocus={openWithResults}
            onClick={openWithResults}
            placeholder={placeholder}
          />
          {loading ? (
            <Loader2
              size={14}
              className="btn-spinner absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          ) : query ? (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setManual(true)}
          title="Enter ID manually"
          className="woo-btn-ghost px-3"
        >
          <Keyboard size={15} />
        </button>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg">
          {!query.trim() && (
            <p className="px-3.5 py-2 text-xs text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700">
              Recent products — type to search
            </p>
          )}

          {loading && results.length === 0 ? (
            <p className="px-3.5 py-3 text-sm text-gray-400 dark:text-slate-500">
              Loading…
            </p>
          ) : results.length === 0 ? (
            <p className="px-3.5 py-3 text-sm text-gray-400 dark:text-slate-500">
              No products matched.
            </p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between gap-2"
              >
                <span className="text-sm text-gray-800 dark:text-slate-100 truncate">
                  {p.name}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  #{p.id} · {p.price || "—"}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {value?.productId && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
          Selected #{value.productId}
          {value.price ? ` · ${value.price}` : ""}
        </p>
      )}
    </div>
  );
}

export default ProductPicker;
