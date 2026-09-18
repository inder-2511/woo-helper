import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "woo-btn-primary",
  danger: "woo-btn-danger",
  ghost: "woo-btn-ghost",
};

/**
 * Every button in the app: icon on the left, a loading spinner swaps in for
 * the icon while `loading` is true, disabled state handled once here
 * instead of `disabled={op.loading}` scattered through every page.
 */
function Button({
  variant = "primary",
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  size,
  children,
  className = "",
  type = "button",
  ...rest
}) {
  const sizeCls = size === "sm" ? "px-3 py-1.5 text-xs" : "";
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${VARIANTS[variant] ?? VARIANTS.primary} ${
        fullWidth ? "w-full" : ""
      } ${sizeCls} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 13 : 16} className="btn-spinner" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 13 : 16} />
      ) : null}
      {children}
    </button>
  );
}

export default Button;
