import { useI18n } from "../../i18n/I18nContext.jsx";
import TextField from "../ui/TextField.jsx";
import SelectField from "../ui/SelectField.jsx";
import TextareaField from "../ui/TextareaField.jsx";
import grid from "../ui/FormGrid.module.css";

export default function AddressTab({ values, errors, onChange, lookups }) {
  const { t, language } = useI18n();
  const geo = lookups?.geo || {};

  const countryOptions = Object.entries(geo).map(([code, c]) => ({ value: code, label: c.label[language] }));

  const states = values.country ? geo[values.country]?.states || {} : {};
  const stateOptions = Object.entries(states).map(([code, s]) => ({ value: code, label: s.label[language] }));

  const cities = values.country && values.state ? states[values.state]?.cities || {} : {};
  const cityOptions = Object.entries(cities).map(([code, label]) => ({ value: code, label: label[language] }));

  return (
    <div className={grid.grid}>
      <div className={grid.full}>
        <TextareaField
          label={t("labelAddress")}
          value={values.address}
          onChange={(v) => onChange({ address: v })}
          placeholder={t("placeholderAddress")}
          error={errors["address.address"]}
        />
      </div>

      <SelectField
        label={t("labelCountry")}
        value={values.country}
        onChange={(v) => onChange({ country: v, state: "", city: "" })}
        placeholder={t("countryPlaceholder")}
        options={countryOptions}
        error={errors["address.country"]}
      />
      <SelectField
        label={t("labelState")}
        value={values.state}
        onChange={(v) => onChange({ state: v, city: "" })}
        placeholder={values.country ? t("statePlaceholderChoose") : t("statePlaceholderEmpty")}
        options={stateOptions}
        disabled={!values.country}
        error={errors["address.state"]}
      />
      <SelectField
        label={t("labelCity")}
        value={values.city}
        onChange={(v) => onChange({ city: v })}
        placeholder={values.state ? t("cityPlaceholderChoose") : t("cityPlaceholderEmpty")}
        options={cityOptions}
        disabled={!values.state}
        error={errors["address.city"]}
      />
      <TextField
        label={t("labelZip")}
        value={values.zip}
        onChange={(v) => onChange({ zip: v })}
        placeholder={t("placeholderZip")}
        inputMode="numeric"
        error={errors["address.zip"]}
      />

      <TextField
        label={t("labelDistrict")}
        value={values.district}
        onChange={(v) => onChange({ district: v })}
        placeholder={t("placeholderDistrict")}
      />
      <TextField
        label={t("labelSubdistrict")}
        value={values.subdistrict}
        onChange={(v) => onChange({ subdistrict: v })}
        placeholder={t("placeholderSubdistrict")}
      />
    </div>
  );
}
