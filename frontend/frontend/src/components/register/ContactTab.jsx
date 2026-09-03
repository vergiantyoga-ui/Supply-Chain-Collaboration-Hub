import { useI18n } from "../../i18n/I18nContext.jsx";
import TextField from "../ui/TextField.jsx";
import SelectField from "../ui/SelectField.jsx";
import TextareaField from "../ui/TextareaField.jsx";
import grid from "../ui/FormGrid.module.css";

export default function ContactTab({ values, errors, onChange }) {
  const { t } = useI18n();

  return (
    <div className={grid.grid}>
      <TextField
        label={t("labelContactName")}
        value={values.contactName}
        onChange={(v) => onChange({ contactName: v })}
        placeholder={t("placeholderContactName")}
        error={errors["contact.contactName"]}
      />
      <SelectField
        label={t("labelContactTitle")}
        value={values.title}
        onChange={(v) => onChange({ title: v })}
        placeholder={t("optContactTitlePlaceholder")}
        options={[
          { value: "miss", label: t("optMiss") },
          { value: "mr", label: t("optMr") },
          { value: "madam", label: t("optMadam") },
        ]}
        error={errors["contact.title"]}
      />

      <SelectField
        label={t("labelJobPosition")}
        value={values.jobPosition}
        onChange={(v) => onChange({ jobPosition: v })}
        placeholder={t("optJobPositionPlaceholder")}
        options={[
          { value: "finance", label: t("optFinance") },
          { value: "sales", label: t("optSales") },
          { value: "quality", label: t("optQuality") },
          { value: "other", label: t("optOther") },
        ]}
        error={errors["contact.jobPosition"]}
      />
      <TextField
        label={t("labelContactEmail")}
        type="email"
        value={values.email}
        onChange={(v) => onChange({ email: v })}
        placeholder={t("placeholderContactEmail")}
        error={errors["contact.email"]}
      />

      <TextField
        label={t("labelContactPhone")}
        type="tel"
        value={values.phone}
        onChange={(v) => onChange({ phone: v })}
        placeholder={t("placeholderContactPhone")}
      />
      <TextField
        label={t("labelContactMobile")}
        type="tel"
        value={values.mobilePhone}
        onChange={(v) => onChange({ mobilePhone: v })}
        placeholder={t("placeholderContactMobile")}
        error={errors["contact.mobilePhone"]}
      />

      <div className={grid.full}>
        <TextareaField
          label={t("labelContactNotes")}
          value={values.notes}
          onChange={(v) => onChange({ notes: v })}
          placeholder={t("placeholderContactNotes")}
        />
      </div>
    </div>
  );
}
