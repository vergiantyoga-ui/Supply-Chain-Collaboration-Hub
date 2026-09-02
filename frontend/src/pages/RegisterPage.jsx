import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext.jsx";
import { useLookups } from "../utils/useLookups.js";
import { validateSubmission, errorsForTab, firstTabWithError } from "../utils/validateSubmission.js";
import { createSubmission } from "../api/suppliers.js";
import { ApiError } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import Tabs from "../components/ui/Tabs.jsx";
import Button from "../components/ui/Button.jsx";
import GeneralTab from "../components/register/GeneralTab.jsx";
import AddressTab from "../components/register/AddressTab.jsx";
import ContactTab from "../components/register/ContactTab.jsx";
import styles from "./RegisterPage.module.css";

const TAB_ORDER = ["general", "address", "contact"];

const INITIAL_FORM = {
  legalStatus: "",
  entityTitle: "",
  vendorName: "",
  vendorType: "",
  vendorTypeDetail: "",
  companies: [],
  statusOtv: "",
  mobilePhone: "",
  phone: "",
  email: "",
  website: "",
  address: { address: "", country: "", state: "", city: "", district: "", subdistrict: "", zip: "" },
  contact: { contactName: "", title: "", jobPosition: "", email: "", phone: "", mobilePhone: "", notes: "" },
};

export default function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { lookups } = useLookups();

  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [visited, setVisited] = useState(new Set(["general"]));

  function patchGeneral(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }
  function patchAddress(patch) {
    setForm((f) => ({ ...f, address: { ...f.address, ...patch } }));
  }
  function patchContact(patch) {
    setForm((f) => ({ ...f, contact: { ...f.contact, ...patch } }));
  }

  function goToTab(tab) {
    setVisited((v) => new Set(v).add(tab));
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleNext() {
    const allErrors = validateSubmission(form);
    const tabErrors = errorsForTab(allErrors, activeTab);
    setErrors((prev) => ({ ...prev, ...tabErrors, ...clearTabErrors(activeTab, allErrors) }));
    if (Object.keys(tabErrors).length > 0) return;
    const idx = TAB_ORDER.indexOf(activeTab);
    if (idx < TAB_ORDER.length - 1) goToTab(TAB_ORDER[idx + 1]);
  }

  function handlePrev() {
    const idx = TAB_ORDER.indexOf(activeTab);
    if (idx > 0) goToTab(TAB_ORDER[idx - 1]);
  }

  function clearTabErrors(tabKey, allErrors) {
    // returns entries for this tab's fields that are now valid (so they get cleared from state)
    const fields = errorsForTab(allErrors, tabKey);
    return fields;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const allErrors = validateSubmission(form);
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      const badTab = firstTabWithError(allErrors);
      if (badTab) goToTab(badTab);
      showToast(t("formHasErrors"), "error");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createSubmission(form);
      navigate("/register/success", { state: { submissionCode: result.submissionCode } });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
        const badTab = firstTabWithError(err.errors);
        if (badTab) goToTab(badTab);
      }
      showToast(err.message || t("formHasErrors"), "error");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { key: "general", label: t("stepGeneral"), done: visited.has("address") || visited.has("contact") },
    { key: "address", label: t("stepAddress"), done: visited.has("contact") },
    { key: "contact", label: t("stepContact"), done: false },
  ];

  const isFirst = activeTab === "general";
  const isLast = activeTab === "contact";

  return (
    <div className={styles.shell}>
      <div className={styles.top}>
        <Link to="/login" className={styles.backLink}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("backToLogin")}
        </Link>
      </div>

      <div className={styles.head}>
        <h1>{t("registerTitle")}</h1>
        <p>{t("registerDesc")}</p>
      </div>

      <Tabs steps={steps} activeKey={activeTab} onChange={goToTab} />

      <form onSubmit={handleSubmit} noValidate>
        {activeTab === "general" && (
          <GeneralTab values={form} errors={mapErrors(errors, t)} onChange={patchGeneral} lookups={lookups} />
        )}
        {activeTab === "address" && (
          <AddressTab values={form.address} errors={mapErrors(errors, t)} onChange={patchAddress} lookups={lookups} />
        )}
        {activeTab === "contact" && (
          <ContactTab values={form.contact} errors={mapErrors(errors, t)} onChange={patchContact} />
        )}

        <div className={styles.actionBar}>
          <Button type="button" variant="ghost" onClick={handlePrev} style={{ visibility: isFirst ? "hidden" : "visible" }}>
            {t("btnPrev")}
          </Button>
          <div className={styles.spacer} />
          {!isLast && (
            <Button type="button" onClick={handleNext}>
              {t("btnNext")}
            </Button>
          )}
          {isLast && (
            <Button type="submit" loading={submitting}>
              {submitting ? t("btnSubmitting") : t("btnSubmit")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function mapErrors(errors, t) {
  return Object.fromEntries(Object.entries(errors).map(([key, val]) => [key, val ? t("fieldRequiredGeneric") : undefined]));
}
