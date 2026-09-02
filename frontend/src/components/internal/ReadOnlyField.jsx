import styles from "./ReadOnlyField.module.css";

export default function ReadOnlyField({ label, value, full = false, children }) {
  return (
    <div className={[styles.field, full ? styles.full : ""].filter(Boolean).join(" ")}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{children || value || "-"}</div>
    </div>
  );
}
