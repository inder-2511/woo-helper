const TONES = {
  gray: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  green:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  amber:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

/** Woo order/product statuses mapped to a consistent tone across every page. */
export const STATUS_TONE = {
  publish: "green",
  completed: "green",
  processing: "blue",
  pending: "amber",
  "on-hold": "amber",
  draft: "gray",
  private: "gray",
  cancelled: "gray",
  refunded: "purple",
  failed: "red",
  trash: "red",
};

function Badge({ children, tone = "gray" }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${TONES[tone] ?? TONES.gray}`}
    >
      {children}
    </span>
  );
}

export default Badge;
