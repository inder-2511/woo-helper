import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import { LoadingBlock, Spinner } from "../../components/common/Spinner";
import JsonView from "../../components/common/JsonView";
import { listOrders, deleteOrder } from "../../api/orderApi";
import { classifyError } from "../../utils/errorClassifier";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import { ORDER_STATUSES } from "../../utils/orderConstants";

const statusStyles = {
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  processing:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
  refunded:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function ListOrdersPage() {
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listOrders({
        page,
        perPage: 20,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      });
      setData(res);
    } catch (err) {
      setError(classifyError(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Permanently delete order #${order.id}?`)) return;
    setDeletingId(order.id);
    try {
      await deleteOrder(order.id);
      showToast(`Deleted order #${order.id}`, "success");
      addActivity("order", `Deleted order #${order.id}`);
      setData((prev) =>
        prev
          ? {
              ...prev,
              orders: prev.orders.filter((o) => o.id !== order.id),
              total: Math.max(0, prev.total - 1),
            }
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

  const totalPages = data?.totalPages ?? 1;

  return (
    <MainLayout
      title="All Orders"
      subtitle={
        data ? `${data.total} orders · page ${data.page} of ${totalPages}` : " "
      }
    >
      <StoreBadge />

      <div className="woo-card mb-5">
        <form onSubmit={submitSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="woo-label">Search</label>
            <input
              className="woo-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Customer name or email"
            />
          </div>

          <div className="w-44">
            <label className="woo-label">Status</label>
            <select
              className="woo-input"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">any</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="woo-btn-primary">
            <Search size={15} />
            Search
          </button>

          <button type="button" onClick={load} className="woo-btn-ghost">
            {loading ? <Spinner /> : <RefreshCw size={15} />}
            Refresh
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-5">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="woo-card p-0 overflow-hidden">
        {loading && !data ? (
          <LoadingBlock label="Loading orders..." />
        ) : !data || data.orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">
            No orders matched.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400">
              <tr>
                <th className="text-left font-semibold px-5 py-3">ID</th>
                <th className="text-left font-semibold px-5 py-3">Customer</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
                <th className="text-left font-semibold px-5 py-3">Total</th>
                <th className="text-left font-semibold px-5 py-3">Items</th>
                <th className="text-left font-semibold px-5 py-3">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-gray-50 dark:border-slate-700/60"
                >
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {o.id}
                  </td>
                  <td className="px-5 py-3 text-gray-800 dark:text-slate-100 max-w-[180px] truncate">
                    {[o.billing?.first_name, o.billing?.last_name]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        statusStyles[o.status] ??
                        "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-slate-300">
                    {o.currency} {o.total}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {o.line_items?.length ?? 0}
                  </td>
                  <td className="px-5 py-3 text-gray-400 dark:text-slate-500 text-xs">
                    {o.date_created?.replace("T", " ").slice(0, 16)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(o)}
                      disabled={deletingId === o.id}
                      title="Delete permanently"
                      className="text-gray-400 hover:text-red-500 disabled:opacity-40"
                    >
                      {deletingId === o.id ? (
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

      {data && data.orders.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="woo-btn-ghost"
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          <span className="text-xs text-gray-500 dark:text-slate-400">
            Page {data.page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || loading}
            className="woo-btn-ghost"
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {data && (
        <div className="mt-5">
          <JsonView data={data.orders} label="Raw JSON (this page)" />
        </div>
      )}
    </MainLayout>
  );
}

export default ListOrdersPage;
