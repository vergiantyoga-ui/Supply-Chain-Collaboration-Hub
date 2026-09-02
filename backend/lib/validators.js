const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a supplier registration payload against the field spec defined
 * in the PRD (section 8.2–8.7). Returns { valid, errors } where errors is a
 * flat map of fieldName -> message, suitable for surfacing next to inputs
 * on the frontend.
 */
export function validateSubmissionPayload(body) {
  const errors = {};
  const b = body || {};

  // ---- General ----
  if (!["perorangan", "badan_usaha"].includes(b.legalStatus)) {
    errors.legalStatus = "Status badan hukum wajib dipilih.";
  }
  if (b.legalStatus === "badan_usaha" && !b.entityTitle) {
    errors.entityTitle = "Bentuk badan usaha wajib dipilih.";
  }
  if (!b.vendorName || !b.vendorName.trim()) {
    errors.vendorName = "Nama pemasok wajib diisi.";
  }
  if (!["raw_material", "packaging_material", "indirect_material"].includes(b.vendorType)) {
    errors.vendorType = "Jenis pemasok wajib dipilih.";
  }
  if (!b.vendorTypeDetail) {
    errors.vendorTypeDetail = "Detail jenis pemasok wajib dipilih.";
  }
  if (!Array.isArray(b.companies) || b.companies.length === 0) {
    errors.companies = "Pilih minimal satu perusahaan tujuan.";
  }
  if (!["one_time", "regular"].includes(b.statusOtv)) {
    errors.statusOtv = "Status OTV wajib dipilih.";
  }
  if (!b.mobilePhone || !b.mobilePhone.trim()) {
    errors.mobilePhone = "Nomor ponsel wajib diisi.";
  }
  if (!b.email || !EMAIL_RE.test(b.email)) {
    errors.email = "Email perusahaan tidak valid.";
  }

  // ---- Address ----
  const address = b.address || {};
  if (!address.address || !address.address.trim()) {
    errors["address.address"] = "Alamat lengkap wajib diisi.";
  }
  if (!address.country) errors["address.country"] = "Negara wajib dipilih.";
  if (!address.state) errors["address.state"] = "Provinsi/negara bagian wajib dipilih.";
  if (!address.city) errors["address.city"] = "Kota/kabupaten wajib dipilih.";
  if (!address.zip || !address.zip.trim()) errors["address.zip"] = "Kode pos wajib diisi.";

  // ---- Contact ----
  const contact = b.contact || {};
  if (!contact.contactName || !contact.contactName.trim()) {
    errors["contact.contactName"] = "Nama kontak wajib diisi.";
  }
  if (!["miss", "mr", "madam"].includes(contact.title)) {
    errors["contact.title"] = "Gelar wajib dipilih.";
  }
  if (!["finance", "sales", "quality", "other"].includes(contact.jobPosition)) {
    errors["contact.jobPosition"] = "Posisi jabatan wajib dipilih.";
  }
  if (!contact.email || !EMAIL_RE.test(contact.email)) {
    errors["contact.email"] = "Email kontak tidak valid.";
  }
  if (!contact.mobilePhone || !contact.mobilePhone.trim()) {
    errors["contact.mobilePhone"] = "Nomor ponsel kontak wajib diisi.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email);
}
