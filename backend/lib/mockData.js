/**
 * In-memory mock dataset — the default data source for every API route when
 * DATABASE_URL is not configured. Field names/shapes mirror db/schema.sql
 * and db/seed.sql exactly, so switching to real Postgres later is a
 * drop-in replacement (see lib/repository.js).
 *
 * NOTE: this module holds state in a plain JS array for the lifetime of the
 * Next.js process. It resets on server restart — expected behaviour for a
 * mock/demo backend, not a production data store.
 */

export const vendorTypeDetails = [
  { code: "active_chemical", vendorType: "raw_material", label: { id: "Bahan Kimia Aktif", en: "Active Chemical Ingredients", zh: "活性化学原料" } },
  { code: "herbal_extract", vendorType: "raw_material", label: { id: "Bahan Baku Herbal & Ekstrak", en: "Herbal Raw Material & Extracts", zh: "草本原料与萃取物" } },
  { code: "fragrance_oil", vendorType: "raw_material", label: { id: "Fragrance & Essential Oil", en: "Fragrance & Essential Oil", zh: "香精与精油" } },
  { code: "primary_packaging_raw", vendorType: "raw_material", label: { id: "Bahan Baku Kemasan Primer", en: "Primary Packaging Raw Material", zh: "初级包装原料" } },
  { code: "bottle_jar", vendorType: "packaging_material", label: { id: "Botol & Jar", en: "Bottles & Jars", zh: "瓶罐" } },
  { code: "tube", vendorType: "packaging_material", label: { id: "Tube", en: "Tubes", zh: "软管" } },
  { code: "carton_box", vendorType: "packaging_material", label: { id: "Karton & Dus", en: "Cartons & Boxes", zh: "纸箱与盒子" } },
  { code: "label_sticker", vendorType: "packaging_material", label: { id: "Label & Stiker", en: "Labels & Stickers", zh: "标签与贴纸" } },
  { code: "office_supplies", vendorType: "indirect_material", label: { id: "Office Supplies (ATK)", en: "Office Supplies", zh: "办公用品" } },
  { code: "mro", vendorType: "indirect_material", label: { id: "MRO (Maintenance, Repair, Operations)", en: "MRO (Maintenance, Repair, Operations)", zh: "维护维修运营用品 (MRO)" } },
  { code: "it_equipment", vendorType: "indirect_material", label: { id: "Perangkat & Aksesoris IT", en: "IT Equipment & Accessories", zh: "IT设备与配件" } },
  { code: "cleaning_service", vendorType: "indirect_material", label: { id: "Jasa Kebersihan & Sanitasi", en: "Cleaning & Sanitation Services", zh: "清洁与卫生服务" } },
];

export const geo = {
  ID: {
    label: { id: "Indonesia", en: "Indonesia", zh: "印度尼西亚" },
    states: {
      DKI: {
        label: { id: "DKI Jakarta", en: "DKI Jakarta", zh: "雅加达首都特区" },
        cities: {
          JKP: { id: "Jakarta Pusat", en: "Central Jakarta", zh: "中雅加达" },
          JKS: { id: "Jakarta Selatan", en: "South Jakarta", zh: "南雅加达" },
          JKB: { id: "Jakarta Barat", en: "West Jakarta", zh: "西雅加达" },
          JKT: { id: "Jakarta Timur", en: "East Jakarta", zh: "东雅加达" },
        },
      },
      JABAR: {
        label: { id: "Jawa Barat", en: "West Java", zh: "西爪哇" },
        cities: {
          BDG: { id: "Bandung", en: "Bandung", zh: "万隆" },
          BKS: { id: "Bekasi", en: "Bekasi", zh: "勿加泗" },
          BGR: { id: "Bogor", en: "Bogor", zh: "茂物" },
          DPK: { id: "Depok", en: "Depok", zh: "德博" },
        },
      },
      JATIM: {
        label: { id: "Jawa Timur", en: "East Java", zh: "东爪哇" },
        cities: {
          SBY: { id: "Surabaya", en: "Surabaya", zh: "泗水" },
          MLG: { id: "Malang", en: "Malang", zh: "玛琅" },
          SDA: { id: "Sidoarjo", en: "Sidoarjo", zh: "西多阿佐" },
        },
      },
    },
  },
  MY: {
    label: { id: "Malaysia", en: "Malaysia", zh: "马来西亚" },
    states: {
      SEL: {
        label: { id: "Selangor", en: "Selangor", zh: "雪兰莪" },
        cities: {
          SA: { id: "Shah Alam", en: "Shah Alam", zh: "莎阿南" },
          PJ: { id: "Petaling Jaya", en: "Petaling Jaya", zh: "八打灵再也" },
          KLG: { id: "Klang", en: "Klang", zh: "巴生" },
        },
      },
      KL: {
        label: { id: "Wilayah Persekutuan Kuala Lumpur", en: "Federal Territory of Kuala Lumpur", zh: "吉隆坡联邦直辖区" },
        cities: { KLC: { id: "Kuala Lumpur", en: "Kuala Lumpur", zh: "吉隆坡" } },
      },
      PEN: {
        label: { id: "Penang", en: "Penang", zh: "槟城" },
        cities: {
          GT: { id: "George Town", en: "George Town", zh: "乔治市" },
          BW: { id: "Butterworth", en: "Butterworth", zh: "北海" },
        },
      },
    },
  },
  SG: {
    label: { id: "Singapura", en: "Singapore", zh: "新加坡" },
    states: {
      SGS: {
        label: { id: "Singapura", en: "Singapore", zh: "新加坡" },
        cities: { SGC: { id: "Singapura", en: "Singapore", zh: "新加坡" } },
      },
    },
  },
};

