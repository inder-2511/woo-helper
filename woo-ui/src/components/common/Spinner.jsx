import { Loader2 } from "lucide-react";

export function Spinner({ size = 16, className = "" }) {
  return <Loader2 size={size} className={`btn-spinner ${className}`} />;
}

export function LoadingBlock({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-gray-400 dark:text-slate-500">
      <Spinner size={20} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default Spinner;
