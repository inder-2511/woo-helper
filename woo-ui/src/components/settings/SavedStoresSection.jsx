import { useState } from "react";
import { Store, Trash2, Check, Plug, Plus, Copy } from "lucide-react";
import { useSavedStores } from "../../context/SavedStoresContext";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { testConnection } from "../../api/storeApi";
import { classifyError } from "../../utils/errorClassifier";
import ErrorBanner from "../common/ErrorBanner";
import Card from "../ui/Card";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

const empty = { name: "", baseUrl: "", key: "", secret: "" };

function SavedStoresSection() {
  const { stores, activeId, setActiveId, addStore, removeStore } =
    useSavedStores();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [form, setForm] = useState(empty);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCopy = async (store) => {
    const text = [
      `Store URL: ${store.baseUrl}`,
      `Consumer Key: ${store.key}`,
      `Consumer Secret: ${store.secret}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(store.id);
      showToast(`Copied credentials for "${store.name}"`, "success");
      setTimeout(() => setCopiedId((id) => (id === store.id ? null : id)), 1500);
    } catch {
      showToast("Couldn't copy — clipboard access blocked", "error");
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const record = addStore(form);
    if (!record) {
      showToast("All four fields are required", "error");
      return;
    }
    setForm(empty);
    showToast(`Saved "${record.name}"`, "success");
  };

  const handleRemove = async (store) => {
    if (!(await confirm(`Remove "${store.name}"?`))) return;
    removeStore(store.id);
    showToast(`Removed "${store.name}"`, "success");
  };

  /** Runs against whichever store is currently active. */
  const handleTest = async () => {
    setTesting(true);
    setError(null);
    try {
      const res = await testConnection();
      showToast(
        `Connected to ${res.storeUrl} — ${res.productCount} products`,
        "success",
      );
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      showToast(classified.title, "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card
      title="Stores"
      icon={Store}
      description="Credentials are kept in this browser only and sent with each request — the backend never stores them. Generate keys in WooCommerce → Settings → Advanced → REST API with Read/Write permission."
    >
      {stores.length > 0 && (
        <div className="space-y-2 mb-5">
          {stores.map((s) => {
            const isActive = s.id === activeId;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                  isActive
                    ? "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30"
                    : "border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                }`}
              >
                <button
                  onClick={() => setActiveId(isActive ? null : s.id)}
                  title={isActive ? "Deselect" : "Use this store"}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "border-gray-300 dark:border-slate-600"
                  }`}
                >
                  {isActive && <Check size={12} />}
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                    {s.baseUrl} · {s.key.slice(0, 10)}…
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(s)}
                  title="Copy store URL, key and secret"
                  className="text-gray-400 hover:text-purple-500 shrink-0"
                >
                  {copiedId === s.id ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>

                <button
                  onClick={() => handleRemove(s)}
                  title="Remove store"
                  className="text-gray-400 hover:text-red-500 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <Button
            variant="ghost"
            className="mt-2"
            icon={Plug}
            loading={testing}
            onClick={handleTest}
          >
            Test active store
          </Button>
        </div>
      )}

      {error && (
        <div className="mb-5">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleAdd} className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Label"
            value={form.name}
            onChange={set("name")}
            placeholder="QA store"
          />
          <FormField
            label="Store URL"
            value={form.baseUrl}
            onChange={set("baseUrl")}
            placeholder="https://mystore.com"
          />
          <FormField
            label="Consumer key"
            value={form.key}
            onChange={set("key")}
            placeholder="ck_..."
          />
          <FormField
            label="Consumer secret"
            type="password"
            value={form.secret}
            onChange={set("secret")}
            placeholder="cs_..."
          />
        </div>

        <Button type="submit" icon={Plus}>
          Save store
        </Button>
      </form>
    </Card>
  );
}

export default SavedStoresSection;
