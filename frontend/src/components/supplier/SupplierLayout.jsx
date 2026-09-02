import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./SupplierLayout.module.css";

export default function SupplierLayout() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <div className={styles.topbar}>
        <div className={styles.brandMark}>
          <span className={styles.glyph}>PC</span> {t("appName")}
        </div>
        <div className={styles.topbarRight}>
          {user?.email && <span className={styles.userName}>{user.email}</span>}
          <button type="button" className={styles.logoutLink} onClick={handleLogout}>
            {t("logoutButton")}
          </button>
        </div>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/supplier/profile" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ""].filter(Boolean).join(" ")}>
          {t("navProfile")}
        </NavLink>
        <NavLink to="/supplier/rfx" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ""].filter(Boolean).join(" ")}>
          {t("navRfx")}
        </NavLink>
        <NavLink
          to="/supplier/quotations"
          className={({ isActive }) => [styles.navLink, isActive ? styles.active : ""].filter(Boolean).join(" ")}
        >
          {t("navQuotations")}
        </NavLink>
      </nav>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
