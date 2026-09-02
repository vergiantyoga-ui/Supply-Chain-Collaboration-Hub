import styles from "./Tabs.module.css";

/**
 * Generic stepped-tabs component shared by the Supplier Registration form
 * and the Internal Review detail panel. `steps` is an array of
 * { key, label, done? }. `activeKey` controls the highlighted tab.
 */
export default function Tabs({ steps, activeKey, onChange, numbered = true }) {
  return (
    <div className={styles.tabs} role="tablist">
      {steps.map((step, index) => {
        const isActive = step.key === activeKey;
        return (
          <button
            key={step.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[styles.tabBtn, isActive ? styles.active : ""].filter(Boolean).join(" ")}
            onClick={() => onChange(step.key)}
          >
            {numbered && (
              <span className={[styles.num, step.done ? styles.done : ""].filter(Boolean).join(" ")}>
                {index + 1}
              </span>
            )}
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
