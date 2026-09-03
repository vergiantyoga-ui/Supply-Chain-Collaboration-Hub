import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLookups } from "../utils/useLookups.js";
import { listSubmissions, getSubmission } from "../api/suppliers.js";
import QueueList from "../components/internal/QueueList.jsx";
import SubmissionDetail from "../components/internal/SubmissionDetail.jsx";
import LanguageSwitcher from "../components/ui/LanguageSwitcher.jsx";
import styles from "./InternalReviewPage.module.css";

export default function InternalReviewPage() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lookups } = useLookups();

  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async (preserveSelection = true) => {
    const list = await listSubmissions();
    setSubmissions(list);
    if (!preserveSelection || !selectedId) {
      if (list.length > 0) setSelectedId(list[0].id);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    setLoading(true);
    listSubmissions()
      .then((list) => {
        setSubmissions(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    getSubmission(selectedId).then((data) => {
      if (!cancelled) setDetail(data);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleDecided() {
    const list = await loadQueue(true);
    const updated = await getSubmission(selectedId);
    setDetail(updated);
    setSubmissions(list);
  }

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
          {user?.fullName && <span className={styles.userName}>{user.fullName}</span>}
          <LanguageSwitcher variant="inline" />
          <button type="button" className={styles.logoutLink} onClick={handleLogout}>
            {t("logoutButton")}
          </button>
        </div>
      </div>

      <div className={styles.head}>
        <h1>{t("internalTitle")}</h1>
        <p>{t("internalSubtitle")}</p>
      </div>

      {loading ? (
        <p className={styles.loading}>{t("loadingLabel")}</p>
      ) : (
        <div className={styles.grid}>
          <QueueList submissions={submissions} selectedId={selectedId} onSelect={setSelectedId} />
          <SubmissionDetail submission={detail} lookups={lookups} onDecided={handleDecided} />
        </div>
      )}
    </div>
  );
}
