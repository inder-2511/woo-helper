import { useCallback, useState } from "react";
import { classifyError } from "./errorClassifier";
import { useToast } from "../context/ToastContext";
import { useActivity } from "../context/ActivityContext";

/**
 * Wraps one async API call with the loading / result / classified-error
 * bookkeeping every page needs, and reports into the toast + activity feed.
 *
 *   const create = useOperation(createSimpleProduct, {
 *     type: "product",
 *     success: (res) => `Created ${res.count} products`,
 *   });
 *   create.run({ price: "10", count: 2 });
 */
export function useOperation(fn, { type = "default", success } = {}) {
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fn(...args);
        setResult(data);
        const message =
          typeof success === "function" ? success(data) : (success ?? "Done");
        showToast(message, "success");
        addActivity(type, message, data);
        return data;
      } catch (err) {
        const classified = classifyError(err);
        setError(classified);
        setResult(null);
        showToast(classified.title, "error");
        addActivity("error", `${classified.title} — ${classified.message}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    // fn/success are redefined each render by callers; deliberately keyed on
    // the stable context helpers only.
    [fn, success, type, showToast, addActivity],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, result, error, run, reset, setResult };
}

export default useOperation;
