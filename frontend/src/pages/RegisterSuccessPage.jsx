import { Link, Navigate, useLocation } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";
import Button from "../components/ui/Button.jsx";
import styles from "./ForgotPasswordPage.module.css";

export default function RegisterSuccessPage() {
  const { t } = useI18n();
  const location = useLocation();
  const submissionCode = location.state?.submissionCode;

  if (!submissionCode) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className={styles.centerScreen}>
      <div className={styles.card}>
        <h2>{t("registerSuccessTitle")}</h2>
        <p className={styles.desc}>{t("registerSuccessDesc")}</p>
        <p className={styles.successMsg} style={{ fontFamily: "var(--font-display)", fontSize: "18px" }}>
          {submissionCode}
        </p>
        <Link to="/login">
          <Button fullWidth>{t("registerSuccessBack")}</Button>
        </Link>
      </div>
    </div>
  );
}
