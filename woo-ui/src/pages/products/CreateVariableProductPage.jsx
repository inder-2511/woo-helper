import { useState } from "react";
import { Layers } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import { Spinner } from "../../components/common/Spinner";
import { createVariableProduct } from "../../api/productApi";
import { useOperation } from "../../utils/useOperation";

const initial = {
  price: "100",
  weight: "1",
  length: "10",
  width: "10",
  height: "10",
  count: "1",
};

function CreateVariableProductPage() {
  const [form, setForm] = useState(initial);

  const op = useOperation(createVariableProduct, {
    type: "product",
    success: (res) =>
      `Created ${res.count} variable product${res.count === 1 ? "" : "s"}`,
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    op.run({ ...form, count: Number(form.count) || 1 });
  };

  return (
    <MainLayout
      title="Create Variable Products"
      subtitle="Each product gets Colour (Black/Green) and Size (S/M) attributes plus one variation"
    >
      <StoreBadge />

      <div
        className={`grid grid-cols-1 gap-5 ${
          op.error || op.result ? "xl:grid-cols-2" : "max-w-2xl"
        }`}
      >
        <div className="woo-card">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="woo-label">Variation price</label>
                <input
                  className="woo-input"
                  value={form.price}
                  onChange={set("price")}
                  required
                />
              </div>
              <div>
                <label className="woo-label">Weight</label>
                <input
                  className="woo-input"
                  value={form.weight}
                  onChange={set("weight")}
                />
              </div>
              <div>
                <label className="woo-label">Length</label>
                <input
                  className="woo-input"
                  value={form.length}
                  onChange={set("length")}
                />
              </div>
              <div>
                <label className="woo-label">Width</label>
                <input
                  className="woo-input"
                  value={form.width}
                  onChange={set("width")}
                />
              </div>
              <div>
                <label className="woo-label">Height</label>
                <input
                  className="woo-input"
                  value={form.height}
                  onChange={set("height")}
                />
              </div>
              <div>
                <label className="woo-label">How many</label>
                <input
                  className="woo-input"
                  type="number"
                  min="1"
                  max="50"
                  value={form.count}
                  onChange={set("count")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={op.loading}
              className="woo-btn-primary w-full"
            >
              {op.loading ? <Spinner /> : <Layers size={16} />}
              {op.loading ? "Creating..." : "Create variable products"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

          {op.result && (
            <>
              <div className="woo-card">
                <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-3">
                  Created {op.result.count}
                </h3>
                <ul className="space-y-2">
                  {op.result.data.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900"
                    >
                      <span className="text-gray-800 dark:text-slate-100 truncate">
                        {p.name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-3">
                        #{p.id}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <JsonView data={op.result.data} />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default CreateVariableProductPage;
