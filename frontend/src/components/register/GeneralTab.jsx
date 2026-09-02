import { useI18n } from "../../i18n/I18nContext.jsx";
import TextField from "../ui/TextField.jsx";
import SelectField from "../ui/SelectField.jsx";
import ChipMultiSelect from "../ui/ChipMultiSelect.jsx";
import grid from "../ui/FormGrid.module.css";
import styles from "./RegisterTabs.module.css";

const ENTITY_TITLE_KEYS = [
  { value: "PT", labelKey: null, fallback: "PT" },
  { value: "CV", labelKey: null, fallback: "CV" },
  { value: "CoLtd", labelKey: null, fallback: "Co. Ltd." },
  { value: "Firma", labelKey: "optFirma" },
  { value: "Koperasi", labelKey: "optKoperasi" },
];

export default function GeneralTab({ values, errors, onChange, lookups }) {
  const { t, language } = useI18n();

  const vendorTypeOptions = [
    { value: "raw_material", label: t("optRawMaterial") },
    { value: "packaging_material", label: t("optPackaging") },
    { value: "indirect_material", label: t("optIndirect") },
  ];

  const vendorTypeDetailOptions = (lookups?.vendorTypeDetails || [])
    .filter((d) => d.vendorType === values.vendorType)
    .map((d) => ({ value: d.code, label: d.label[language] }));

  const entityTitleOptions = ENTITY_TITLE_KEYS.map((e) => ({
    value: e.value,
    label: e.labelKey ? t(e.labelKey) : e.fallback,
  }));

  const companyOptions = [
    { value: "Paragon Corp Indonesia", label: "Paragon Corp Indonesia" },
    { value: "Paragon Corp Malaysia", label: "Paragon Corp Malaysia" },
  ];

  return (
    <div>
      <div className={styles.sectionNote}>{t("noteRequired")}</div>

      <div className={grid.grid}>
        <SelectField
          label={t("labelLegalStatus")}
          value={values.legalStatus}
          onChange={(v) => onChange({ legalStatus: v, entityTitle: v === "badan_usaha" ? values.entityTitle : "" })}
          placeholder={t("optLegalPlaceholder")}
          options={[
            { value: "perorangan", label: t("optPerorangan") },
            { value: "badan_usaha", label: t("optBadanUsaha") },
          ]}
          error={errors.legalStatus}
        />

        {values.legalStatus === "badan_usaha" && (
          <SelectField
            label={t("labelEntityTitle")}
            value={values.entityTitle}
            onChange={(v) => onChange({ entityTitle: v })}
            placeholder={t("optEntityPlaceholder")}
            options={entityTitleOptions}
            error={errors.entityTitle}
          />
        )}

        <div className={grid.full}>
          <TextField
            label={t("labelVendorName")}
            value={values.vendorName}
            onChange={(v) => onChange({ vendorName: v })}
            placeholder={t("placeholderVendorName")}
            error={errors.vendorName}
          />
        </div>

        <SelectField
          label={t("labelVendorType")}
          value={values.vendorType}
          onChange={(v) => onChange({ vendorType: v, vendorTypeDetail: "" })}
          placeholder={t("optVendorTypePlaceholder")}
          options={vendorTypeOptions}
          error={errors.vendorType}
        />

        <SelectField
          label={t("labelVendorTypeDetail")}
          value={values.vendorTypeDetail}
          onChange={(v) => onChange({ vendorTypeDetail: v })}
          placeholder={values.vendorType ? t("detailPlaceholderChoose") : t("detailPlaceholderEmpty")}
          options={vendorTypeDetailOptions}
          disabled={!values.vendorType}
          error={errors.vendorTypeDetail}
        />

        <div className={grid.full}>
          <ChipMultiSelect
            legend={t("legendCompany")}
            options={companyOptions}
            value={values.companies}
            onChange={(v) => onChange({ companies: v })}
            error={errors.companies}
          />
        </div>

        <SelectField
          label={t("labelStatusOtv")}
          value={values.statusOtv}
          onChange={(v) => onChange({ statusOtv: v })}
          placeholder={t("optOtvPlaceholder")}
          options={[
            { value: "one_time", label: t("optOneTime") },
            { value: "regular", label: t("optRegular") },
          ]}
          hint={t("hintOtv")}
          error={errors.statusOtv}
        />

        <div />

        <TextField
          label={t("labelMobilePhone")}
          type="tel"
          value={values.mobilePhone}
          onChange={(v) => onChange({ mobilePhone: v })}
          placeholder={t("placeholderMobilePhone")}
          error={errors.mobilePhone}
        />
        <TextField
          label={t("labelPhone")}
          type="tel"
          value={values.phone}
          onChange={(v) => onChange({ phone: v })}
          placeholder={t("placeholderPhone")}
        />
        <TextField
          label={t("labelEmail")}
          type="email"
          value={values.email}
          onChange={(v) => onChange({ email: v })}
          placeholder={t("placeholderEmail")}
          error={errors.email}
        />
        <TextField
          label={t("labelWebsite")}
          type="url"
          value={values.website}
          onChange={(v) => onChange({ website: v })}
          placeholder={t("placeholderWebsite")}
        />
      </div>
    </div>
  );
}
