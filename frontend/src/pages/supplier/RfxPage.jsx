import { useEffect, useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { listRfx } from "../../api/rfx.js";
import StatusPill from "../../components/ui/StatusPill.jsx";
import Button from "../../components/ui/Button.jsx";
import styles from "./RfxPage.module.css";

const TYPE_KEY = { rfi: "rfxTypeRfi", rfp: "rfxTypeRfp", rfq: "rfxTypeRfq" };

export default function RfxPage() {
  const { t, language } = useI18n();
  const { showToast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    listRfx()
      .then(setList)
      .catch((err) => showToast(err.message, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locale = language === "zh" ? "zh-CN" : language === "en" ? "en-US" : "id-ID";

  return (
    <div>
      <div className={styles.head}>
        <h1>{t("rfxTitle")}</h1>
        <p>{t("rfxSubtitle")}</p>
      </div>

      {loading ? (
        <p className={styles.loading}>{t("loadingLabel")}</p>
      ) : list.length === 0 ? (
        <p className={styles.empty}>{t("emptyRfx")}</p>
      ) : (
        <div className={styles.table}>
          <div className={[styles.row, styles.headerRow].join(" ")}>
            <span>{t("colCode")}</span>
            <span>{t("colTitleRfx")}</span>
            <span>{t("colType")}</span>
            <span>{t("colDeadline")}</span>
            <span>{t("colStatus")}</span>
          </div>
          {list.map((rfx) => (
            <button key={rfx.id} type="button" className={styles.row} onClick={() => setSelected(rfx)}>
              <span className={styles.code}>{rfx.code}</span>
              <span>{rfx.title}</span>
              <span>{t(TYPE_KEY[rfx.type])}</span>
              <span>{new Date(rfx.deadline).toLocaleDateString(locale)}</span>
              <span>
                <StatusPill variant={rfx.status === "open" ? "success" : "neutral"} label={t(rfx.status === "open" ? "statusOpen" : "statusClosed")} />
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <div>
              <h3>{selected.title}</h3>
              <div className={styles.detailMeta}>
                {selected.code} · {t(TYPE_KEY[selected.type])}
              </div>
            </div>
            <StatusPill variant={selected.status === "open" ? "success" : "neutral"} label={t(selected.status === "open" ? "statusOpen" : "statusClosed")} />
          </div>
          <p className={styles.detailDesc}>{selected.description}</p>
          <div className={styles.detailMeta}>
            {t("colDeadline")}: {new Date(selected.deadline).toLocaleString(locale)}
          </div>
          <Button variant="ghost" onClick={() => setSelected(null)} style={{ marginTop: 16 }}>
            {t("btnCloseDetail")}
          </Button>
        </div>
      )}
    </div>
  );
}
