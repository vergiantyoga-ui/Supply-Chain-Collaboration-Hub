import { useI18n } from "../../i18n/I18nContext.jsx";
import styles from "./StatusPill.module.css";

const LABEL_KEY = {
  pending: "statusPending",
  approved: "statusApproved",
  rejected: "statusRejected",
};

const VARIANT_CLASS = {
  pending: styles.pending,
  approved: styles.approved,
  rejected: styles.rejected,
  success: styles.approved,
  neutral: styles.rejected,
};

/** `status` drives both the color and (unless `label` is given) the text. */
export default function StatusPill({ status, label, variant }) {
  const { t } = useI18n();
  const colorKey = variant || status;
  return <span className={[styles.pill, VARIANT_CLASS[colorKey] || ""].join(" ")}>{label || t(LABEL_KEY[status] || status)}</span>;
}
