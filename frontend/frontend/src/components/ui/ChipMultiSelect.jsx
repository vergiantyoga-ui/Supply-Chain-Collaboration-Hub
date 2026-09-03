import styles from "./ChipMultiSelect.module.css";

export default function ChipMultiSelect({ legend, options, value = [], onChange, error }) {
  function toggle(optionValue) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <fieldset className={styles.fieldset}>
      {legend && <legend className={styles.legend}>{legend}</legend>}
      <div className={styles.chipGroup}>
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <label key={opt.value} className={[styles.chip, checked ? styles.checked : ""].join(" ")}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.value)}
                className={styles.hiddenInput}
              />
              <span className={styles.dot} aria-hidden="true" />
              {opt.label}
            </label>
          );
        })}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </fieldset>
  );
}