export const users = [
  { id: "11111111-1111-1111-1111-111111111111", email: "reviewer@paragon-corp.com", role: "internal_staff", fullName: "Nadia Putri" },
  { id: "22222222-2222-2222-2222-222222222222", email: "procurement@shn.co.id", role: "supplier", fullName: "Dewi Anggraini" },
  // Pre-seeded supplier account for the ALREADY-APPROVED submission (SUP-2026-0082), so the
  // reviewer flow can be demoed end-to-end without needing to click Approve first.
  // Password is intentionally plain/known for demo purposes: "Paragon123!"
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "bayu.p@mitrakantor.co.id",
    role: "supplier",
    fullName: "Bayu Prakoso",
    password: "Paragon123!",
    submissionId: "a1111111-0000-0000-0000-000000000082",
  },
];

// Simulated outbound emails. In production this would be replaced by a real
// transactional email provider call (SES, Postmark, SendGrid, etc.) — see
// PRD section 9.8. Exposed read-only via GET /api/dev/email-outbox purely so
// this mock build is testable without a real mailbox.
export const emailOutbox = [];

export function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function genMockPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Supplier profile data (PRD follow-up: post-login supplier self-service —
 * Tax Detail, Document Upload, License & Certificate, Purchase & Invoicing,
 * Contact Detail). Keyed by submissionId, which is the durable link between
 * a supplier's account and their original registration data.
 */
export const supplierProfiles = {
  "a1111111-0000-0000-0000-000000000082": {
    submissionId: "a1111111-0000-0000-0000-000000000082",
    userEmail: "bayu.p@mitrakantor.co.id",
    taxDetail: { nik: "3201234567890001", npwp: "01.234.567.8-901.000", ktp: "3201234567890001", siup: "503/SIUP-K/2021/DPMPTSP" },
    documents: [
      { id: "doc-1", type: "akta_pendirian", fileName: "akta-pendirian-mitra-kantor.pdf", uploadedAt: "2026-08-22T09:00:00+07:00" },
      { id: "doc-2", type: "sk_pendirian", fileName: "sk-kemenkumham-mitra-kantor.pdf", uploadedAt: "2026-08-22T09:05:00+07:00" },
    ],
    licenses: [
      { id: "lic-1", type: "halal", certificateNumber: "ID00123456789012", issueDate: "2025-01-10", expiryDate: "2027-01-10", fileName: "sertifikat-halal.pdf" },
    ],
    bankAccounts: [
      { id: "bank-1", bankName: "Bank Central Asia (BCA)", accountNumber: "1234567890", accountHolder: "CV Mitra Kantor Sejahtera", currency: "IDR", termsOfPayment: "net_30" },
    ],
    contacts: [
      { id: "contact-1", contactName: "Bayu Prakoso", title: "mr", jobPosition: "other", email: "bayu.p@mitrakantor.co.id", phone: "(021) 555-0193", mobilePhone: "+62 812-9988-7766", notes: "" },
    ],
  },
};

