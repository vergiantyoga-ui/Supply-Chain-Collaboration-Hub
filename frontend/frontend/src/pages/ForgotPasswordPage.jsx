import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";
import { requestPasswordReset } from "../api/auth.js";
import LanguageSwitcher from "../components/ui/LanguageSwitcher.jsx";
import TextField from "../components/ui/TextField.jsx";
import Button from "../components/ui/Button.jsx";
import styles from "./ForgotPasswordPage.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError(t("labelForgotEmail"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.centerScreen}>
      <LanguageSwitcher />
      <div className={styles.card}>
        <h2>{t("forgotTitle")}</h2>
        {sent ? (
          <p className={styles.successMsg}>{t("forgotSuccessMessage")}</p>
        ) : (
          <>
            <p className={styles.desc}>{t("forgotDesc")}</p>
            <form onSubmit={handleSubmit} noValidate>
              <TextField
                label={t("labelForgotEmail")}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={t("placeholderUserId")}
                error={error || undefined}
                autoComplete="email"
              />
              <Button type="submit" fullWidth loading={loading}>
                {loading ? t("btnSending") : t("btnSendReset")}
              </Button>
            </form>
          </>
        )}
        <Link to="/login" className={styles.backLink}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
