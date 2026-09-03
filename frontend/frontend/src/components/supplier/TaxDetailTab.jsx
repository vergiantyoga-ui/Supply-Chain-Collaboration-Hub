import { useEffect, useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { updateTaxDetail } from "../../api/supplierProfile.js";
import TextField from "../ui/TextField.jsx";
import Button from "../ui/Button.jsx";
import grid from "../ui/FormGrid.module.css";

export default function TaxDetailTab({ taxDetail, onUpdated }) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [form, setForm] = useState(taxDetail || { nik: "", npwp: "", ktp: "", siup: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(taxDetail || { nik: "", npwp: "", ktp: "", siup: "" });
  }, [taxDetail]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await updateTaxDetail(form);
      onUpdated(result);
      showToast(t("toastTaxSaved"), "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <div className={grid.grid}>
        <TextField label={t("labelNik")} value={form.nik} onChange={(v) => setForm((f) => ({ ...f, nik: v }))} />
        <TextField label={t("labelNpwp")} value={form.npwp} onChange={(v) => setForm((f) => ({ ...f, npwp: v }))} />
        <TextField label={t("labelKtp")} value={form.ktp} onChange={(v) => setForm((f) => ({ ...f, ktp: v }))} />
        <TextField label={t("labelSiup")} value={form.siup} onChange={(v) => setForm((f) => ({ ...f, siup: v }))} />
      </div>
      <Button type="submit" loading={saving}>
        {t("btnSaveTax")}
      </Button>
    </form>
  );
}
