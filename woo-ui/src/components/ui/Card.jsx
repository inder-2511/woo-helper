/**
 * The bordered rounded panel every page is built from. With `title` it
 * renders the icon+heading+description header that every Settings section
 * used to hand-write; without one it's a plain content box.
 */
function Card({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  danger = false,
}) {
  return (
    <div
      className={`woo-card ${danger ? "border-red-100 dark:border-red-900/50" : ""} ${className}`}
    >
      {title && (
        <div className="mb-1 flex items-center gap-2">
          {Icon && (
            <Icon
              size={18}
              className={danger ? "text-red-500" : "text-purple-500"}
            />
          )}
          <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
            {title}
          </h2>
        </div>
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export default Card;
