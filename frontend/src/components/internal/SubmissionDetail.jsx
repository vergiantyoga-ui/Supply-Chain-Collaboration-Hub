import { useEffect, useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { approveSubmission, rejectSubmission } from "../../api/suppliers.js";
import Tabs from "../ui/Tabs.jsx";
import StatusPill from "../ui/StatusPill.jsx";
import Button from "../ui/Button.jsx";
import TextareaField from "../ui/TextareaField.jsx";
import ReadOnlyField from "./ReadOnlyField.jsx";
import gridStyles from "./ReadOnlyField.module.css";
import styles from "./SubmissionDetail.module.css";

const ENTITY_TITLE_LABEL = { PT: "PT", CV: "CV", CoLtd: "Co. Ltd.", Firma: "optFirma", Koperasi: "optKoperasi" };

function fieldLabel(t, key) {
  return t(key).replace(/\s*\*$/, "");
}

export default function SubmissionDetail({ submission, lookups, onDecided }) {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("general");
  const [visited, setVisited] = useState(new Set(["general"]));
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setActiveTab("general");
    setVisited(new Set(["general"]));
    setRejectOpen(false);
    setRejectReason("");
    setRejectError("");
  }, [submission?.id]);

  if (!submission) {
    return (
      <div className={styles.panel}>
        <p className={styles.hint}>{t("selectQueueHint")}</p>
      </div>
    );
  }

  function goToTab(tab) {
    setVisited((v) => new Set(v).add(tab));
    setActiveTab(tab);
  }

  const allVisited = visited.has("general") && visited.has("address") && visited.has("contact");

  const vendorTypeLabelKey = { raw_material: "optRawMaterial", packaging_material: "optPackaging", indirect_material: "optIndirect" };
  const detailEntry = lookups?.vendorTypeDetails?.find((d) => d.code === submission.vendorTypeDetail);
  const countryEntry = lookups?.geo?.[submission.address?.country];
  const stateEntry = countryEntry?.states?.[submission.address?.state];
  const cityLabel = stateEntry?.cities?.[submission.address?.city]?.[language];

  const steps = [
    { key: "general", label: t("stepGeneral") },
    { key: "address", label: t("stepAddress") },
    { key: "contact", label: t("stepContact") },
  ];

  async function handleApprove() {
    setBusy(true);
    try {
      await approveSubmission(submission.id, user?.email);
      showToast(t("toastApproved"), "success");
      onDecided();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmReject() {
    if (!rejectReason.trim()) {
      setRejectError(t("labelRejectReason"));
      return;
    }
    setBusy(true);
    try {
      await rejectSubmission(submission.id, rejectReason.trim(), user?.email);
      showToast(t("toastRejected"), "success");
      onDecided();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2>{submission.vendorName}</h2>
          <div className={styles.sub}>
            {submission.submissionCode} · {t(submission.legalStatus === "badan_usaha" ? "optBadanUsaha" : "optPerorangan")}
            {submission.entityTitle ? ` (${ENTITY_TITLE_LABEL[submission.entityTitle]?.startsWith("opt") ? t(ENTITY_TITLE_LABEL[submission.entityTitle]) : ENTITY_TITLE_LABEL[submission.entityTitle] || submission.entityTitle})` : ""}
          </div>
        </div>
        <StatusPill status={submission.status} />
      </div>
      <div className={styles.meta}>
        {t("detailSubmittedLabel")} {new Date(submission.submittedAt).toLocaleDateString(localeFor(language))}
      </div>

      <Tabs steps={steps} activeKey={activeTab} onChange={goToTab} numbered={false} />

      {activeTab === "general" && (
        <div className={gridStyles.grid}>
          <ReadOnlyField label={fieldLabel(t, "labelLegalStatus")} value={t(submission.legalStatus === "badan_usaha" ? "optBadanUsaha" : "optPerorangan")} />
          <ReadOnlyField
            label={fieldLabel(t, "labelEntityTitle")}
            value={
              submission.entityTitle
                ? ENTITY_TITLE_LABEL[submission.entityTitle]?.startsWith("opt")
                  ? t(ENTITY_TITLE_LABEL[submission.entityTitle])
                  : ENTITY_TITLE_LABEL[submission.entityTitle] || submission.entityTitle
                : "-"
            }
          />
          <ReadOnlyField label={fieldLabel(t, "labelVendorName")} value={submission.vendorName} />
          <ReadOnlyField label={fieldLabel(t, "labelVendorType")} value={t(vendorTypeLabelKey[submission.vendorType])} />
          <ReadOnlyField label={fieldLabel(t, "labelVendorTypeDetail")} value={detailEntry?.label?.[language] || submission.vendorTypeDetail} />
          <ReadOnlyField label={t("companyLabel")} full>
            {(submission.companies || []).map((c) => (
              <span key={c} className={gridStyles.chip}>
                {c}
              </span>
            ))}
          </ReadOnlyField>
          <ReadOnlyField label={fieldLabel(t, "labelStatusOtv")} value={t(submission.statusOtv === "one_time" ? "optOneTime" : "optRegular")} />
          <div />
          <ReadOnlyField label={fieldLabel(t, "labelMobilePhone")} value={submission.mobilePhone} />
          <ReadOnlyField label={fieldLabel(t, "labelPhone")} value={submission.phone} />
          <ReadOnlyField label={fieldLabel(t, "labelEmail")} value={submission.email} />
          <ReadOnlyField label={fieldLabel(t, "labelWebsite")} value={submission.website} />
        </div>
      )}

      {activeTab === "address" && (
        <div className={gridStyles.grid}>
          <ReadOnlyField label={fieldLabel(t, "labelAddress")} value={submission.address?.address} full />
          <ReadOnlyField label={fieldLabel(t, "labelCountry")} value={countryEntry?.label?.[language] || submission.address?.country} />
          <ReadOnlyField label={fieldLabel(t, "labelState")} value={stateEntry?.label?.[language] || submission.address?.state} />
          <ReadOnlyField label={fieldLabel(t, "labelCity")} value={cityLabel || submission.address?.city} />
          <ReadOnlyField label={fieldLabel(t, "labelZip")} value={submission.address?.zip} />
          <ReadOnlyField label={fieldLabel(t, "labelDistrict")} value={submission.address?.district} />
          <ReadOnlyField label={fieldLabel(t, "labelSubdistrict")} value={submission.address?.subdistrict} />
        </div>
      )}

      {activeTab === "contact" && (
        <div className={gridStyles.grid}>
          <ReadOnlyField label={fieldLabel(t, "labelContactName")} value={submission.contact?.contactName} />
          <ReadOnlyField label={fieldLabel(t, "labelContactTitle")} value={t({ miss: "optMiss", mr: "optMr", madam: "optMadam" }[submission.contact?.title])} />
          <ReadOnlyField
            label={fieldLabel(t, "labelJobPosition")}
            value={t({ finance: "optFinance", sales: "optSales", quality: "optQuality", other: "optOther" }[submission.contact?.jobPosition])}
          />
          <ReadOnlyField label={fieldLabel(t, "labelContactEmail")} value={submission.contact?.email} />
          <ReadOnlyField label={fieldLabel(t, "labelContactPhone")} value={submission.contact?.phone} />
          <ReadOnlyField label={fieldLabel(t, "labelContactMobile")} value={submission.contact?.mobilePhone} />
          <ReadOnlyField label={fieldLabel(t, "labelContactNotes")} value={submission.contact?.notes} full />
        </div>
      )}

      {submission.status === "pending" && (
        <div className={styles.decisionPanel}>
          <div className={styles.checklistHint}>{t("reviewChecklistTitle")}</div>
          <div className={styles.checklistRow}>
            {steps.map((s) => (
              <span key={s.key} className={[styles.checklistPill, visited.has(s.key) ? styles.visited : ""].filter(Boolean).join(" ")}>
                <span className={styles.mark} />
                {s.label}
              </span>
            ))}
          </div>
          {!allVisited && <div className={styles.reviewHint}>{t("reviewRequiredHint")}</div>}

          <div className={styles.decisionActions}>
            <Button variant="success" disabled={!allVisited || busy} onClick={handleApprove}>
              {t("btnApprove")}
            </Button>
            <Button variant="dangerOutline" disabled={!allVisited || busy} onClick={() => setRejectOpen(true)}>
              {t("btnReject")}
            </Button>
          </div>

          {rejectOpen && (
            <div className={styles.rejectPanel}>
              <h4>{t("rejectPanelTitle")}</h4>
              <p>{t("rejectPanelDesc")}</p>
              <TextareaField
                label={fieldLabel(t, "labelRejectReason")}
                value={rejectReason}
                onChange={(v) => {
                  setRejectReason(v);
                  if (rejectError) setRejectError("");
                }}
                placeholder={t("rejectReasonPlaceholder")}
                error={rejectError || undefined}
              />
              <div className={styles.rejectActions}>
                <Button variant="ghost" onClick={() => setRejectOpen(false)} disabled={busy}>
                  {t("btnCancelReject")}
                </Button>
                <Button variant="dangerOutline" onClick={handleConfirmReject} loading={busy}>
                  {t("btnConfirmReject")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {submission.status === "approved" && (
        <div className={styles.decisionPanel}>
          <div className={[styles.decidedBanner, styles.approved].join(" ")}>
            <b>{t("statusApproved")}</b>
            {t("decidedApprovedNote")} {new Date(submission.decidedAt).toLocaleDateString(localeFor(language))}.
          </div>
        </div>
      )}

      {submission.status === "rejected" && (
        <div className={styles.decisionPanel}>
          <div className={[styles.decidedBanner, styles.rejected].join(" ")}>
            <b>{t("statusRejected")}</b>
            {t("decidedRejectedNote")} {new Date(submission.decidedAt).toLocaleDateString(localeFor(language))}.
            <div style={{ marginTop: 10 }}>
              <b style={{ fontSize: 12.5 }}>{t("rejectReasonSentLabel")}</b> {submission.rejectReason}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function localeFor(language) {
  return language === "zh" ? "zh-CN" : language === "en" ? "en-US" : "id-ID";
}
