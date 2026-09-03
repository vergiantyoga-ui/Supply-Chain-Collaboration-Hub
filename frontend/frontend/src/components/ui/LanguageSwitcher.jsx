import { useI18n } from "../../i18n/I18nContext.jsx";
import { supportedLanguages } from "../../i18n/translations.js";
import styles from "./LanguageSwitcher.module.css";

const DISPLAY_LABEL = { id: "ID", en: "EN", zh: "中文" };

/**
 * `variant="floating"` (default): fixed pill anchored to the top-right of
 * the viewport. Used on pages with no top bar of their own (Login, Forgot
 * Password, Register).
 *
 * `variant="inline"`: sits naturally inside a flex row instead of floating
 * — used inside SupplierLayout / InternalReviewPage's top bar, next to the
 * logout button, so the two controls never overlap.
 */
export default function LanguageSwitcher({ variant = "floating" }) {
  const { language, setLanguage } = useI18n();

  return (
    <div className={[styles.switcher, variant === "inline" ? styles.inline : styles.floating].join(" ")}>
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
