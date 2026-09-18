import { createContext, useCallback, useContext, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "../components/ui/Button";

const ConfirmContext = createContext(null);

/**
 * Promise-based replacement for window.confirm() — themed to match the
 * rest of the app instead of a jarring native browser dialog.
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm("Delete this product?"))) return;
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { message, danger, resolve }

  const confirm = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      setState({ message, danger: opts.danger ?? true, resolve });
    });
  }, []);

  const settle = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => settle(false)}
        >
          <div
            className="woo-card max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle
                size={20}
                className={
                  state.danger
                    ? "text-red-500 mt-0.5 shrink-0"
                    : "text-purple-500 mt-0.5 shrink-0"
                }
              />
              <p className="text-sm text-gray-700 dark:text-slate-200 leading-relaxed">
                {state.message}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => settle(false)}>
                Cancel
              </Button>
              <Button
                variant={state.danger ? "danger" : "primary"}
                onClick={() => settle(true)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
