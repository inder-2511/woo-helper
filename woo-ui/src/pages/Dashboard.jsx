import { API_BASE_URL } from "../services/api";

const apiTarget = (() => {
  try {
    const u = new URL(API_BASE_URL);
    return u.port || u.hostname;
  } catch {
    return API_BASE_URL;
  }
})();

const stats = [
  {
    label: "Order Actions",
    value: "2",
    detail: "Create and update orders",
    tone: "text-blue-300",
  },
  {
    label: "Product Actions",
    value: "5",
    detail: "Create, fetch, and duplicate products",
    tone: "text-green-300",
  },
  {
    label: "API Target",
    value: apiTarget,
    detail: API_BASE_URL,
    tone: "text-yellow-300",
  },
];

const quickActions = [
  {
    title: "Create Orders",
    description: "Generate multiple orders for a product ID.",
    section: "orders",
    active: "orders",
    accent: "border-blue-500/40 hover:border-blue-400",
  },
  {
    title: "Update Order",
    description: "Choose only the order fields you want to change.",
    section: "orders",
    active: "updateOrder",
    accent: "border-cyan-500/40 hover:border-cyan-400",
  },
  {
    title: "Create Simple Product",
    description: "Bulk create simple products with price and dimensions.",
    section: "products",
    active: "simple",
    accent: "border-green-500/40 hover:border-green-400",
  },
  {
    title: "Create Variable Product",
    description: "Create variable products with shared product details.",
    section: "products",
    active: "variable",
    accent: "border-fuchsia-500/40 hover:border-fuchsia-400",
  },
  {
    title: "Fetch Products",
    description: "Load all products with built-in pagination.",
    section: "products",
    active: "fetchAll",
    accent: "border-emerald-500/40 hover:border-emerald-400",
  },
  {
    title: "Duplicate Product",
    description: "Duplicate an existing product by ID.",
    section: "products",
    active: "duplicate",
    accent: "border-amber-500/40 hover:border-amber-400",
  },
];

export default function Dashboard({ logs = [], onNavigate }) {
  const latestLogs = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {/* <h2 className="text-3xl font-bold text-white">Dashboard</h2> */}
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              A quick control room for order and product workflows.
            </p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300">
            Version <span className="text-white">{__APP_VERSION__}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-700 bg-gray-900 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400">{item.label}</p>
                <p className={`mt-3 text-3xl font-bold ${item.tone}`}>
                  {item.value}
                </p>
              </div>
              <span className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-400">
                Live
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <span className="text-sm text-gray-500">
              {quickActions.length} shortcuts
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => onNavigate(action.section, action.active)}
                className={`group rounded-xl border bg-gray-900 p-5 text-left transition ${action.accent}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-200">
                      {action.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <span className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-gray-300 group-hover:bg-blue-600 group-hover:text-white">
                    Open
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <span className="text-xs text-gray-500">{logs.length} total</span>
          </div>

          {latestLogs.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-gray-700 p-5 text-sm text-gray-500">
              No activity yet.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {latestLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-gray-300"
                >
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
