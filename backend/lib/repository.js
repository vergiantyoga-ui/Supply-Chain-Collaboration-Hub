import { getPool, isDatabaseConfigured } from "./db.js";
import * as mock from "./mockData.js";

/**
 * Repository layer — every API route calls functions from this module
 * instead of touching lib/mockData.js or `pg` directly. This keeps a single
 * seam for swapping mock data for real PostgreSQL: when DATABASE_URL is
 * configured, each function below runs the real SQL query; otherwise it
 * reads/writes the in-memory mock dataset. Per project requirements this
 * build ships with DATABASE_URL unset, so every page runs on mock data.
 */

// ------------------------------------------------------------------
// Lookups (vendor type details, geo)
// ------------------------------------------------------------------
export async function getLookups() {
  if (isDatabaseConfigured()) {
    const pool = getPool();
    const vendorRows = await pool.query(
      "SELECT code, vendor_type, label_id, label_en, label_zh FROM vendor_type_details ORDER BY vendor_type, sort_order"
    );
    const countryRows = await pool.query("SELECT code, label_id, label_en, label_zh FROM countries ORDER BY label_id");
    const stateRows = await pool.query("SELECT code, country_code, label_id, label_en, label_zh FROM states ORDER BY label_id");
    const cityRows = await pool.query("SELECT code, state_code, label_id, label_en, label_zh FROM cities ORDER BY label_id");

    const vendorTypeDetails = vendorRows.rows.map((r) => ({
      code: r.code,
      vendorType: r.vendor_type,
      label: { id: r.label_id, en: r.label_en, zh: r.label_zh },
    }));

    const geo = {};
    for (const c of countryRows.rows) {
      geo[c.code] = { label: { id: c.label_id, en: c.label_en, zh: c.label_zh }, states: {} };
    }
    for (const s of stateRows.rows) {
      if (!geo[s.country_code]) continue;
      geo[s.country_code].states[s.code] = { label: { id: s.label_id, en: s.label_en, zh: s.label_zh }, cities: {} };
    }
    for (const city of cityRows.rows) {
      for (const country of Object.values(geo)) {
        if (country.states[city.state_code]) {
          country.states[city.state_code].cities[city.code] = { id: city.label_id, en: city.label_en, zh: city.label_zh };
        }
      }
    }

    return { vendorTypeDetails, geo };
  }

  return { vendorTypeDetails: mock.vendorTypeDetails, geo: mock.geo };
}

// ------------------------------------------------------------------
// Auth (mock-only for this build — see PRD 5.4 for production guidance)
// ------------------------------------------------------------------
export async function authenticate(email, password) {
  // NOTE: this build intentionally does not verify passwords against a real
  // hash for most accounts — see README "Authentication" section. It
  // simulates a successful login and derives the role from the account
  // domain, matching the behaviour of the interactive HTML mockup delivered
  // earlier in this project. Replace with real credential verification
  // (bcrypt compare + session/JWT issuance) before going to production.
  //
  // Exception: accounts created by the supplier-approval flow (see
  // approveSubmission below) DO have a real (plaintext, mock-only) password
  // attached, and that password IS checked here — this lets the "approve →
  // email credentials → supplier logs in" loop be demoed end-to-end.
  if (!email) return null;

  if (isDatabaseConfigured()) {
    const pool = getPool();
    const { rows } = await pool.query("SELECT id, email, role, full_name FROM users WHERE email = $1 AND is_active = TRUE", [email]);
    if (rows.length > 0) {
      const u = rows[0];
      return { id: u.id, email: u.email, role: u.role, fullName: u.full_name };
    }
  }

  const existing = mock.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (existing.password && existing.password !== password) return null;
    return existing;
  }

  // Fallback simulation for any email not in the seed list: role inferred
  // from the internal corporate domain, as documented in the PRD.
  const isInternal = email.toLowerCase().endsWith("@paragon-corp.com");
  return {
    id: null,
    email,
    role: isInternal ? "internal_staff" : "supplier",
    fullName: null,
  };
}

