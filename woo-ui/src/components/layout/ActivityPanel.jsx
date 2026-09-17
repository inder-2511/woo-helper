import { ShoppingBag, Package, Users, Ticket, Clock } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";

const icons = {
  order: <ShoppingBag size={14} className="text-purple-500" />,
  product: <Package size={14} className="text-green-500" />,
  customer: <Users size={14} className="text-blue-500" />,
  coupon: <Ticket size={14} className="text-amber-500" />,
  error: <Clock size={14} className="text-red-500" />,
  default: <Clock size={14} className="text-gray-400 dark:text-slate-500" />,
};

const badges = {
  order:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  product:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  customer: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  coupon: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  error: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  default: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400",
};

function ActivityPanel() {
  const { activities } = useActivity();

  return (
    <div className="w-[280px] shrink-0 min-h-full bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">
          Activity
        </h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
          Clears on refresh
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300 dark:text-slate-600">
            <Clock size={32} className="mb-2" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          activities.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-3 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    badges[a.type] ?? badges.default
                  }`}
                >
                  {icons[a.type] ?? icons.default}
                  {a.type}
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {a.timestamp}
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-slate-300 leading-snug break-words">
                {a.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityPanel;
