import { useState } from "react";
import { Copy } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import StoreBadge from "../../components/common/StoreBadge";
import ErrorBanner from "../../components/common/ErrorBanner";
import JsonView from "../../components/common/JsonView";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import SplitLayout from "../../components/ui/SplitLayout";
import { duplicateProducts } from "../../api/productApi";
import { useOperation } from "../../utils/useOperation";

function DuplicateProductPage() {
  const [productId, setProductId] = useState("");
  const [numOfProducts, setNumOfProducts] = useState("1");

  const op = useOperation(duplicateProducts, {
    type: "product",
    success: (res) => `Duplicated into ${res.count} new product(s)`,
  });

  const submit = (e) => {
    e.preventDefault();
    op.run({
      productId: Number(productId),
      numOfProducts: Number(numOfProducts) || 1,
    });
  };

  return (
    <MainLayout
      title="Duplicate Product"
      subtitle="Copies are published automatically — WooCommerce creates them as drafts"
    >
      <StoreBadge />

      <SplitLayout
        sidebar={
          (op.error || op.result) && (
            <>
              {op.error && <ErrorBanner error={op.error} onDismiss={op.reset} />}

              {op.result && (
                <>
                  <Card title={`${op.result.count} copies created`}>
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
                            #{p.id} · {p.status}
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
            <FormField
              label="Source product ID"
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="119"
              required
            />

            <FormField
              label="How many copies"
              type="number"
              min="1"
              max="50"
              value={numOfProducts}
              onChange={(e) => setNumOfProducts(e.target.value)}
            />

            <Button type="submit" fullWidth icon={Copy} loading={op.loading}>
              {op.loading ? "Duplicating..." : "Duplicate"}
            </Button>
          </form>
        </Card>
      </SplitLayout>
    </MainLayout>
  );
}

export default DuplicateProductPage;
