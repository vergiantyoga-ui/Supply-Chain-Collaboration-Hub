import { Link } from "react-router-dom";
import styles from "./ForgotPasswordPage.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.centerScreen}>
      <div className={styles.card} style={{ textAlign: "center" }}>
        <h2>404</h2>
        <p className={styles.desc}>Halaman yang Anda cari tidak ditemukan.</p>
        <Link to="/login" className={styles.backLink} style={{ justifyContent: "center", width: "100%" }}>
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
