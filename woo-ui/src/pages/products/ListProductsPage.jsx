import { useCallback, useEffect, useState } from "react";
import { Search, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import { LoadingBlock, Spinner } from "../../components/common/Spinner";
import JsonView from "../../components/common/JsonView";
import { listProducts, deleteProduct } from "../../api/productApi";
import { classifyError } from "../../utils/errorClassifier";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";

const statusOptions = ["", "publish", "draft", "pending", "private"];
const typeOptions = ["", "simple", "variable", "grouped", "external"];

function ListProductsPage() {
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listProducts({
        page,
        perPage: 20,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      });
      setData(res);
    } catch (err) {
      setError(classifyError(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (product) => {
    if (
      !window.confirm(
        `Permanently delete "${product.name}" (#${product.id})? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      showToast(`Deleted "${product.name}"`, "success");
      addActivity("product", `Deleted product #${product.id} ${product.name}`);
      setData((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.filter((p) => p.id !== product.id),
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
      title="All Products"
      subtitle={
        data ? `${data.total} products · page ${data.page} of ${totalPages}` : " "
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
              placeholder="Name or SKU"
            />
          </div>

          <div className="w-40">
            <label className="woo-label">Status</label>
            <select
              className="woo-input"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s || "any"}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="woo-label">Type</label>
            <select
              className="woo-input"
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t || "any"}
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
          <LoadingBlock label="Loading products..." />
        ) : !data || data.products.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">
            No products matched.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400">
              <tr>
                <th className="text-left font-semibold px-5 py-3">ID</th>
                <th className="text-left font-semibold px-5 py-3">Name</th>
                <th className="text-left font-semibold px-5 py-3">Type</th>
                <th className="text-left font-semibold px-5 py-3">Price</th>
                <th className="text-left font-semibold px-5 py-3">Stock</th>
                <th className="text-left font-semibold px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-50 dark:border-slate-700/60"
                >
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {p.id}
                  </td>
                  <td className="px-5 py-3 text-gray-800 dark:text-slate-100 font-medium max-w-xs truncate">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {p.type}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-slate-300">
                    {p.price || "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {p.stock_quantity ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      title="Delete permanently"
                      className="text-gray-400 hover:text-red-500 disabled:opacity-40"
                    >
                      {deletingId === p.id ? (
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

      {data && data.products.length > 0 && (
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
          <JsonView data={data.products} label="Raw JSON (this page)" />
        </div>
      )}
    </MainLayout>
  );
}

export default ListProductsPage;
