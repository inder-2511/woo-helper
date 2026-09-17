import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useSavedStores } from "../../context/SavedStoresContext";
import { useToast } from "../../context/ToastContext";

function DangerZoneSection() {
  const { stores, clearStores } = useSavedStores();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const handleClear = () => {
    clearStores();
    setConfirming(false);
    showToast("Saved stores cleared", "success");
  };

  return (
    <div className="woo-card border-red-100 dark:border-red-900/50">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert size={18} className="text-red-500" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
          Danger zone
        </h2>
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
        Removes every saved store and its API keys from this browser. Nothing on
        the WooCommerce side is touched.
      </p>

      {confirming ? (
        <div className="flex items-center gap-3">
          <button onClick={handleClear} className="woo-btn-danger">
            Yes, clear {stores.length} store{stores.length === 1 ? "" : "s"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="woo-btn-ghost"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={stores.length === 0}
          className="woo-btn-danger"
        >
          Clear saved stores
        </button>
      )}
    </div>
  );
}

export default DangerZoneSection;
