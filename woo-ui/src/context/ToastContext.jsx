import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-lg min-w-[280px] max-w-sm animate-slide-in bg-white dark:bg-slate-800 border ${
              toast.type === "success"
                ? "border-green-200 dark:border-green-900"
                : "border-red-200 dark:border-red-900"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2
                className="text-green-500 mt-0.5 shrink-0"
                size={20}
              />
            ) : (
              <XCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            )}

            <p className="flex-1 text-sm font-medium leading-snug text-gray-800 dark:text-slate-100">
              {toast.message}
            </p>

            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
