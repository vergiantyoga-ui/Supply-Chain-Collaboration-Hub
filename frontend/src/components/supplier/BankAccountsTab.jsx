import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { addBankAccount, removeBankAccount } from "../../api/supplierProfile.js";
import TextField from "../ui/TextField.jsx";
import SelectField from "../ui/SelectField.jsx";
import Button from "../ui/Button.jsx";
import grid from "../ui/FormGrid.module.css";
import styles from "./ProfileList.module.css";

const EMPTY_FORM = { bankName: "", accountNumber: "", accountHolder: "", currency: "IDR", termsOfPayment: "" };
const CURRENCIES = ["IDR", "MYR", "USD", "SGD"];

export default function BankAccountsTab({ bankAccounts, onAdded, onRemoved }) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const isValid = form.bankName.trim() && form.accountNumber.trim() && form.accountHolder.trim() && form.termsOfPayment;

  async function handleAdd(e) {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    try {
      const result = await addBankAccount(form);
      onAdded(result);
      showToast(t("toastBankAdded"), "success");
      setForm(EMPTY_FORM);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id) {
    try {
      await removeBankAccount(id);
      onRemoved(id);
      showToast(t("toastBankRemoved"));
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <div>
      <div className={styles.list}>
        {bankAccounts.length === 0 && <p className={styles.empty}>{t("emptyBanks")}</p>}
        {bankAccounts.map((acc) => (
          <div key={acc.id} className={styles.item}>
            <div className={styles.itemMain}>
              <div className={styles.itemTitle}>
                {acc.bankName} — {acc.accountNumber}
              </div>
              <div className={styles.itemSub}>
                {acc.accountHolder} · {acc.currency} · {t(termsKey(acc.termsOfPayment))}
              </div>
            </div>
            <Button variant="dangerOutline" onClick={() => handleRemove(acc.id)}>
              {t("btnRemoveBank")}
            </Button>
          </div>
        ))}
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <h4>{t("btnAddBank")}</h4>
        <div className={grid.grid}>
          <TextField label={t("labelBankName")} value={form.bankName} onChange={(v) => setForm((f) => ({ ...f, bankName: v }))} />
          <TextField
            label={t("labelAccountNumber")}
            value={form.accountNumber}
            onChange={(v) => setForm((f) => ({ ...f, accountNumber: v }))}
          />
          <div className={grid.full}>
            <TextField
              label={t("labelAccountHolder")}
              value={form.accountHolder}
              onChange={(v) => setForm((f) => ({ ...f, accountHolder: v }))}
            />
          </div>
          <SelectField
            label={t("labelCurrency")}
            value={form.currency}
            onChange={(v) => setForm((f) => ({ ...f, currency: v }))}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
          <SelectField
            label={t("labelTermsOfPayment")}
            value={form.termsOfPayment}
            onChange={(v) => setForm((f) => ({ ...f, termsOfPayment: v }))}
            placeholder={t("labelTermsOfPayment")}
            options={[
              { value: "net_30", label: t("optNet30") },
              { value: "net_60", label: t("optNet60") },
              { value: "net_90", label: t("optNet90") },
              { value: "cod", label: t("optCod") },
            ]}
          />
        </div>
        <Button type="submit" disabled={!isValid} loading={saving}>
          {t("btnAddBank")}
        </Button>
      </form>
    </div>
  );
}

function termsKey(value) {
  return { net_30: "optNet30", net_60: "optNet60", net_90: "optNet90", cod: "optCod" }[value] || "optNet30";
}
