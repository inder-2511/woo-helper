import { useState } from "react";
import { Search, Layers } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SplitLayout from "../../components/ui/SplitLayout";
import { retrieveProduct, listVariations } from "../../api/productApi";
import { useOperation } from "../../utils/useOperation";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 dark:border-slate-700/60 last:border-0">
      <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">
        {label}
      </span>
      <span className="text-xs font-medium text-gray-800 dark:text-slate-200 text-right break-words">
        {value === null || value === undefined || value === "" ? "—" : value}
      </span>
    </div>
  );
}

function FetchProductPage() {
  const [productId, setProductId] = useState("");

  const fetchOp = useOperation(retrieveProduct, {
    type: "product",
    success: (res) => `Fetched "${res.data?.name}"`,
  });

  const variationsOp = useOperation(listVariations, {
    type: "product",
    success: (res) => `Loaded ${res.count} variations`,
  });

  const submit = (e) => {
    e.preventDefault();
    variationsOp.reset();
    fetchOp.run(Number(productId));
  };

  const product = fetchOp.result?.data;

  return (
    <MainLayout
      title="Fetch Product"
      subtitle="Look up a single product and inspect its raw payload"
    >
      <StoreBadge />

      <SplitLayout
        sidebar={
          (fetchOp.error || variationsOp.error || product) && (
            <>
              {fetchOp.error && (
                <ErrorBanner error={fetchOp.error} onDismiss={fetchOp.reset} />
              )}
              {variationsOp.error && (
                <ErrorBanner
                  error={variationsOp.error}
                  onDismiss={variationsOp.reset}
                />
              )}

              {product && (
                <>
                  <Card title={product.name}>
                    <Row label="ID" value={product.id} />
                    <Row label="Type" value={product.type} />
                    <Row label="Status" value={product.status} />
                    <Row label="SKU" value={product.sku} />
                    <Row label="Price" value={product.price} />
                    <Row
                      label="Regular price"
                      value={product.regular_price}
                    />
                    <Row label="Stock" value={product.stock_quantity} />
                    <Row label="Weight" value={product.weight} />
                    <Row
                      label="Dimensions"
                      value={
                        product.dimensions
                          ? `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height}`
                          : "—"
                      }
                    />
                    <Row label="Permalink" value={product.permalink} />

                    {product.type === "variable" && (
                      <Button
                        variant="ghost"
                        className="mt-4"
                        icon={Layers}
                        loading={variationsOp.loading}
                        onClick={() => variationsOp.run(product.id)}
                      >
                        Load variations
                      </Button>
                    )}
                  </Card>

                  {variationsOp.result && (
                    <Card title={`${variationsOp.result.count} variations`}>
                      <ul className="space-y-1.5">
                        {variationsOp.result.data.map((v) => (
                          <li
                            key={v.id}
                            className="text-sm text-gray-600 dark:text-slate-300"
                          >
                            #{v.id} — {v.price}{" "}
                            <span className="text-xs text-gray-400">
                              {(v.attributes ?? [])
                                .map((a) => `${a.name}: ${a.option}`)
                                .join(", ")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  <JsonView data={product} defaultOpen />
                </>
              )}
            </>
          )
        }
      >
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <FormField
              label="Product ID"
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="119"
              required
            />
            <Button
              type="submit"
              fullWidth
              icon={Search}
              loading={fetchOp.loading}
            >
              Fetch product
            </Button>
          </form>
        </Card>
      </SplitLayout>
    </MainLayout>
  );
}

export default FetchProductPage;
