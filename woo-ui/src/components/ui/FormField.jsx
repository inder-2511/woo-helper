/**
 * label + control in one call — replaces the repeated
 *   <label className="woo-label">X</label><input className="woo-input" .../>
 * pair that used to be hand-written in every form. Renders text/number/
 * password/select/textarea/checkbox from one prop surface.
 */
function FormField({
  label,
  type = "text",
  value,
  onChange,
  options,
  required,
  disabled,
  placeholder,
  help,
  className = "",
  inputClassName = "",
  min,
  max,
  checked,
}) {
  if (type === "checkbox") {
    return (
      <label
        className={`flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200 ${className}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 accent-purple-600 shrink-0"
        />
        {label}
      </label>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="woo-label">
          {label}
          {required && <span className="text-purple-500 ml-0.5">*</span>}
        </label>
      )}

      {type === "select" ? (
        <select
          className={`woo-input ${inputClassName}`}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
        >
          {(options ?? []).map((o) =>
            typeof o === "string" ? (
              <option key={o} value={o}>
                {o}
              </option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ),
          )}
        </select>
      ) : type === "textarea" ? (
        <textarea
          className={`woo-input ${inputClassName || "min-h-[80px]"}`}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className={`woo-input ${inputClassName}`}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
        />
      )}

      {help && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
          {help}
        </p>
      )}
    </div>
  );
}

export default FormField;
