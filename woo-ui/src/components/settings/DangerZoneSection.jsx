import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useSavedStores } from "../../context/SavedStoresContext";
import { useSavedAddresses } from "../../context/SavedAddressesContext";
import { useToast } from "../../context/ToastContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

function DangerZoneSection() {
  const { stores, clearStores } = useSavedStores();
  const { addresses, clearAddresses } = useSavedAddresses();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(null); // "stores" | "addresses" | null

  const handleClearStores = () => {
    clearStores();
    setConfirming(null);
    showToast("Saved stores cleared", "success");
  };

  const handleClearAddresses = () => {
    clearAddresses();
    setConfirming(null);
    showToast("Saved addresses cleared", "success");
  };

  return (
    <Card
      title="Danger zone"
      icon={ShieldAlert}
      danger
      description="Clears data from this browser only — nothing on the WooCommerce side is touched."
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
            Removes every saved store and its API keys.
          </p>
          {confirming === "stores" ? (
            <div className="flex items-center gap-3">
              <Button variant="danger" onClick={handleClearStores}>
                Yes, clear {stores.length} store{stores.length === 1 ? "" : "s"}
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="danger"
              disabled={stores.length === 0}
              onClick={() => setConfirming("stores")}
            >
              Clear saved stores
            </Button>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
            Removes every saved address, including the two seeded examples.
          </p>
          {confirming === "addresses" ? (
            <div className="flex items-center gap-3">
              <Button variant="danger" onClick={handleClearAddresses}>
                Yes, clear {addresses.length} address
                {addresses.length === 1 ? "" : "es"}
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="danger"
              disabled={addresses.length === 0}
              onClick={() => setConfirming("addresses")}
            >
              Clear saved addresses
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default DangerZoneSection;
