import styles from "./Button.module.css";

const VARIANT_CLASS = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  success: styles.success,
  dangerOutline: styles.dangerOutline,
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  children,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[styles.btn, VARIANT_CLASS[variant] || styles.primary, fullWidth ? styles.fullWidth : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
