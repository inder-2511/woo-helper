import { Trash2, Sun, Moon, Store, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useActivity } from "../../context/ActivityContext";
import { useTheme } from "../../context/ThemeContext";
import { useSavedStores } from "../../context/SavedStoresContext";

function Navbar() {
  const { clearActivities } = useActivity();
  const { dark, toggle } = useTheme();
  const { active } = useSavedStores();

  return (
    <div className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
        WooCommerce Admin Panel
      </h2>

      <div className="flex items-center gap-3">
        <Link
          to="/settings"
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
          <span className="max-w-[180px] truncate">
            {active ? active.name : "Server default store"}
          </span>
        </Link>

        <button
          onClick={toggle}
          title="Toggle dark mode"
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-purple-400 hover:text-purple-500 transition-all"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={clearActivities}
          title="Clear activity log"
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-red-400 hover:text-red-500 transition-all text-sm font-medium"
        >
          <Trash2 size={15} />
          Clear
        </button>
      </div>
    </div>
  );
}

export default Navbar;
