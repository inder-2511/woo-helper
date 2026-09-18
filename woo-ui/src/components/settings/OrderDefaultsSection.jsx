import { FilePenLine } from "lucide-react";
import { useOrderDefaults } from "../../context/OrderDefaultsContext";
import { ORDER_STATUSES } from "../../utils/orderConstants";
import Card from "../ui/Card";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

function OrderDefaultsSection() {
  const { defaults, setDefaults, resetDefaults } = useOrderDefaults();

  return (
    <Card
      title="Order defaults"
      icon={FilePenLine}
      description={
        'Used by bulk "Create Orders" — the generated billing/shipping country and the placeholder shipping line. Custom Order sets these per-order instead.'
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Default status"
          type="select"
          value={defaults.status}
          onChange={(e) => setDefaults({ status: e.target.value })}
          options={ORDER_STATUSES}
        />
        <FormField
          label="Default country"
          value={defaults.country}
          onChange={(e) => setDefaults({ country: e.target.value })}
          placeholder="US"
        />
        <FormField
          label="Shipping method title"
          value={defaults.shippingTitle}
          onChange={(e) => setDefaults({ shippingTitle: e.target.value })}
        />
        <FormField
          label="Shipping total"
          value={defaults.shippingTotal}
          onChange={(e) => setDefaults({ shippingTotal: e.target.value })}
        />
      </div>

      <Button variant="ghost" className="mt-4" onClick={resetDefaults}>
        Reset to defaults
      </Button>
    </Card>
  );
}

export default OrderDefaultsSection;
