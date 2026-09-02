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
export async function authenticate(email, _password) {
  // NOTE: this build intentionally does not verify passwords against a real
  // hash — see README "Authentication" section. It simulates a successful
  // login and derives the role from the account domain, matching the
  // behaviour of the interactive HTML mockup delivered earlier in this
  // project. Replace with real credential verification (bcrypt compare +
  // session/JWT issuance) before going to production.
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
  if (existing) return existing;

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
    return rows[0];
  }

  const record = mock.submissions.find((s) => s.id === id);
  if (!record || record.status !== "pending") return null;
  record.status = "approved";
  record.decidedAt = now;
  mock.auditLog.unshift({ id: `log-${Date.now()}`, submissionId: id, action: "approved", actorEmail, reason: null, createdAt: now });
  return { id, status: "approved", decidedAt: now };
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
