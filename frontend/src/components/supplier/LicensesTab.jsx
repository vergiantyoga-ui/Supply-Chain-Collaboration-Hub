import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { addLicense, removeLicense } from "../../api/supplierProfile.js";
import SelectField from "../ui/SelectField.jsx";
import TextField from "../ui/TextField.jsx";
import Button from "../ui/Button.jsx";
import grid from "../ui/FormGrid.module.css";
import styles from "./ProfileList.module.css";

const LICENSE_TYPE_KEY = { gmp: "optGmp", cpkb: "optCpkb", halal: "optHalal" };

const EMPTY_FORM = { type: "", certificateNumber: "", issueDate: "", expiryDate: "" };

export default function LicensesTab({ licenses, onAdded, onRemoved }) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const isValid = form.type && form.certificateNumber.trim() && file;

  async function handleAdd(e) {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    try {
      const result = await addLicense({ ...form, fileName: file.name });
      onAdded(result);
      showToast(t("toastLicenseAdded"), "success");
      setForm(EMPTY_FORM);
      setFile(null);
      e.target.reset();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id) {
    try {
      await removeLicense(id);
      onRemoved(id);
      showToast(t("toastLicenseRemoved"));
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <div>
      <div className={styles.list}>
        {licenses.length === 0 && <p className={styles.empty}>{t("emptyLicenses")}</p>}
        {licenses.map((lic) => (
          <div key={lic.id} className={styles.item}>
            <div className={styles.itemMain}>
              <div className={styles.itemTitle}>{t(LICENSE_TYPE_KEY[lic.type])}</div>
              <div className={styles.itemSub}>
                {lic.certificateNumber}
                {lic.expiryDate ? ` · ${t("labelExpiryDate")}: ${lic.expiryDate}` : ""}
              </div>
            </div>
            <Button variant="dangerOutline" onClick={() => handleRemove(lic.id)}>
              {t("btnRemoveLicense")}
            </Button>
          </div>
        ))}
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <h4>{t("btnAddLicense")}</h4>
        <div className={grid.grid}>
          <SelectField
            label={t("labelLicenseType")}
            value={form.type}
            onChange={(v) => setForm((f) => ({ ...f, type: v }))}
            placeholder={t("labelLicenseType")}
            options={Object.entries(LICENSE_TYPE_KEY).map(([value, key]) => ({ value, label: t(key) }))}
          />
          <TextField
            label={t("labelCertNumber")}
            value={form.certificateNumber}
            onChange={(v) => setForm((f) => ({ ...f, certificateNumber: v }))}
          />
          <TextField
            label={t("labelIssueDate")}
            type="date"
            value={form.issueDate}
            onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))}
          />
          <TextField
            label={t("labelExpiryDate")}
            type="date"
            value={form.expiryDate}
            onChange={(v) => setForm((f) => ({ ...f, expiryDate: v }))}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-600)", marginBottom: 6 }}>
            {t("labelDocFile")}
          </label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>{t("docUploadHint")}</div>
        </div>
        <Button type="submit" disabled={!isValid} loading={saving}>
          {t("btnAddLicense")}
        </Button>
      </form>
    </div>
  );
}
