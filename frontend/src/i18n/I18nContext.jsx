import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { translations, supportedLanguages } from "./translations.js";

const I18nContext = createContext(null);

const STORAGE_KEY = "psch.language";

function getInitialLanguage() {
  if (typeof window === "undefined") return "id";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return supportedLanguages.includes(stored) ? stored : "id";
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((lang) => {
    if (!supportedLanguages.includes(lang)) return;
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
  }, []);

  const t = useCallback(
    (key) => translations[language]?.[key] ?? translations.id[key] ?? key,
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
