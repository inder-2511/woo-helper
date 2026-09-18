import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useSavedAddresses } from "../../context/SavedAddressesContext";
import { useToast } from "../../context/ToastContext";

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

  const handleRemove = (a) => {
    if (!window.confirm(`Remove "${a.name}"?`)) return;
    removeAddress(a.id);
    showToast(`Removed "${a.name}"`, "success");
  };

  return (
    <div className="woo-card">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={18} className="text-purple-500" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
          Saved addresses
        </h2>
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
        Reused from order forms instead of retyping billing/shipping details.
        Stored in this browser only.
      </p>

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
        <button onClick={() => setExpanded(true)} className="woo-btn-ghost">
          <Plus size={15} />
          Add address
        </button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="woo-label">Label *</label>
              <input
                className="woo-input"
                value={draft.name}
                onChange={set("name")}
                placeholder="Home / Test customer"
              />
            </div>
            <div>
              <label className="woo-label">Company</label>
              <input
                className="woo-input"
                value={draft.company}
                onChange={set("company")}
              />
            </div>
            <div>
              <label className="woo-label">First name</label>
              <input
                className="woo-input"
                value={draft.first_name}
                onChange={set("first_name")}
              />
            </div>
            <div>
              <label className="woo-label">Last name</label>
              <input
                className="woo-input"
                value={draft.last_name}
                onChange={set("last_name")}
              />
            </div>
            <div className="col-span-2">
              <label className="woo-label">Address line 1 *</label>
              <input
                className="woo-input"
                value={draft.address_1}
                onChange={set("address_1")}
              />
            </div>
            <div className="col-span-2">
              <label className="woo-label">Address line 2</label>
              <input
                className="woo-input"
                value={draft.address_2}
                onChange={set("address_2")}
              />
            </div>
            <div>
              <label className="woo-label">City *</label>
              <input
                className="woo-input"
                value={draft.city}
                onChange={set("city")}
              />
            </div>
            <div>
              <label className="woo-label">State</label>
              <input
                className="woo-input"
                value={draft.state}
                onChange={set("state")}
              />
            </div>
            <div>
              <label className="woo-label">Postcode *</label>
              <input
                className="woo-input"
                value={draft.postcode}
                onChange={set("postcode")}
              />
            </div>
            <div>
              <label className="woo-label">Country *</label>
              <input
                className="woo-input"
                value={draft.country}
                onChange={set("country")}
                placeholder="US"
              />
            </div>
            <div>
              <label className="woo-label">Email</label>
              <input
                className="woo-input"
                value={draft.email}
                onChange={set("email")}
              />
            </div>
            <div>
              <label className="woo-label">Phone</label>
              <input
                className="woo-input"
                value={draft.phone}
                onChange={set("phone")}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="woo-btn-primary">
              Save address
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(EMPTY);
                setExpanded(false);
              }}
              className="woo-btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default SavedAddressesSection;