export async function requestPasswordReset(_email) {
  // Always resolves successfully and does not reveal whether the email is
  // registered, per PRD 7.3 (FORGOT-02) to prevent account enumeration.
  return true;
}

// ------------------------------------------------------------------
// Supplier submissions
// ------------------------------------------------------------------
export async function listSubmissions() {
  if (isDatabaseConfigured()) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, submission_code, vendor_name, vendor_type, status, submitted_at, decided_at, reject_reason
       FROM supplier_submissions ORDER BY submitted_at DESC`
    );
    return rows.map(mapSubmissionRowSummary);
  }

  return [...mock.submissions]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .map((s) => ({
      id: s.id,
      submissionCode: s.submissionCode,
      vendorName: s.vendorName,
      vendorType: s.vendorType,
      status: s.status,
      submittedAt: s.submittedAt,
      decidedAt: s.decidedAt,
    }));
}

export async function getSubmissionById(id) {
  if (isDatabaseConfigured()) {
    const pool = getPool();
    const subRes = await pool.query("SELECT * FROM supplier_submissions WHERE id = $1", [id]);
    if (subRes.rows.length === 0) return null;
    const sub = subRes.rows[0];

    const [companiesRes, addressRes, contactRes] = await Promise.all([
      pool.query("SELECT company_name FROM supplier_submission_companies WHERE submission_id = $1", [id]),
      pool.query("SELECT * FROM supplier_addresses WHERE submission_id = $1", [id]),
      pool.query("SELECT * FROM supplier_contacts WHERE submission_id = $1", [id]),
    ]);

    return mapSubmissionFull(sub, companiesRes.rows, addressRes.rows[0], contactRes.rows[0]);
  }

  const found = mock.submissions.find((s) => s.id === id);
  return found ? { ...found } : null;
}

export async function createSubmission(payload) {
  const submissionCode = mock.nextSubmissionCode();
  const now = new Date().toISOString();

  if (isDatabaseConfigured()) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const insertSub = await client.query(
        `INSERT INTO supplier_submissions
           (submission_code, legal_status, entity_title, vendor_name, vendor_type, vendor_type_detail,
            status_otv, mobile_phone, phone, email, website, status, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending', now())
         RETURNING id, submission_code, submitted_at`,
        [
          submissionCode, payload.legalStatus, payload.entityTitle || null, payload.vendorName,
          payload.vendorType, payload.vendorTypeDetail, payload.statusOtv, payload.mobilePhone,
          payload.phone || null, payload.email, payload.website || null,
        ]
      );
      const submissionId = insertSub.rows[0].id;

      for (const company of payload.companies) {
        await client.query(
          "INSERT INTO supplier_submission_companies (submission_id, company_name) VALUES ($1, $2)",
          [submissionId, company]
        );
      }

      await client.query(
        `INSERT INTO supplier_addresses (submission_id, address, country_code, state_code, city_code, district, subdistrict, zip)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [submissionId, payload.address.address, payload.address.country, payload.address.state, payload.address.city,
          payload.address.district || null, payload.address.subdistrict || null, payload.address.zip]
      );

      await client.query(
        `INSERT INTO supplier_contacts (submission_id, contact_name, title, job_position, email, phone, mobile_phone, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [submissionId, payload.contact.contactName, payload.contact.title, payload.contact.jobPosition,
          payload.contact.email, payload.contact.phone || null, payload.contact.mobilePhone, payload.contact.notes || null]
      );

      await client.query("COMMIT");
      return { id: submissionId, submissionCode, status: "pending", submittedAt: insertSub.rows[0].submitted_at };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  const id = `mock-${Date.now()}`;
  const record = {
    id,
    submissionCode,
    legalStatus: payload.legalStatus,
    entityTitle: payload.entityTitle || null,
    vendorName: payload.vendorName,
    vendorType: payload.vendorType,
    vendorTypeDetail: payload.vendorTypeDetail,
    companies: payload.companies,
    statusOtv: payload.statusOtv,
    mobilePhone: payload.mobilePhone,
    phone: payload.phone || "",
    email: payload.email,
    website: payload.website || "",
    address: { ...payload.address },
    contact: { ...payload.contact },
    status: "pending",
    submittedAt: now,
    decidedAt: null,
    rejectReason: null,
  };
  mock.submissions.unshift(record);
  return { id, submissionCode, status: "pending", submittedAt: now };
}

export async function approveSubmission(id, actorEmail) {
  const now = new Date().toISOString();

  if (isDatabaseConfigured()) {
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE supplier_submissions SET status = 'approved', decided_at = now(), updated_at = now()
       WHERE id = $1 AND status = 'pending' RETURNING id, status, decided_at`,
      [id]
    );
    if (rows.length === 0) return null;
    await pool.query(
      "INSERT INTO approval_audit_log (submission_id, action, actor_email) VALUES ($1, 'approved', $2)",
      [id, actorEmail]
    );
    // NOTE: account creation + welcome email on the real-Postgres path is
    // intentionally not implemented in this build — wire it up alongside a
    // real transactional email provider (see PRD 9.8) and a bcrypt-hashed
    // password before going to production. The mock path below shows the
    // full intended flow end-to-end.
    return rows[0];
  }

  const record = mock.submissions.find((s) => s.id === id);
  if (!record || record.status !== "pending") return null;
  record.status = "approved";
  record.decidedAt = now;
  mock.auditLog.unshift({ id: `log-${Date.now()}`, submissionId: id, action: "approved", actorEmail, reason: null, createdAt: now });

  // Create (or reuse) the supplier's account, using the CONTACT email from
  // Tab 3 of the registration form — per requirement, credentials are sent
  // to the contact person, not necessarily the general company email.
  const accountEmail = record.contact.email;
  let user = mock.users.find((u) => u.email.toLowerCase() === accountEmail.toLowerCase());
  const generatedPassword = mock.genMockPassword();
  if (!user) {
    user = {
      id: mock.genId("user"),
      email: accountEmail,
      role: "supplier",
      fullName: record.contact.contactName,
      password: generatedPassword,
      submissionId: record.id,
    };
    mock.users.push(user);
  } else {
    user.password = generatedPassword;
    user.submissionId = record.id;
  }

  if (!mock.supplierProfiles[record.id]) {
    mock.supplierProfiles[record.id] = mock.createInitialSupplierProfile(record);
  }

  // Simulate the welcome-with-credentials email (PRD 9.8). No real email
  // provider is wired up in this build — the message is stored in an
  // in-memory outbox (viewable via GET /api/dev/email-outbox) and the
  // generated password is also returned directly in this API response so
  // the Internal Review UI can surface it to the reviewer for testing.
  mock.emailOutbox.unshift({
    id: mock.genId("email"),
    to: accountEmail,
    subject: "Akun Supplier Paragon Supply Collaboration Hub Anda telah aktif",
    body:
      `Selamat, pendaftaran ${record.vendorName} (${record.submissionCode}) telah disetujui.\n\n` +
      `Anda dapat masuk ke Paragon Supply Collaboration Hub menggunakan:\n` +
      `Email: ${accountEmail}\nPassword sementara: ${generatedPassword}\n\n` +
      `Segera lengkapi profil perusahaan Anda (data pajak, dokumen legalitas, izin & sertifikat, ` +
      `informasi pembayaran, dan kontak tambahan) setelah masuk.`,
    sentAt: now,
  });

  return { id, status: "approved", decidedAt: now, accountEmail, generatedPassword };
}

