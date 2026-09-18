import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Store, AlertTriangle, Check, Settings, ChevronDown } from "lucide-react";
import { useSavedStores } from "../../context/SavedStoresContext";

/**
 * One-click store switching from anywhere in the app — the navbar equivalent
 * of shopifyHelper's saved-store chips, but as a dropdown so it doesn't grow
 * with every store the user adds.
 */
function StoreSwitcher() {
  const { stores, active, activeId, setActiveId } = useSavedStores();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={
          active
            ? `Active store: ${active.baseUrl}`
            : "No store selected — requests fall back to the server's own credentials"
        }
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
          active
            ? "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-purple-400"
            : "border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400"
        }`}
      >
        {active ? <Store size={15} /> : <AlertTriangle size={15} />}
        <span className="max-w-[160px] truncate">
          {active ? active.name : "Server default store"}
        </span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg z-20 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
              Switch store
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            <button
              onClick={() => {
                setActiveId(null);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-left"
            >
              <span className="text-gray-700 dark:text-slate-200">
                Server default store
              </span>
              {!activeId && <Check size={14} className="text-purple-500 shrink-0" />}
            </button>

            {stores.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveId(s.id);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-gray-800 dark:text-slate-100 truncate">
                    {s.name}
                  </span>
                  <span className="block text-xs text-gray-400 dark:text-slate-500 truncate">
                    {s.baseUrl}
                  </span>
                </span>
                {activeId === s.id && (
                  <Check size={14} className="text-purple-500 shrink-0" />
                )}
              </button>
            ))}

            {stores.length === 0 && (
              <p className="px-4 py-3 text-xs text-gray-400 dark:text-slate-500">
                No saved stores yet.
              </p>
            )}
          </div>

          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-slate-700 border-t border-gray-100 dark:border-slate-700"
          >
            <Settings size={13} />
            Manage stores
          </Link>
        </div>
      )}
    </div>
  );
}

export default StoreSwitcher;
