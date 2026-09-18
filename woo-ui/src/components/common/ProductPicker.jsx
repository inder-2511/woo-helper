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
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (manual) return undefined;
    if (!query.trim()) {
      setResults([]);
      return undefined;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await listProducts({ search: query.trim(), perPage: 8 });
        setResults(res.products || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, manual]);

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
              setOpen(true);
              if (value?.productId) onChange({ productId: "", name: "" });
            }}
            onFocus={() => setOpen(true)}
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

      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pick(p)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between gap-2"
            >
              <span className="text-sm text-gray-800 dark:text-slate-100 truncate">
                {p.name}
              </span>
              <span className="text-xs text-gray-400 shrink-0">
                #{p.id} · {p.price || "—"}
              </span>
            </button>
          ))}
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
