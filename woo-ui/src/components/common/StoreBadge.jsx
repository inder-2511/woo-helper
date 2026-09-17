import { Store, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSavedStores } from "../../context/SavedStoresContext";

/**
 * Sits at the top of every action page so it is never ambiguous which store
 * a bulk create is about to hit.
 */
function StoreBadge() {
  const { active } = useSavedStores();

  if (!active) {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-3 mb-5">
        <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          No store selected — requests will use whatever store the backend is
          configured with.{" "}
          <Link
            to="/settings"
            className="font-semibold underline hover:text-amber-600"
          >
            Add a store in Settings
          </Link>{" "}
          to target one explicitly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex items-center gap-3 mb-5">
      <Store className="text-purple-500 shrink-0" size={16} />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-700 dark:text-slate-200">
          {active.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
          {active.baseUrl}
        </p>
      </div>
      <Link
        to="/settings"
        className="ml-auto text-xs text-purple-600 dark:text-purple-400 hover:underline shrink-0"
      >
        Change
      </Link>
    </div>
  );
}

export default StoreBadge;
