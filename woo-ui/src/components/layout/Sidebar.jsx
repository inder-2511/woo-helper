import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Ticket,
  Settings,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0";

const orderItems = [
  { name: "All Orders", path: "/orders" },
  { name: "Create Orders", path: "/orders/create" },
  { name: "Custom Order", path: "/orders/custom" },
  { name: "Update Order", path: "/orders/update" },
  { name: "Duplicate Order", path: "/orders/duplicate" },
  { name: "Fetch Order", path: "/orders/fetch" },
];

const productItems = [
  { name: "All Products", path: "/products" },
  { name: "Create Simple", path: "/products/create-simple" },
  { name: "Create Variable", path: "/products/create-variable" },
  { name: "Update Product", path: "/products/update" },
  { name: "Duplicate Product", path: "/products/duplicate" },
  { name: "Delete Product", path: "/products/delete" },
  { name: "Fetch Product", path: "/products/fetch" },
];

function LogoMark({ size = 44 }) {
  return (
    <div
      className="rounded-xl overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="woo-logo-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a855f7" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#woo-logo-bg)" />
        <path
          d="M22 26v-2.5a10 10 0 0 1 20 0V26h4.6l-2 22.4a3.5 3.5 0 0 1-3.5 3.1H20.9a3.5 3.5 0 0 1-3.5-3.1L15.4 26H22zm4 0h12v-2.5a6 6 0 0 0-12 0V26zm-1 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
          fill="white"
        />
      </svg>
    </div>
  );
}

function CollapsibleMenu({
  icon,
  label,
  items,
  isActive,
  open,
  onToggle,
  location,
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 text-left ${
          isActive || open ? "bg-white/10" : "hover:bg-white/10"
        }`}
      >
        {icon}
        <span className="text-base flex-1">{label}</span>
        {open ? (
          <ChevronDown size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-1 pl-4">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center pl-10 pr-4 py-2.5 rounded-2xl transition-all duration-200 text-sm ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                  : "hover:bg-white/10 text-gray-400"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TopLink({ to, icon, label, location }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 ${
        location.pathname === to
          ? "bg-gradient-to-r from-purple-600 to-purple-500"
          : "hover:bg-white/10"
      }`}
    >
      {icon}
      <span className="text-base">{label}</span>
    </Link>
  );
}

function Sidebar() {
  const location = useLocation();

  const isOrdersPath = location.pathname.startsWith("/orders");
  const isProductsPath = location.pathname.startsWith("/products");

  const [ordersOpen, setOrdersOpen] = useState(isOrdersPath);
  const [productsOpen, setProductsOpen] = useState(isProductsPath);

  useEffect(() => {
    if (isOrdersPath) setOrdersOpen(true);
    if (isProductsPath) setProductsOpen(true);
  }, [isOrdersPath, isProductsPath]);

  return (
    <div className="w-[280px] h-screen sticky top-0 self-start bg-[#060B27] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-6 py-6 flex items-center gap-3">
          <LogoMark size={44} />
          <h1 className="text-2xl font-bold leading-tight">
            Woo
            <br />
            <span className="text-purple-400">Helper</span>
          </h1>
        </div>

        <nav className="px-4 pb-4 flex flex-col gap-2">
          <TopLink
            to="/"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            location={location}
          />

          <CollapsibleMenu
            icon={<ShoppingBag size={20} />}
            label="Orders"
            items={orderItems}
            isActive={isOrdersPath}
            open={ordersOpen}
            onToggle={() => setOrdersOpen((p) => !p)}
            location={location}
          />

          <CollapsibleMenu
            icon={<Package size={20} />}
            label="Products"
            items={productItems}
            isActive={isProductsPath}
            open={productsOpen}
            onToggle={() => setProductsOpen((p) => !p)}
            location={location}
          />

          <TopLink
            to="/customers"
            icon={<Users size={20} />}
            label="Customers"
            location={location}
          />

          <TopLink
            to="/coupons"
            icon={<Ticket size={20} />}
            label="Coupons"
            location={location}
          />

          <TopLink
            to="/settings"
            icon={<Settings size={20} />}
            label="Settings"
            location={location}
          />
        </nav>
      </div>

      <div className="shrink-0 p-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="font-semibold text-sm">version {APP_VERSION}</h3>
          <p className="text-xs text-gray-400">by Inderbir Singh</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
