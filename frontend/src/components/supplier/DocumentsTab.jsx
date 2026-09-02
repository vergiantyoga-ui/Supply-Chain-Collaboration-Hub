import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { addDocument, removeDocument } from "../../api/supplierProfile.js";
import SelectField from "../ui/SelectField.jsx";
import Button from "../ui/Button.jsx";
import styles from "./ProfileList.module.css";

const DOC_TYPE_KEY = { akta_pendirian: "optAktaPendirian", sk_pendirian: "optSkPendirian", izin_usaha: "optIzinUsaha" };

export default function DocumentsTab({ documents, onAdded, onRemoved }) {
  const { t, language } = useI18n();
  const { showToast } = useToast();
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    if (!docType || !file) return;
    setSaving(true);
    try {
      const result = await addDocument({ type: docType, fileName: file.name });
      onAdded(result);
      showToast(t("toastDocAdded"), "success");
      setDocType("");
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
      await removeDocument(id);
      onRemoved(id);
      showToast(t("toastDocRemoved"));
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <div>
      <div className={styles.list}>
        {documents.length === 0 && <p className={styles.empty}>{t("emptyDocs")}</p>}
        {documents.map((doc) => (
          <div key={doc.id} className={styles.item}>
            <div className={styles.itemMain}>
              <div className={styles.itemTitle}>{t(DOC_TYPE_KEY[doc.type])}</div>
              <div className={styles.itemSub}>
                {doc.fileName} · {new Date(doc.uploadedAt).toLocaleDateString(language === "zh" ? "zh-CN" : language === "en" ? "en-US" : "id-ID")}
              </div>
            </div>
            <Button variant="dangerOutline" onClick={() => handleRemove(doc.id)}>
              {t("btnRemoveDoc")}
            </Button>
          </div>
        ))}
      </div>

      <form className={styles.addForm} onSubmit={handleUpload}>
        <h4>{t("btnUploadDoc")}</h4>
        <SelectField
          label={t("labelDocType")}
          value={docType}
          onChange={setDocType}
          placeholder={t("labelDocType")}
          options={Object.entries(DOC_TYPE_KEY).map(([value, key]) => ({ value, label: t(key) }))}
        />
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-600)", marginBottom: 6 }}>
            {t("labelDocFile")}
          </label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>{t("docUploadHint")}</div>
        </div>
        <Button type="submit" disabled={!docType || !file} loading={saving}>
          {t("btnUploadDoc")}
        </Button>
      </form>
    </div>
  );
}
