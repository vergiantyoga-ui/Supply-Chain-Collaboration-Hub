import { useI18n } from "../../i18n/I18nContext.jsx";
import styles from "./StatusPill.module.css";

const LABEL_KEY = {
  pending: "statusPending",
  approved: "statusApproved",
  rejected: "statusRejected",
};

export default function StatusPill({ status }) {
  const { t } = useI18n();
  return <span className={[styles.pill, styles[status] || ""].join(" ")}>{t(LABEL_KEY[status] || status)}</span>;
}
