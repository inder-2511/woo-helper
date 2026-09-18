import { useEffect, useState } from "react";
import { Server, CheckCircle2, XCircle } from "lucide-react";
import { API_BASE_URL } from "../../api/axios";
import { getHealth } from "../../api/storeApi";
import { classifyError } from "../../utils/errorClassifier";
import { Spinner } from "../common/Spinner";
import Card from "../ui/Card";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700/60 last:border-0">
      <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
      <span className="text-xs font-medium text-gray-800 dark:text-slate-200 text-right break-all max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

function BackendInfoSection() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((data) => {
        if (!cancelled) setHealth(data);
      })
      .catch((err) => {
        if (!cancelled) setError(classifyError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card
      title="Backend"
      icon={Server}
      description="Set at build time via VITE_API_URL."
    >
      <div>
        <Row label="API URL" value={API_BASE_URL} />

        {loading && (
          <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
            <Spinner size={13} /> checking…
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 py-3 text-xs text-red-500">
            <XCircle size={14} />
            {error.title}
          </div>
        )}

        {health && (
          <>
            <Row
              label="Reachable"
              value={
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 size={13} /> yes
                </span>
              }
            />
            <Row
              label="Server has store keys"
              value={health.storeConfigured ? "yes" : "no"}
            />
            <Row
              label="Requires per-request credentials"
              value={health.requiresStoreCredentials ? "yes" : "no"}
            />
            <Row label="Version" value={health.version ?? "—"} />
          </>
        )}
      </div>
    </Card>
  );
}

export default BackendInfoSection;
