function EmptyState({ icon: Icon, title = "Nothing here yet", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-14 text-gray-300 dark:text-slate-600 ${className}`}
    >
      {Icon && <Icon size={32} className="mb-2" />}
      <p className="text-sm">{title}</p>
    </div>
  );
}

export default EmptyState;