export async function rejectSubmission(id, reason, actorEmail) {
  const now = new Date().toISOString();

  if (isDatabaseConfigured()) {
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE supplier_submissions SET status = 'rejected', decided_at = now(), reject_reason = $2, updated_at = now()
       WHERE id = $1 AND status = 'pending' RETURNING id, status, decided_at, reject_reason`,
      [id, reason]
    );
    if (rows.length === 0) return null;
    await pool.query(
      "INSERT INTO approval_audit_log (submission_id, action, actor_email, reason) VALUES ($1, 'rejected', $2, $3)",
      [id, actorEmail, reason]
    );
    return rows[0];
  }

  const record = mock.submissions.find((s) => s.id === id);
  if (!record || record.status !== "pending") return null;
  record.status = "rejected";
  record.decidedAt = now;
  record.rejectReason = reason;
  mock.auditLog.unshift({ id: `log-${Date.now()}`, submissionId: id, action: "rejected", actorEmail, reason, createdAt: now });
  return { id, status: "rejected", decidedAt: now, rejectReason: reason };
}

// ------------------------------------------------------------------
// Supplier self-service profile (Tax Detail, Documents, Licenses,
// Bank Accounts, Contacts) — mock-data only in this iteration. Wire up
// real Postgres tables (see db/schema.sql) following the same dual-mode
// pattern used above for supplier_submissions when ready for production.
// ------------------------------------------------------------------
const MAX_PROFILE_CONTACTS = 10;

function findProfileByEmail(email) {
  return Object.values(mock.supplierProfiles).find((p) => p.userEmail.toLowerCase() === (email || "").toLowerCase());
}

export async function getSupplierProfile(email) {
  return findProfileByEmail(email) || null;
}

export async function updateTaxDetail(email, taxDetail) {
  const profile = findProfileByEmail(email);
  if (!profile) return null;
  profile.taxDetail = { ...profile.taxDetail, ...taxDetail };
  return profile.taxDetail;
}

export async function addProfileDocument(email, doc) {
  const profile = findProfileByEmail(email);
  if (!profile) return null;
  const entry = { id: mock.genId("doc"), uploadedAt: new Date().toISOString(), ...doc };
  profile.documents.push(entry);
  return entry;
}

export async function removeProfileDocument(email, docId) {
  const profile = findProfileByEmail(email);
  if (!profile) return false;
  const before = profile.documents.length;
  profile.documents = profile.documents.filter((d) => d.id !== docId);
  return profile.documents.length < before;
}

export async function addProfileLicense(email, license) {
  const profile = findProfileByEmail(email);
  if (!profile) return null;
  const entry = { id: mock.genId("lic"), ...license };
  profile.licenses.push(entry);
  return entry;
}

export async function removeProfileLicense(email, licenseId) {
  const profile = findProfileByEmail(email);
  if (!profile) return false;
  const before = profile.licenses.length;
  profile.licenses = profile.licenses.filter((l) => l.id !== licenseId);
  return profile.licenses.length < before;
}

export async function addBankAccount(email, account) {
  const profile = findProfileByEmail(email);
  if (!profile) return null;
  const entry = { id: mock.genId("bank"), ...account };
  profile.bankAccounts.push(entry);
  return entry;
}

export async function updateBankAccount(email, accountId, patch) {
  const profile = findProfileByEmail(email);
  if (!profile) return null;
  const account = profile.bankAccounts.find((a) => a.id === accountId);
  if (!account) return null;
  Object.assign(account, patch);
  return account;
}

export async function removeBankAccount(email, accountId) {
  const profile = findProfileByEmail(email);
  if (!profile) return false;
  const before = profile.bankAccounts.length;
  profile.bankAccounts = profile.bankAccounts.filter((a) => a.id !== accountId);
  return profile.bankAccounts.length < before;
}

export async function addProfileContact(email, contact) {
  const profile = findProfileByEmail(email);
  if (!profile) return { error: "not_found" };
  if (profile.contacts.length >= MAX_PROFILE_CONTACTS) return { error: "max_reached" };
  const entry = { id: mock.genId("contact"), ...contact };
  profile.contacts.push(entry);
  return { data: entry };
}

export async function updateProfileContact(email, contactId, patch) {
  const profile = findProfileByEmail(email);
  if (!profile) return null;
  const contact = profile.contacts.find((c) => c.id === contactId);
  if (!contact) return null;
  Object.assign(contact, patch);
  return contact;
}

export async function removeProfileContact(email, contactId) {
  const profile = findProfileByEmail(email);
  if (!profile) return false;
  const before = profile.contacts.length;
  profile.contacts = profile.contacts.filter((c) => c.id !== contactId);
  return profile.contacts.length < before;
}

// ------------------------------------------------------------------
// RFx (issued by Paragon procurement to specific suppliers) — mock-data
// only in this iteration.
// ------------------------------------------------------------------
export async function listRfxForSupplier(email) {
  const profile = findProfileByEmail(email);
  if (!profile) return [];
  return mock.rfxList
    .filter((r) => r.targetSubmissionIds.includes(profile.submissionId))
    .map(({ targetSubmissionIds, ...rest }) => rest)
    .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
}

export async function getRfxById(email, rfxId) {
  const profile = findProfileByEmail(email);
  if (!profile) return null;
  const rfx = mock.rfxList.find((r) => r.id === rfxId && r.targetSubmissionIds.includes(profile.submissionId));
  if (!rfx) return null;
  const { targetSubmissionIds, ...rest } = rfx;
  return rest;
}

// ------------------------------------------------------------------
// Quotations submitted by suppliers against an RFx — mock-data only.
// ------------------------------------------------------------------
export async function listQuotationsForSupplier(email) {
  const profile = findProfileByEmail(email);
  if (!profile) return [];
  return mock.quotations
    .filter((q) => q.submissionId === profile.submissionId)
    .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
}

export async function createQuotation(email, payload) {
  const profile = findProfileByEmail(email);
  if (!profile) return { error: "not_found" };
  const rfx = mock.rfxList.find((r) => r.id === payload.rfxId && r.targetSubmissionIds.includes(profile.submissionId));
  if (!rfx) return { error: "invalid_rfx" };
  if (rfx.status !== "open") return { error: "rfx_closed" };

  const quotation = {
    id: mock.genId("quo"),
    rfxId: payload.rfxId,
    submissionId: profile.submissionId,
    currency: payload.currency,
    validUntil: payload.validUntil,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    notes: payload.notes || "",
    items: (payload.items || []).map((it) => ({ id: mock.genId("item"), ...it })),
  };
  mock.quotations.unshift(quotation);
  return { data: quotation };
}

// ------------------------------------------------------------------
// Dev-only: simulated outbound email log (see PRD 9.8 for real requirements)
// ------------------------------------------------------------------
export async function getEmailOutbox() {
  return mock.emailOutbox;
}

// ------------------------------------------------------------------
// Row mappers (real-DB path)
// ------------------------------------------------------------------
function mapSubmissionRowSummary(r) {
  return {
    id: r.id,
    submissionCode: r.submission_code,
    vendorName: r.vendor_name,
    vendorType: r.vendor_type,
    status: r.status,
    submittedAt: r.submitted_at,
    decidedAt: r.decided_at,
  };
}

function mapSubmissionFull(sub, companyRows, addressRow, contactRow) {
  return {
    id: sub.id,
    submissionCode: sub.submission_code,
    legalStatus: sub.legal_status,
    entityTitle: sub.entity_title,
    vendorName: sub.vendor_name,
    vendorType: sub.vendor_type,
    vendorTypeDetail: sub.vendor_type_detail,
    companies: companyRows.map((c) => c.company_name),
    statusOtv: sub.status_otv,
    mobilePhone: sub.mobile_phone,
    phone: sub.phone,
    email: sub.email,
    website: sub.website,
    address: addressRow
      ? {
          address: addressRow.address, country: addressRow.country_code, state: addressRow.state_code,
          city: addressRow.city_code, district: addressRow.district, subdistrict: addressRow.subdistrict, zip: addressRow.zip,
        }
      : null,
    contact: contactRow
      ? {
          contactName: contactRow.contact_name, title: contactRow.title, jobPosition: contactRow.job_position,
          email: contactRow.email, phone: contactRow.phone, mobilePhone: contactRow.mobile_phone, notes: contactRow.notes,
        }
      : null,
    status: sub.status,
    submittedAt: sub.submitted_at,
    decidedAt: sub.decided_at,
    rejectReason: sub.reject_reason,
  };
}
