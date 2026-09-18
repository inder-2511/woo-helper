import { useCallback, useEffect, useState } from "react";
import { Search, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import { LoadingBlock, Spinner } from "../../components/common/Spinner";
import JsonView from "../../components/common/JsonView";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { listProducts, deleteProduct } from "../../api/productApi";
import { classifyError } from "../../utils/errorClassifier";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import { useConfirm } from "../../context/ConfirmContext";

const statusOptions = ["any", "publish", "draft", "pending", "private"];
const typeOptions = ["any", "simple", "variable", "grouped", "external"];

function ListProductsPage() {
  const { showToast } = useToast();
  const { addActivity } = useActivity();
  const confirm = useConfirm();

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
      !(await confirm(
        `Permanently delete "${product.name}" (#${product.id})? This cannot be undone.`,
      ))
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

      <Card className="mb-5">
        <form
          onSubmit={submitSearch}
          className="flex flex-wrap gap-3 items-end"
        >
          <FormField
            className="flex-1 min-w-[220px]"
            label="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name or SKU"
          />

          <FormField
            className="w-40"
            label="Status"
            type="select"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            options={statusOptions.map((s) => ({
              value: s === "any" ? "" : s,
              label: s,
            }))}
          />

          <FormField
            className="w-40"
            label="Type"
            type="select"
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
            options={typeOptions.map((t) => ({
              value: t === "any" ? "" : t,
              label: t,
            }))}
          />

          <Button type="submit" icon={Search}>
            Search
          </Button>

          <Button
            type="button"
            variant="ghost"
            icon={RefreshCw}
            loading={loading}
            onClick={load}
          >
            Refresh
          </Button>
        </form>
      </Card>

      {error && (
        <div className="mb-5">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <Card className="!p-0 overflow-hidden">
        {loading && !data ? (
          <LoadingBlock label="Loading products..." />
        ) : !data || data.products.length === 0 ? (
          <EmptyState title="No products matched." />
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
                    <Badge tone={STATUS_TONE[p.status] ?? "gray"}>
                      {p.status}
                    </Badge>
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
      </Card>

      {data && data.products.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="ghost"
            icon={ChevronLeft}
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          <span className="text-xs text-gray-500 dark:text-slate-400">
            Page {data.page} of {totalPages}
          </span>

          <Button
            variant="ghost"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight size={15} />
          </Button>
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
