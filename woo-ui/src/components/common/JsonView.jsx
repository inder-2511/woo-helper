import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

/** Collapsible raw-JSON block — every result panel gets one. */
function JsonView({ data, label = "Raw JSON", defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  if (data === null || data === undefined) return null;

  const text = JSON.stringify(data, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the JSON is still on screen to select */
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 px-4 py-2.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300"
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {label}
        </button>

        {open && (
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-purple-500"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {open && (
        <pre className="max-h-96 overflow-auto bg-white dark:bg-slate-950 p-4 text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
          {text}
        </pre>
      )}
    </div>
  );
}

export default JsonView;
