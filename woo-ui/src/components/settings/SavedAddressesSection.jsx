import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useSavedAddresses } from "../../context/SavedAddressesContext";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

const EMPTY = {
  name: "",
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "US",
  email: "",
  phone: "",
};

const summary = (a) =>
  [a.address_1, a.city, a.state, a.postcode, a.country]
    .filter(Boolean)
    .join(", ");

function SavedAddressesSection() {
  const { addresses, addAddress, removeAddress } = useSavedAddresses();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [draft, setDraft] = useState(EMPTY);
  const [expanded, setExpanded] = useState(false);

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const handleAdd = (e) => {
    e.preventDefault();
    const record = addAddress(draft);
    if (!record) {
      showToast(
        "Label, address line 1, city, country and postcode are required",
        "error",
      );
      return;
    }
    setDraft(EMPTY);
    setExpanded(false);
    showToast(`Saved "${record.name}"`, "success");
  };

  const handleRemove = async (a) => {
    if (!(await confirm(`Remove "${a.name}"?`))) return;
    removeAddress(a.id);
    showToast(`Removed "${a.name}"`, "success");
  };

  return (
    <Card
      title="Saved addresses"
      icon={MapPin}
      description="Reused from order forms instead of retyping billing/shipping details. Stored in this browser only. Two examples are seeded on first run — edit or remove them as you like."
    >
      {addresses.length > 0 && (
        <ul className="space-y-2 mb-5">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 px-4 py-3 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                  {a.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {summary(a)}
                </p>
              </div>
              <button
                onClick={() => handleRemove(a)}
                className="text-gray-400 hover:text-red-500 shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!expanded ? (
        <Button variant="ghost" icon={Plus} onClick={() => setExpanded(true)}>
          Add address
        </Button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Label"
              required
              value={draft.name}
              onChange={set("name")}
              placeholder="Home / Test customer"
            />
            <FormField
              label="Company"
              value={draft.company}
              onChange={set("company")}
            />
            <FormField
              label="First name"
              value={draft.first_name}
              onChange={set("first_name")}
            />
            <FormField
              label="Last name"
              value={draft.last_name}
              onChange={set("last_name")}
            />
            <FormField
              className="col-span-2"
              label="Address line 1"
              required
              value={draft.address_1}
              onChange={set("address_1")}
            />
            <FormField
              className="col-span-2"
              label="Address line 2"
              value={draft.address_2}
              onChange={set("address_2")}
            />
            <FormField
              label="City"
              required
              value={draft.city}
              onChange={set("city")}
            />
            <FormField
              label="State"
              value={draft.state}
              onChange={set("state")}
            />
            <FormField
              label="Postcode"
              required
              value={draft.postcode}
              onChange={set("postcode")}
            />
            <FormField
              label="Country"
              required
              value={draft.country}
              onChange={set("country")}
              placeholder="US"
            />
            <FormField
              label="Email"
              value={draft.email}
              onChange={set("email")}
            />
            <FormField
              label="Phone"
              value={draft.phone}
              onChange={set("phone")}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save address</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDraft(EMPTY);
                setExpanded(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default SavedAddressesSection;
