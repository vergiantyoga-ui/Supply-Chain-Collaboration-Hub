import { useId, useState } from "react";
import styles from "./Field.module.css";

export default function TextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
  error,
  required,
  disabled,
  autoComplete,
  ...rest
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (revealed ? "text" : "password") : type;

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={isPassword ? styles.pwWrap : undefined}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={[styles.control, error ? styles.invalid : ""].filter(Boolean).join(" ")}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.pwToggle}
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        )}
      </div>
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
