import { useEffect, useState } from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { listRfx } from "../../api/rfx.js";
import { listQuotations, createQuotation } from "../../api/quotations.js";
import TextField from "../../components/ui/TextField.jsx";
import SelectField from "../../components/ui/SelectField.jsx";
import TextareaField from "../../components/ui/TextareaField.jsx";
import Button from "../../components/ui/Button.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import grid from "../../components/ui/FormGrid.module.css";
import styles from "./QuotationsPage.module.css";

const CURRENCIES = ["IDR", "MYR", "USD", "SGD"];
const EMPTY_ITEM = { itemName: "", quantity: "", unitPrice: "", uom: "" };
const EMPTY_FORM = { rfxId: "", currency: "IDR", validUntil: "", notes: "", items: [{ ...EMPTY_ITEM }] };

export default function QuotationsPage() {
  const { t, language } = useI18n();
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState([]);
  const [openRfx, setOpenRfx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const locale = language === "zh" ? "zh-CN" : language === "en" ? "en-US" : "id-ID";
  const currencyFmt = (value, currency) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);

  useEffect(() => {
    Promise.all([listQuotations(), listRfx()])
      .then(([q, rfx]) => {
        setQuotations(q);
        setOpenRfx(rfx.filter((r) => r.status === "open"));
      })
      .catch((err) => showToast(err.message, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateItem(index, patch) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  }
  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  }
  function removeItem(index) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  const isValid =
    form.rfxId &&
    form.currency &&
    form.validUntil &&
    form.items.length > 0 &&
    form.items.every((it) => it.itemName.trim() && Number(it.quantity) > 0 && Number(it.unitPrice) >= 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: form.items.map((it) => ({ ...it, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })),
      };
      const result = await createQuotation(payload);
      setQuotations((qs) => [result, ...qs]);
      showToast(t("toastQuotationSubmitted"), "success");
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className={styles.head}>
        <div>
          <h1>{t("quotationTitle")}</h1>
          <p>{t("quotationSubtitle")}</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} disabled={openRfx.length === 0}>
            {t("btnNewQuotation")}
          </Button>
        )}
      </div>

      {!showForm && openRfx.length === 0 && !loading && <p className={styles.hint}>{t("noOpenRfx")}</p>}

      {showForm && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={grid.grid}>
            <SelectField
              label={t("labelSelectRfx")}
              value={form.rfxId}
              onChange={(v) => setForm((f) => ({ ...f, rfxId: v }))}
              placeholder={t("optSelectRfxPlaceholder")}
              options={openRfx.map((r) => ({ value: r.id, label: `${r.code} — ${r.title}` }))}
            />
            <SelectField
              label={t("labelCurrency")}
              value={form.currency}
              onChange={(v) => setForm((f) => ({ ...f, currency: v }))}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
            <TextField
              label={t("labelValidUntil")}
              type="date"
              value={form.validUntil}
              onChange={(v) => setForm((f) => ({ ...f, validUntil: v }))}
            />
          </div>

          <h4 className={styles.itemsTitle}>{t("labelItemName")}</h4>
          {form.items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <div className={styles.itemFields}>
                <TextField
                  label={t("labelItemName")}
                  value={item.itemName}
                  onChange={(v) => updateItem(index, { itemName: v })}
                />
                <TextField
                  label={t("labelQuantity")}
                  type="number"
                  value={item.quantity}
                  onChange={(v) => updateItem(index, { quantity: v })}
                />
                <TextField
                  label={t("labelUnitPrice")}
                  type="number"
                  value={item.unitPrice}
                  onChange={(v) => updateItem(index, { unitPrice: v })}
                />
                <TextField label={t("labelUom")} value={item.uom} onChange={(v) => updateItem(index, { uom: v })} />
              </div>
              {form.items.length > 1 && (
                <button type="button" className={styles.removeItemBtn} onClick={() => removeItem(index)}>
                  {t("btnRemoveItem")}
                </button>
              )}
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={addItem} style={{ marginBottom: 20 }}>
            {t("btnAddItem")}
          </Button>

          <TextareaField
            label={t("labelQuotationNotes")}
            value={form.notes}
            onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
            placeholder={t("placeholderQuotationNotes")}
          />

          <div className={styles.formActions}>
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)} disabled={submitting}>
              {t("btnCancelQuotation")}
            </Button>
            <Button type="submit" disabled={!isValid} loading={submitting}>
              {t("btnSubmitQuotation")}
            </Button>
          </div>
        </form>
      )}

      {!loading && (
        <div className={styles.list}>
          {quotations.length === 0 && !showForm && <p className={styles.hint}>{t("emptyQuotations")}</p>}
          {quotations.map((q) => {
            const total = (q.items || []).reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
            return (
              <div key={q.id} className={styles.quoCard}>
                <div className={styles.quoHeader}>
                  <div>
                    <div className={styles.quoRfx}>{q.rfxId}</div>
                    <div className={styles.quoMeta}>
                      {t("colSubmittedAt")}: {new Date(q.submittedAt).toLocaleDateString(locale)}
                    </div>
                  </div>
                  <StatusPill variant="success" label={t("statusSubmitted")} />
                </div>
                <ul className={styles.quoItems}>
                  {(q.items || []).map((it) => (
                    <li key={it.id}>
                      {it.itemName} — {it.quantity} {it.uom} × {currencyFmt(it.unitPrice, q.currency)}
                    </li>
                  ))}
                </ul>
                <div className={styles.quoTotal}>
                  {currencyFmt(total, q.currency)} · {t("labelValidUntil")}: {q.validUntil}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
