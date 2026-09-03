import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { addContact, removeContact } from "../../api/supplierProfile.js";
import TextField from "../ui/TextField.jsx";
import SelectField from "../ui/SelectField.jsx";
import Button from "../ui/Button.jsx";
import grid from "../ui/FormGrid.module.css";
import styles from "./ProfileList.module.css";

const EMPTY_FORM = { contactName: "", title: "", jobPosition: "", email: "", phone: "", mobilePhone: "", notes: "" };
const MAX_CONTACTS = 10;

export default function ContactsTab({ contacts, onAdded, onRemoved }) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const atMax = contacts.length >= MAX_CONTACTS;
  const isValid = form.contactName.trim() && form.title && form.jobPosition && form.email.trim() && form.mobilePhone.trim();

  async function handleAdd(e) {
    e.preventDefault();
    if (!isValid || atMax) return;
    setSaving(true);
    try {
      const result = await addContact(form);
      onAdded(result);
      showToast(t("toastContactAdded"), "success");
      setForm(EMPTY_FORM);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id) {
    try {
      await removeContact(id);
      onRemoved(id);
      showToast(t("toastContactRemoved"));
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <div>
      <p className={styles.countHint}>
        {contacts.length} / {MAX_CONTACTS} {t("contactsCountLabel")}
      </p>

      <div className={styles.list}>
        {contacts.map((c) => (
          <div key={c.id} className={styles.item}>
            <div className={styles.itemMain}>
              <div className={styles.itemTitle}>{c.contactName}</div>
              <div className={styles.itemSub}>
                {t({ finance: "optFinance", sales: "optSales", quality: "optQuality", other: "optOther" }[c.jobPosition])} ·{" "}
                {c.email} · {c.mobilePhone}
              </div>
            </div>
            <Button variant="dangerOutline" onClick={() => handleRemove(c.id)}>
              {t("btnRemoveContact")}
            </Button>
          </div>
        ))}
      </div>

      {atMax ? (
        <p className={styles.empty}>{t("contactsMaxReached")}</p>
      ) : (
        <form className={styles.addForm} onSubmit={handleAdd}>
          <h4>{t("btnAddContact")}</h4>
          <div className={grid.grid}>
            <TextField label={t("labelContactName")} value={form.contactName} onChange={(v) => setForm((f) => ({ ...f, contactName: v }))} />
            <SelectField
              label={t("labelContactTitle")}
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
              placeholder={t("optContactTitlePlaceholder")}
              options={[
                { value: "miss", label: t("optMiss") },
                { value: "mr", label: t("optMr") },
                { value: "madam", label: t("optMadam") },
              ]}
            />
            <SelectField
              label={t("labelJobPosition")}
              value={form.jobPosition}
              onChange={(v) => setForm((f) => ({ ...f, jobPosition: v }))}
              placeholder={t("optJobPositionPlaceholder")}
              options={[
                { value: "finance", label: t("optFinance") },
                { value: "sales", label: t("optSales") },
                { value: "quality", label: t("optQuality") },
                { value: "other", label: t("optOther") },
              ]}
            />
            <TextField label={t("labelContactEmail")} type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            <TextField label={t("labelContactPhone")} type="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <TextField
              label={t("labelContactMobile")}
              type="tel"
              value={form.mobilePhone}
              onChange={(v) => setForm((f) => ({ ...f, mobilePhone: v }))}
            />
          </div>
          <Button type="submit" disabled={!isValid} loading={saving}>
            {t("btnAddContact")}
          </Button>
        </form>
      )}
    </div>
  );
}
