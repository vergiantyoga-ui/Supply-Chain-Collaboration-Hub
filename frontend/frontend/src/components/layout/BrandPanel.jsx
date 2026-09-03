import { useI18n } from "../../i18n/I18nContext.jsx";
import styles from "./BrandPanel.module.css";

export default function BrandPanel() {
  const { t } = useI18n();

  return (
    <div className={styles.panel}>
      <svg className={styles.routeSvg} viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="40" cy="60" r="4" fill="#D98E2B" />
        <circle cx="150" cy="30" r="4" fill="#8CA0C4" />
        <circle cx="270" cy="90" r="4" fill="#8CA0C4" />
        <circle cx="220" cy="180" r="4" fill="#D98E2B" />
        <circle cx="90" cy="200" r="4" fill="#8CA0C4" />
        <circle cx="60" cy="270" r="4" fill="#8CA0C4" />
        <circle cx="300" cy="240" r="4" fill="#8CA0C4" />
        <path d="M40 60 L150 30 L270 90 L220 180 L90 200 L60 270 M220 180 L300 240" stroke="#4A6088" strokeWidth="1" />
      </svg>

      <div className={styles.brandMark}>
        <span className={styles.glyph}>PC</span> {t("appName")}
      </div>

      <div className={styles.copy}>
        <h1>{t("brandHeadline")}</h1>
        <p>{t("brandSub")}</p>
        <div className={styles.statRow}>
          <div className={styles.stat}>
            <b>1.400+</b>
            <span>{t("statSuppliers")}</span>
          </div>
          <div className={styles.stat}>
            <b>2</b>
            <span>{t("statCountries")}</span>
          </div>
          <div className={styles.stat}>
            <b>24/7</b>
            <span>{t("statSupport")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