export function createInitialSupplierProfile(submission) {
  return {
    submissionId: submission.id,
    userEmail: submission.contact.email,
    taxDetail: { nik: "", npwp: "", ktp: "", siup: "" },
    documents: [],
    licenses: [],
    bankAccounts: [],
    contacts: [{ id: genId("contact"), ...submission.contact }],
  };
}

/**
 * RFx (RFI/RFP/RFQ) issued by Paragon procurement to specific suppliers.
 * `targetSubmissionIds` links an RFx to the supplier(s) invited to respond.
 */
export const rfxList = [
  {
    id: "rfx-2026-014",
    code: "RFQ-2026-014",
    title: "Pengadaan Office Supplies Kuartal Q4 2026",
    type: "rfq",
    category: "indirect_material",
    issuedAt: "2026-08-25T09:00:00+07:00",
    deadline: "2026-09-15T17:00:00+07:00",
    status: "open",
    description: "Paragon Corp Indonesia mengundang Anda untuk mengajukan penawaran harga kebutuhan office supplies periode Oktober\u2013Desember 2026.",
    targetSubmissionIds: ["a1111111-0000-0000-0000-000000000082"],
  },
  {
    id: "rfx-2026-009",
    code: "RFI-2026-009",
    title: "Survei Kapasitas Produksi Jasa Kebersihan 2027",
    type: "rfi",
    category: "indirect_material",
    issuedAt: "2026-08-05T09:00:00+07:00",
    deadline: "2026-08-20T17:00:00+07:00",
    status: "closed",
    description: "Pengumpulan informasi kapasitas dan cakupan layanan kebersihan untuk perencanaan anggaran 2027.",
    targetSubmissionIds: ["a1111111-0000-0000-0000-000000000082"],
  },
];

export const quotations = [
  {
    id: "quo-2026-005",
    rfxId: "rfx-2026-009",
    submissionId: "a1111111-0000-0000-0000-000000000082",
    currency: "IDR",
    validUntil: "2026-09-01",
    status: "submitted",
    submittedAt: "2026-08-18T14:00:00+07:00",
    notes: "Termasuk jasa kebersihan area kantor dan gudang, 5 hari kerja per minggu.",
    items: [
      { id: "item-1", itemName: "Jasa kebersihan kantor (per bulan)", quantity: 1, unitPrice: 8500000, uom: "bulan" },
    ],
  },
];

