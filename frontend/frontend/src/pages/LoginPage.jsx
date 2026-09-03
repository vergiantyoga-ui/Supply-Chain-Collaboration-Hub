import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import BrandPanel from "../components/layout/BrandPanel.jsx";
import LanguageSwitcher from "../components/ui/LanguageSwitcher.jsx";
import TextField from "../components/ui/TextField.jsx";
import Button from "../components/ui/Button.jsx";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { t } = useI18n();
  const { login, loginWithSso } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError(t("loginErrorGeneric"));
      return;
    }
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      redirectByRole(result.user.role);
    } catch (err) {
      setError(err.message || t("loginErrorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSso() {
    setSsoLoading(true);
    try {
      const result = await loginWithSso();
      redirectByRole(result.user.role);
    } catch (err) {
      showToast(err.message || t("loginErrorGeneric"), "error");
    } finally {
      setSsoLoading(false);
    }
  }

  function redirectByRole(role) {
    navigate(role === "internal_staff" ? "/internal" : "/supplier/profile", { replace: true });
  }

  return (
    <div className={styles.grid}>
      <LanguageSwitcher />
      <BrandPanel />

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <h2>{t("loginTitle")}</h2>
          <p className={styles.sub}>{t("loginSub")}</p>

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label={t("labelUserId")}
              type="text"
              value={email}
              onChange={setEmail}
              placeholder={t("placeholderUserId")}
              hint={t("loginDemoHint")}
              autoComplete="username"
            />
            <TextField
              label={t("labelPassword")}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={t("placeholderPassword")}
              autoComplete="current-password"
              error={error || undefined}
            />

            <div className={styles.rowBetween}>
              <label className={styles.checkboxInline}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                {t("rememberMe")}
              </label>
              <Link to="/forgot-password" className={styles.linkAmber}>
                {t("forgotLink")}
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} disabled={ssoLoading}>
              {loading ? t("btnLoggingIn") : t("btnLogin")}
            </Button>
          </form>

          <div className={styles.divider}>{t("dividerOr")}</div>

          <Button variant="secondary" fullWidth loading={ssoLoading} disabled={loading} onClick={handleSso}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {t("btnSso")}
          </Button>

          <div className={styles.footer}>
            {t("footerNewSupplier")} <Link to="/register" className={styles.linkAmber}>{t("footerRegisterLink")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
