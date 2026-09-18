import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SplitLayout from "../../components/ui/SplitLayout";
import { deleteProduct, batchDeleteProducts } from "../../api/productApi";
import { useOperation } from "../../utils/useOperation";
import { useConfirm } from "../../context/ConfirmContext";

function DeleteProductPage() {
  const confirm = useConfirm();
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");

  const singleOp = useOperation(deleteProduct, {
    type: "product",
    success: (res) => `Deleted "${res.data?.name ?? res.data?.id}"`,
  });

  const bulkOp = useOperation(batchDeleteProducts, {
    type: "product",
    success: (res) => `Deleted ${res.count} products`,
  });

  const submitSingle = async (e) => {
    e.preventDefault();
    if (!(await confirm(`Permanently delete product #${single}?`))) return;
    singleOp.run(Number(single));
  };

  const ids = bulk
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter(Boolean);

  const submitBulk = async (e) => {
    e.preventDefault();
    if (!ids.length) return;
    if (
      !(await confirm(
        `Permanently delete ${ids.length} products? This cannot be undone.`,
      ))
    ) {
      return;
    }
    bulkOp.run(ids);
  };

  const hasSidebar =
    singleOp.error || bulkOp.error || singleOp.result || bulkOp.result;

  return (
    <MainLayout
      title="Delete Product"
      subtitle="Deletes are permanent — WooCommerce is called with force=true"
    >
      <StoreBadge />

      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-3 mb-5">
        <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          These products skip the trash and cannot be restored from the
          WooCommerce admin. Confirm you are pointed at a test store.
        </p>
      </div>

      <SplitLayout
        sidebar={
          hasSidebar && (
            <>
              {singleOp.error && (
                <ErrorBanner error={singleOp.error} onDismiss={singleOp.reset} />
              )}
              {bulkOp.error && (
                <ErrorBanner error={bulkOp.error} onDismiss={bulkOp.reset} />
              )}

              {singleOp.result && (
                <Card title="Deleted">
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    #{singleOp.result.data?.id} — {singleOp.result.data?.name}
                  </p>
                </Card>
              )}

              {bulkOp.result && (
                <>
                  <Card title={`Deleted ${bulkOp.result.count}`}>
                    <ul className="space-y-1.5">
                      {bulkOp.result.data.map((p) => (
                        <li
                          key={p.id}
                          className="text-sm text-gray-600 dark:text-slate-300 truncate"
                        >
                          #{p.id} — {p.name}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <JsonView data={bulkOp.result.data} />
                </>
              )}
            </>
          )
        }
      >
        <div className="space-y-5">
          <Card title="Delete one">
            <form onSubmit={submitSingle} className="space-y-4">
              <FormField
                label="Product ID"
                type="number"
                value={single}
                onChange={(e) => setSingle(e.target.value)}
                placeholder="119"
                required
              />
              <Button
                type="submit"
                variant="danger"
                fullWidth
                icon={Trash2}
                loading={singleOp.loading}
              >
                Delete product
              </Button>
            </form>
          </Card>

          <Card
            title="Delete many"
            description="IDs separated by commas, spaces or newlines. Sent in batches of 100."
          >
            <form onSubmit={submitBulk} className="space-y-4">
              <FormField
                label={`Product IDs${ids.length ? ` (${ids.length} parsed)` : ""}`}
                type="textarea"
                inputClassName="min-h-[110px] font-mono"
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder="119, 120, 121"
              />
              <Button
                type="submit"
                variant="danger"
                fullWidth
                icon={Trash2}
                loading={bulkOp.loading}
                disabled={!ids.length}
              >
                Delete {ids.length || ""} products
              </Button>
            </form>
          </Card>
        </div>
      </SplitLayout>
    </MainLayout>
  );
}

export default DeleteProductPage;
