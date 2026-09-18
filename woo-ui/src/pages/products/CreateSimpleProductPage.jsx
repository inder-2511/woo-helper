import { useState } from "react";
import { PlusCircle } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SplitLayout from "../../components/ui/SplitLayout";
import { createSimpleProduct } from "../../api/productApi";
import { useOperation } from "../../utils/useOperation";

const initial = {
  price: "100",
  weight: "1",
  length: "10",
  width: "10",
  height: "10",
  count: "1",
};

function CreateSimpleProductPage() {
  const [form, setForm] = useState(initial);

  const op = useOperation(createSimpleProduct, {
    type: "product",
    success: (res) =>
      `Created ${res.count} simple product${res.count === 1 ? "" : "s"}`,
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    op.run({ ...form, count: Number(form.count) || 1 });
  };

  return (
    <MainLayout
      title="Create Simple Products"
      subtitle="Names, SKUs and descriptions are generated; you set the numbers"
    >
      <StoreBadge />

      <SplitLayout
        sidebar={
          (op.error || op.result) && (
            <>
              {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

              {op.result && (
                <>
                  <Card title={`Created ${op.result.count}`}>
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
                  </Card>
                  <JsonView data={op.result.data} />
                </>
              )}
            </>
          )
        }
      >
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Regular price"
                value={form.price}
                onChange={set("price")}
                required
              />
              <FormField
                label="Weight"
                value={form.weight}
                onChange={set("weight")}
              />
              <FormField
                label="Length"
                value={form.length}
                onChange={set("length")}
              />
              <FormField
                label="Width"
                value={form.width}
                onChange={set("width")}
              />
              <FormField
                label="Height"
                value={form.height}
                onChange={set("height")}
              />
              <FormField
                label="How many"
                type="number"
                min="1"
                max="100"
                value={form.count}
                onChange={set("count")}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              icon={PlusCircle}
              loading={op.loading}
            >
              {op.loading ? "Creating..." : "Create products"}
            </Button>
          </form>
        </Card>
      </SplitLayout>
    </MainLayout>
  );
}

export default CreateSimpleProductPage;
