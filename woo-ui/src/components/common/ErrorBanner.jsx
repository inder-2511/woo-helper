import { AlertTriangle, X } from "lucide-react";

/**
 * Renders a classified error (see utils/errorClassifier) with the "what now"
 * line, which is the part that actually saves the user a debugging round.
 */
function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-4 flex items-start gap-3">
      <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-red-800 dark:text-red-300">
          {error.title}
          {error.status ? ` (${error.status})` : ""}
        </p>
        {error.message && (
          <p className="text-xs text-red-700 dark:text-red-400 mt-1 break-words">
            {error.message}
          </p>
        )}
        {error.action && (
          <p className="text-xs text-red-600 dark:text-red-400/80 mt-2 leading-relaxed">
            {error.action}
          </p>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 shrink-0"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;
