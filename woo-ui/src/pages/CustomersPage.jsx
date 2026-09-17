import { useCallback, useEffect, useState } from "react";
import { Users, Trash2, RefreshCw, Search } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import StoreBadge from "../components/common/StoreBadge";
import ErrorBanner from "../components/common/ErrorBanner";
import { LoadingBlock, Spinner } from "../components/common/Spinner";
import JsonView from "../components/common/JsonView";
import {
  listCustomers,
  createCustomers,
  deleteCustomer,
} from "../api/customerApi";
import { classifyError } from "../utils/errorClassifier";
import { useOperation } from "../utils/useOperation";
import { useToast } from "../context/ToastContext";
import { useActivity } from "../context/ActivityContext";

function CustomersPage() {
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [count, setCount] = useState("1");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const createOp = useOperation(createCustomers, {
    type: "customer",
    success: (res) =>
      `Created ${res.count} customer${res.count === 1 ? "" : "s"}`,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCustomers({
        page,
        perPage: 20,
        ...(search ? { search } : {}),
      });
      setData(res);
    } catch (err) {
      setError(classifyError(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createOp.run(Number(count) || 1);
    if (res) load();
  };

  const handleDelete = async (customer) => {
    if (
      !window.confirm(
        `Permanently delete ${customer.email}? WooCommerce cannot trash customers.`,
      )
    ) {
      return;
    }
    setDeletingId(customer.id);
    try {
      await deleteCustomer(customer.id);
      showToast(`Deleted ${customer.email}`, "success");
      addActivity("customer", `Deleted customer ${customer.email}`);
      setData((prev) =>
        prev
          ? {
              ...prev,
              customers: prev.customers.filter((c) => c.id !== customer.id),
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

  return (
    <MainLayout
      title="Customers"
      subtitle={data ? `${data.total} customers in this store` : " "}
    >
      <StoreBadge />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="woo-card">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-1">
            Generate customers
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Names, emails and addresses come from faker. Emails use
            example.com so they never reach a real inbox.
          </p>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="woo-label">How many</label>
              <input
                className="woo-input"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={createOp.loading}
              className="woo-btn-primary w-full"
            >
              {createOp.loading ? <Spinner /> : <Users size={16} />}
              Create customers
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

      <div className="woo-card mb-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[220px]">
            <label className="woo-label">Search</label>
            <input
              className="woo-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Name or email"
            />
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

      <div className="woo-card p-0 overflow-hidden">
        {loading && !data ? (
          <LoadingBlock label="Loading customers..." />
        ) : !data || data.customers.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">
            No customers yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400">
              <tr>
                <th className="text-left font-semibold px-5 py-3">ID</th>
                <th className="text-left font-semibold px-5 py-3">Name</th>
                <th className="text-left font-semibold px-5 py-3">Email</th>
                <th className="text-left font-semibold px-5 py-3">Orders</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-50 dark:border-slate-700/60"
                >
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {c.id}
                  </td>
                  <td className="px-5 py-3 text-gray-800 dark:text-slate-100">
                    {[c.first_name, c.last_name].filter(Boolean).join(" ") ||
                      "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-slate-300">
                    {c.email}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-slate-400">
                    {c.orders_count ?? "—"}
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

export default CustomersPage;
