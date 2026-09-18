import { useState } from "react";
import { MapPin } from "lucide-react";
import { useSavedAddresses } from "../../context/SavedAddressesContext";
import { Link } from "react-router-dom";

const FIELDS = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "company", label: "Company" },
  { key: "address_1", label: "Address line 1", required: true },
  { key: "address_2", label: "Address line 2" },
  { key: "city", label: "City", required: true },
  { key: "state", label: "State / province" },
  { key: "postcode", label: "Postcode", required: true },
  { key: "country", label: "Country", required: true, placeholder: "US" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

/**
 * Address input for order forms: pick a saved address to prefill, or type
 * one manually. `value`/`onChange` carry a plain Woo-shaped address object
 * (address_1/postcode/state/country field names).
 */
function AddressPicker({ value, onChange, label = "Address" }) {
  const { addresses } = useSavedAddresses();
  const [selectedId, setSelectedId] = useState("");

  const set = (key) => (e) =>
    onChange({ ...value, [key]: e.target.value });

  const handlePick = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) return;
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      const { id: _id, name: _name, ...fields } = addr;
      onChange({ ...value, ...fields });
    }
  };

  return (
    <div className="space-y-3">
      {(label || addresses.length === 0) && (
        <div className="flex items-center justify-between">
          {label && <label className="woo-label mb-0">{label}</label>}
          {addresses.length === 0 && (
            <Link
              to="/settings"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 ml-auto"
            >
              <MapPin size={12} />
              Save addresses in Settings
            </Link>
          )}
        </div>
      )}

      {addresses.length > 0 && (
        <select className="woo-input" value={selectedId} onChange={handlePick}>
          <option value="">— fill from a saved address —</option>
          {addresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <input
            key={f.key}
            className={`woo-input ${f.key === "address_1" ? "col-span-2" : ""}`}
            value={value?.[f.key] ?? ""}
            onChange={set(f.key)}
            placeholder={f.placeholder ?? f.label}
            required={f.required}
          />
        ))}
      </div>
    </div>
  );
}

export default AddressPicker;
