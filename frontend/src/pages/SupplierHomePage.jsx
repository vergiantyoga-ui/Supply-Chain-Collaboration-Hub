import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import styles from "./ForgotPasswordPage.module.css";

export default function SupplierHomePage() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.centerScreen}>
      <div className={styles.card}>
        <h2>{t("appName")}</h2>
        <p className={styles.desc}>
          {user?.email ? `${user.email} — ` : ""}
          Portal pemasok pasca-login (beranda, status pesanan, dokumen) berada di luar cakupan PRD ini dan akan
          dibahas pada dokumen kebutuhan produk terpisah.
        </p>
        <Button fullWidth onClick={handleLogout}>
          {t("logoutButton")}
        </Button>
      </div>
    </div>
  );
}
