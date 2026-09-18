import { useState } from "react";
import { Save } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ProductPicker from "../../components/common/ProductPicker";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SplitLayout from "../../components/ui/SplitLayout";
import { updateProduct } from "../../api/productApi";
import { useOperation } from "../../utils/useOperation";

const STATUS_OPTIONS = ["publish", "draft", "pending", "private"];

/** Only the fields the user ticks are sent, so an update never clobbers a
 * field they didn't mean to touch. */
const FIELDS = [
  { key: "regular_price", label: "Regular price", type: "text" },
  { key: "sale_price", label: "Sale price", type: "text" },
  { key: "stock_quantity", label: "Stock quantity", type: "number" },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
  { key: "weight", label: "Weight", type: "text" },
  { key: "sku", label: "SKU", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
];

function UpdateProductPage() {
  const [product, setProduct] = useState({ productId: "", name: "" });
  const [enabled, setEnabled] = useState({});
  const [values, setValues] = useState({ status: "publish" });

  const op = useOperation(updateProduct, {
    type: "product",
    success: (res) => `Updated "${res.data?.name}"`,
  });

  const toggle = (k) => setEnabled((e) => ({ ...e, [k]: !e[k] }));

  const updateDetails = {};
  for (const f of FIELDS) {
    if (enabled[f.key] && values[f.key] !== undefined) {
      updateDetails[f.key] = values[f.key];
    }
  }
  const nothingSelected = Object.keys(updateDetails).length === 0;

  const submit = (e) => {
    e.preventDefault();
    op.run(Number(product.productId), updateDetails);
  };

  return (
    <MainLayout
      title="Update Product"
      subtitle="Tick only the fields you want to change — untouched fields are left alone"
    >
      <StoreBadge />

      <SplitLayout
        sidebar={
          (op.error || op.result || !nothingSelected) && (
            <>
              {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

              {!nothingSelected && (
                <JsonView
                  data={updateDetails}
                  label="Payload that will be sent"
                  defaultOpen
                />
              )}

              {op.result && (
                <JsonView data={op.result.data} label="Updated product" />
              )}
            </>
          )
        }
      >
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="woo-label">Product</label>
              <ProductPicker value={product} onChange={setProduct} />
            </div>

            <div className="space-y-3 pt-2">
              {FIELDS.map((f) => (
                <div key={f.key} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={!!enabled[f.key]}
                    onChange={() => toggle(f.key)}
                    className="w-4 h-4 accent-purple-600 shrink-0 mt-2"
                  />
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 w-32 shrink-0 mt-2.5">
                    {f.label}
                  </span>
                  <FormField
                    className="flex-1"
                    type={f.type}
                    options={f.options}
                    disabled={!enabled[f.key]}
                    value={values[f.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>

            <Button
              type="submit"
              fullWidth
              icon={Save}
              loading={op.loading}
              disabled={nothingSelected || !product.productId}
            >
              {!product.productId
                ? "Pick a product first"
                : nothingSelected
                  ? "Tick a field to enable"
                  : "Update product"}
            </Button>
          </form>
        </Card>
      </SplitLayout>
    </MainLayout>
  );
}

export default UpdateProductPage;
