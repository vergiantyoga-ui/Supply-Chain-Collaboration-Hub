const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mirrors backend/lib/validators.js so the form can show inline errors
 * immediately, without waiting for a round-trip to the API. The backend
 * re-validates everything on submit regardless — this is a UX layer only,
 * never the source of truth.
 */
export function validateSubmission(form) {
  const errors = {};

  if (!["perorangan", "badan_usaha"].includes(form.legalStatus)) errors.legalStatus = true;
  if (form.legalStatus === "badan_usaha" && !form.entityTitle) errors.entityTitle = true;
  if (!form.vendorName?.trim()) errors.vendorName = true;
  if (!["raw_material", "packaging_material", "indirect_material"].includes(form.vendorType)) errors.vendorType = true;
  if (!form.vendorTypeDetail) errors.vendorTypeDetail = true;
  if (!Array.isArray(form.companies) || form.companies.length === 0) errors.companies = true;
  if (!["one_time", "regular"].includes(form.statusOtv)) errors.statusOtv = true;
  if (!form.mobilePhone?.trim()) errors.mobilePhone = true;
  if (!EMAIL_RE.test(form.email || "")) errors.email = true;

  const a = form.address || {};
  if (!a.address?.trim()) errors["address.address"] = true;
  if (!a.country) errors["address.country"] = true;
  if (!a.state) errors["address.state"] = true;
  if (!a.city) errors["address.city"] = true;
  if (!a.zip?.trim()) errors["address.zip"] = true;

  const c = form.contact || {};
  if (!c.contactName?.trim()) errors["contact.contactName"] = true;
  if (!["miss", "mr", "madam"].includes(c.title)) errors["contact.title"] = true;
  if (!["finance", "sales", "quality", "other"].includes(c.jobPosition)) errors["contact.jobPosition"] = true;
  if (!EMAIL_RE.test(c.email || "")) errors["contact.email"] = true;
  if (!c.mobilePhone?.trim()) errors["contact.mobilePhone"] = true;

  return errors;
}

export const TAB_FIELDS = {
  general: [
    "legalStatus", "entityTitle", "vendorName", "vendorType", "vendorTypeDetail",
    "companies", "statusOtv", "mobilePhone", "email",
  ],
  address: ["address.address", "address.country", "address.state", "address.city", "address.zip"],
  contact: [
    "contact.contactName", "contact.title", "contact.jobPosition",
    "contact.email", "contact.mobilePhone",
  ],
};

export function errorsForTab(errors, tabKey) {
  const fields = TAB_FIELDS[tabKey] || [];
  return Object.fromEntries(Object.entries(errors).filter(([key]) => fields.includes(key)));
}

export function firstTabWithError(errors) {
  return ["general", "address", "contact"].find(
    (tab) => TAB_FIELDS[tab].some((field) => errors[field])
  );
}