// submissions is mutable (push / status updates) — acts as the mock "table".
export const submissions = [
  {
    id: "a1111111-0000-0000-0000-000000000091",
    submissionCode: "SUP-2026-0091",
    legalStatus: "badan_usaha",
    entityTitle: "PT",
    vendorName: "PT Sumber Herbal Nusantara",
    vendorType: "raw_material",
    vendorTypeDetail: "herbal_extract",
    companies: ["Paragon Corp Indonesia"],
    statusOtv: "regular",
    mobilePhone: "+62 812-3456-7890",
    phone: "(022) 456-7890",
    email: "procurement@shn.co.id",
    website: "https://www.shn.co.id",
    address: {
      address: "Jl. Industri Raya No. 12, Kawasan Industri Rancaekek",
      country: "ID", state: "JABAR", city: "BDG",
      district: "Rancaekek", subdistrict: "Bojongsalam", zip: "40394",
    },
    contact: {
      contactName: "Dewi Anggraini", title: "madam", jobPosition: "sales",
      email: "dewi.a@shn.co.id", phone: "(022) 456-7891", mobilePhone: "+62 813-2233-4455",
      notes: "Preferensi komunikasi melalui email.",
    },
    status: "pending",
    submittedAt: "2026-08-28T09:00:00+07:00",
    decidedAt: null,
    rejectReason: null,
  },
  {
    id: "a1111111-0000-0000-0000-000000000088",
    submissionCode: "SUP-2026-0088",
    legalStatus: "badan_usaha",
    entityTitle: "CoLtd",
    vendorName: "Golden Packaging Sdn Bhd",
    vendorType: "packaging_material",
    vendorTypeDetail: "bottle_jar",
    companies: ["Paragon Corp Malaysia"],
    statusOtv: "regular",
    mobilePhone: "+60 12-345 6789",
    phone: "+60 3-7845 1122",
    email: "sales@goldenpackaging.my",
    website: "https://www.goldenpackaging.my",
    address: {
      address: "Lot 24, Jalan Perusahaan 5, Kawasan Perindustrian Batu Caves",
      country: "MY", state: "SEL", city: "PJ",
      district: "", subdistrict: "", zip: "68100",
    },
    contact: {
      contactName: "Tan Wei Ling", title: "miss", jobPosition: "finance",
      email: "weiling.tan@goldenpackaging.my", phone: "+60 3-7845 1123", mobilePhone: "+60 16-778 2233",
      notes: "Mohon proses dipercepat karena ada rencana produksi Q4.",
    },
    status: "pending",
    submittedAt: "2026-08-30T11:00:00+07:00",
    decidedAt: null,
    rejectReason: null,
  },
  {
    id: "a1111111-0000-0000-0000-000000000082",
    submissionCode: "SUP-2026-0082",
    legalStatus: "badan_usaha",
    entityTitle: "CV",
    vendorName: "CV Mitra Kantor Sejahtera",
    vendorType: "indirect_material",
    vendorTypeDetail: "office_supplies",
    companies: ["Paragon Corp Indonesia", "Paragon Corp Malaysia"],
    statusOtv: "one_time",
    mobilePhone: "+62 811-2345-678",
    phone: "(021) 555-0192",
    email: "admin@mitrakantor.co.id",
    website: "https://www.mitrakantor.co.id",
    address: {
      address: "Jl. Raya Bekasi Km 18 No. 7",
      country: "ID", state: "DKI", city: "JKT",
      district: "Cakung", subdistrict: "Penggilingan", zip: "13940",
    },
    contact: {
      contactName: "Bayu Prakoso", title: "mr", jobPosition: "other",
      email: "bayu.p@mitrakantor.co.id", phone: "(021) 555-0193", mobilePhone: "+62 812-9988-7766",
      notes: "",
    },
    status: "approved",
    submittedAt: "2026-08-19T08:30:00+07:00",
    decidedAt: "2026-08-21T10:00:00+07:00",
    rejectReason: null,
  },
  {
    id: "a1111111-0000-0000-0000-000000000079",
    submissionCode: "SUP-2026-0079",
    legalStatus: "perorangan",
    entityTitle: null,
    vendorName: "Budi Santoso",
    vendorType: "raw_material",
    vendorTypeDetail: "fragrance_oil",
    companies: ["Paragon Corp Indonesia"],
    statusOtv: "one_time",
    mobilePhone: "+62 815-6677-8899",
    phone: "",
    email: "budi.santoso88@gmail.com",
    website: "",
    address: {
      address: "Jl. Mawar Melati No. 3, Perumahan Griya Asri",
      country: "ID", state: "JATIM", city: "SDA",
      district: "Waru", subdistrict: "Tropodo", zip: "61256",
    },
    contact: {
      contactName: "Budi Santoso", title: "mr", jobPosition: "other",
      email: "budi.santoso88@gmail.com", phone: "", mobilePhone: "+62 815-6677-8899",
      notes: "Menjual minyak atsiri hasil produksi rumahan.",
    },
    status: "rejected",
    submittedAt: "2026-08-15T14:00:00+07:00",
    decidedAt: "2026-08-17T09:00:00+07:00",
    rejectReason: "Dokumen legalitas (NPWP/NIB) belum dilampirkan dan nama pada rekening bank tidak sesuai dengan nama pendaftar. Silakan lengkapi dokumen dan ajukan kembali.",
  },
];

export const auditLog = [
  { id: "log-1", submissionId: "a1111111-0000-0000-0000-000000000082", action: "approved", actorEmail: "reviewer@paragon-corp.com", reason: null, createdAt: "2026-08-21T10:00:00+07:00" },
  { id: "log-2", submissionId: "a1111111-0000-0000-0000-000000000079", action: "rejected", actorEmail: "reviewer@paragon-corp.com", reason: "Dokumen legalitas (NPWP/NIB) belum dilampirkan dan nama pada rekening bank tidak sesuai dengan nama pendaftar. Silakan lengkapi dokumen dan ajukan kembali.", createdAt: "2026-08-17T09:00:00+07:00" },
];

let submissionSequence = 92; // next mock submission number after SUP-2026-0091
export function nextSubmissionCode() {
  submissionSequence += 1;
  return `SUP-2026-${String(submissionSequence).padStart(4, "0")}`;
}
