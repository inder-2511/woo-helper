import { useCallback, useEffect, useState } from "react";
import { Ticket, Trash2, RefreshCw } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import StoreBadge from "../components/common/StoreBadge";
import ErrorBanner from "../components/common/ErrorBanner";
import { LoadingBlock, Spinner } from "../components/common/Spinner";
import JsonView from "../components/common/JsonView";
import { listCoupons, createCoupons, deleteCoupon } from "../api/couponApi";
import { classifyError } from "../utils/errorClassifier";
import { useOperation } from "../utils/useOperation";
import { useToast } from "../context/ToastContext";
import { useActivity } from "../context/ActivityContext";

const DISCOUNT_TYPES = [
  { value: "percent", label: "Percentage discount" },
  { value: "fixed_cart", label: "Fixed cart discount" },
  { value: "fixed_product", label: "Fixed product discount" },
];

function CouponsPage() {
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [form, setForm] = useState({
    discountType: "percent",
    amount: "10",
    count: "1",
  });
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const createOp = useOperation(createCoupons, {
    type: "coupon",
    success: (res) => `Created ${res.count} coupon${res.count === 1 ? "" : "s"}`,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listCoupons({ page, perPage: 20 }));
    } catch (err) {
      setError(classifyError(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createOp.run({
      discountType: form.discountType,
      amount: form.amount,
      count: Number(form.count) || 1,
    });
    if (res) load();
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Permanently delete coupon "${coupon.code}"?`)) return;
    setDeletingId(coupon.id);
    try {
      await deleteCoupon(coupon.id);
      showToast(`Deleted "${coupon.code}"`, "success");
      addActivity("coupon", `Deleted coupon ${coupon.code}`);
      setData((prev) =>
        prev
          ? { ...prev, coupons: prev.coupons.filter((c) => c.id !== coupon.id) }
          : prev,
      );
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      showToast(classified.title, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout
      title="Coupons"
      subtitle={data ? `${data.total} coupons in this store` : " "}
    >
      <StoreBadge />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="woo-card">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">
            Generate coupons
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Codes are randomised so bulk runs never collide.
          </p>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="woo-label">Discount type</label>
              <select
                className="woo-input"
                value={form.discountType}
                onChange={set("discountType")}
              >
                {DISCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="woo-label">Amount</label>
                <input
                  className="woo-input"
                  value={form.amount}
                  onChange={set("amount")}
                />
              </div>
              <div>
                <label className="woo-label">How many</label>
                <input
                  className="woo-input"
                  type="number"
                  min="1"
                  max="50"
                  value={form.count}
                  onChange={set("count")}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createOp.loading}
              className="woo-btn-primary w-full"
            >
              {createOp.loading ? <Spinner /> : <Ticket size={16} />}
              Create coupons
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 space-y-4">
          {createOp.error && (
            <ErrorBanner error={createOp.error} onDismiss={createOp.reset} />
          )}
          {error && (
            <ErrorBanner error={error} onDismiss={() => setError(null)} />
          )}
          {createOp.result && (
            <JsonView
              data={createOp.result.data}
              label={`Created ${createOp.result.count} — raw JSON`}
            />
          )}
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <button onClick={load} className="woo-btn-ghost">
          {loading ? <Spinner /> : <RefreshCw size={15} />}
          Refresh
        </button>
      </div>

      <div className="woo-card p-0 overflow-hidden">
        {loading && !data ? (
          <LoadingBlock label="Loading coupons..." />
        ) : !data || data.coupons.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">
            No coupons yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400">
              <tr>
                <th className="text-left font-semibold px-5 py-3">ID</th>
                <th className="text-left font-semibold px-5 py-3">Code</th>
                <th className="text-left font-semibold px-5 py-3">Type</th>
                <th className="text-left font-semibold px-5 py-3">Amount</th>
                <th className="text-left font-semibold px-5 py-3">Used</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.coupons.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-50 dark:border-slate-700/60"
                >
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {c.id}
                  </td>
                  <td className="px-5 py-3 text-gray-800 dark:text-slate-100 font-mono text-xs">
                    {c.code}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {c.discount_type}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-slate-300">
                    {c.amount}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {c.usage_count ?? 0}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={deletingId === c.id}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-40"
                    >
                      {deletingId === c.id ? (
                        <Spinner size={15} />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="woo-btn-ghost"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.totalPages || loading}
            className="woo-btn-ghost"
          >
            Next
          </button>
        </div>
      )}
    </MainLayout>
  );
}

export default CouponsPage;
