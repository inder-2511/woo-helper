import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  Users,
  Ticket,
  Copy,
  Trash2,
  Search,
  PlusCircle,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import StoreBadge from "../components/common/StoreBadge";
import { useActivity } from "../context/ActivityContext";

const quickActions = [
  {
    title: "Create Orders",
    description: "Bulk-generate orders with faker billing and shipping.",
    to: "/orders/create",
    icon: <ShoppingBag size={18} />,
    accent: "hover:border-purple-400",
  },
  {
    title: "Create Simple Products",
    description: "Bulk simple products with price, stock and dimensions.",
    to: "/products/create-simple",
    icon: <PlusCircle size={18} />,
    accent: "hover:border-green-400",
  },
  {
    title: "Browse Products",
    description: "Paginated, searchable product list with inline delete.",
    to: "/products",
    icon: <Search size={18} />,
    accent: "hover:border-blue-400",
  },
  {
    title: "Duplicate Order",
    description: "Clone an existing order any number of times.",
    to: "/orders/duplicate",
    icon: <Copy size={18} />,
    accent: "hover:border-cyan-400",
  },
  {
    title: "Delete Product",
    description: "Remove a product by ID, permanently or to trash.",
    to: "/products/delete",
    icon: <Trash2 size={18} />,
    accent: "hover:border-red-400",
  },
  {
    title: "Generate Customers",
    description: "Seed the store with realistic customer accounts.",
    to: "/customers",
    icon: <Users size={18} />,
    accent: "hover:border-amber-400",
  },
];

const sections = [
  {
    label: "Orders",
    count: "6 actions",
    detail: "list, create, update, duplicate, fetch, delete",
    icon: <ShoppingBag size={20} className="text-purple-400" />,
  },
  {
    label: "Products",
    count: "8 actions",
    detail: "list, create, duplicate, update, delete, variations",
    icon: <Package size={20} className="text-green-400" />,
  },
  {
    label: "Customers",
    count: "3 actions",
    detail: "list, generate, delete",
    icon: <Users size={20} className="text-blue-400" />,
  },
  {
    label: "Coupons",
    count: "3 actions",
    detail: "list, generate, delete",
    icon: <Ticket size={20} className="text-amber-400" />,
  },
];

function Dashboard() {
  const { activities } = useActivity();

  return (
    <MainLayout
      title="Dashboard"
      subtitle="A control room for WooCommerce test data"
    >
      <StoreBadge />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {sections.map((s) => (
          <div key={s.label} className="woo-card">
            <div className="flex items-center gap-2 mb-2">
              {s.icon}
              <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">
                {s.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
              {s.count}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 leading-snug">
              {s.detail}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-3">
        Quick actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`woo-card flex flex-col gap-2 transition-all ${a.accent}`}
          >
            <div className="flex items-center gap-2 text-purple-500">
              {a.icon}
              <span className="font-semibold text-sm text-gray-800 dark:text-slate-100">
                {a.title}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              {a.description}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-3">
        Recent activity
      </h2>
      <div className="woo-card">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500">
            Nothing yet — run an action and it will show up here and in the
            panel on the right.
          </p>
        ) : (
          <ul className="space-y-2">
            {activities.slice(0, 6).map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 text-sm text-gray-700 dark:text-slate-300"
              >
                <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0 w-20">
                  {a.timestamp}
                </span>
                <span className="break-words">{a.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}

export default Dashboard;
