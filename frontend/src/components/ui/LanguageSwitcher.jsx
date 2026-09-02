import { useI18n } from "../../i18n/I18nContext.jsx";
import { supportedLanguages } from "../../i18n/translations.js";
import styles from "./LanguageSwitcher.module.css";

const DISPLAY_LABEL = { id: "ID", en: "EN", zh: "中文" };

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className={styles.switcher}>
      {supportedLanguages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={[styles.btn, lang === language ? styles.active : ""].filter(Boolean).join(" ")}
          aria-pressed={lang === language}
        >
          {DISPLAY_LABEL[lang]}
        </button>
      ))}
    </div>
  );
}
