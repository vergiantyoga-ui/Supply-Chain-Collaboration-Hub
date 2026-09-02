import { useI18n } from "../../i18n/I18nContext.jsx";
import StatusPill from "../ui/StatusPill.jsx";
import styles from "./QueueList.module.css";

export default function QueueList({ submissions, selectedId, onSelect }) {
  const { t } = useI18n();
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className={styles.panel}>
      <h3>{t("queueTitle")}</h3>
      <p className={styles.count}>
        {pendingCount} {t("queuePendingLabel")}
      </p>

      {submissions.length === 0 && <p className={styles.empty}>{t("emptyQueue")}</p>}

      {submissions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          className={[styles.item, s.id === selectedId ? styles.active : ""].filter(Boolean).join(" ")}
        >
          <div className={styles.name}>{s.vendorName}</div>
          <div className={styles.meta}>
            {s.submissionCode} · {s.vendorType}
          </div>
          <StatusPill status={s.status} />
        </button>
      ))}
    </div>
  );
}
