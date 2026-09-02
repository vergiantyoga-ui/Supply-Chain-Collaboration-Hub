import { useId } from "react";
import styles from "./Field.module.css";

export default function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
  error,
  required,
  disabled,
  ...rest
}) {
  const id = useId();

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={[styles.control, styles.textarea, error ? styles.invalid : ""].filter(Boolean).join(" ")}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className={styles.error}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
