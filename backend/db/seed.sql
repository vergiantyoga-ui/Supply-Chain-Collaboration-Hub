-- =====================================================================
-- Seed data — reference lookups + example accounts + example submissions
-- Run after schema.sql. Mirrors the mock data served by the API when
-- DATABASE_URL is not configured (see lib/mockData.js).
-- =====================================================================

-- ---------------- Reference: vendor type details ----------------
INSERT INTO vendor_type_details (code, vendor_type, label_id, label_en, label_zh, sort_order) VALUES
  ('active_chemical',        'raw_material',        'Bahan Kimia Aktif',                'Active Chemical Ingredients',        '活性化学原料', 1),
  ('herbal_extract',         'raw_material',        'Bahan Baku Herbal & Ekstrak',       'Herbal Raw Material & Extracts',     '草本原料与萃取物', 2),
  ('fragrance_oil',          'raw_material',        'Fragrance & Essential Oil',         'Fragrance & Essential Oil',          '香精与精油', 3),
  ('primary_packaging_raw',  'raw_material',        'Bahan Baku Kemasan Primer',         'Primary Packaging Raw Material',     '初级包装原料', 4),
  ('bottle_jar',             'packaging_material',  'Botol & Jar',                       'Bottles & Jars',                     '瓶罐', 1),
  ('tube',                   'packaging_material',  'Tube',                             'Tubes',                              '软管', 2),
  ('carton_box',             'packaging_material',  'Karton & Dus',                      'Cartons & Boxes',                    '纸箱与盒子', 3),
  ('label_sticker',          'packaging_material',  'Label & Stiker',                    'Labels & Stickers',                  '标签与贴纸', 4),
  ('office_supplies',        'indirect_material',   'Office Supplies (ATK)',             'Office Supplies',                    '办公用品', 1),
  ('mro',                    'indirect_material',   'MRO (Maintenance, Repair, Operations)', 'MRO (Maintenance, Repair, Operations)', '维护维修运营用品 (MRO)', 2),
  ('it_equipment',           'indirect_material',   'Perangkat & Aksesoris IT',          'IT Equipment & Accessories',         'IT设备与配件', 3),
  ('cleaning_service',       'indirect_material',   'Jasa Kebersihan & Sanitasi',        'Cleaning & Sanitation Services',      '清洁与卫生服务', 4);

-- ---------------- Reference: countries / states / cities ----------------
INSERT INTO countries (code, label_id, label_en, label_zh) VALUES
  ('ID', 'Indonesia', 'Indonesia', '印度尼西亚'),
  ('MY', 'Malaysia', 'Malaysia', '马来西亚'),
  ('SG', 'Singapura', 'Singapore', '新加坡');

INSERT INTO states (code, country_code, label_id, label_en, label_zh) VALUES
  ('DKI',   'ID', 'DKI Jakarta', 'DKI Jakarta', '雅加达首都特区'),
  ('JABAR', 'ID', 'Jawa Barat', 'West Java', '西爪哇'),
  ('JATIM', 'ID', 'Jawa Timur', 'East Java', '东爪哇'),
  ('SEL',   'MY', 'Selangor', 'Selangor', '雪兰莪'),
  ('KL',    'MY', 'Wilayah Persekutuan Kuala Lumpur', 'Federal Territory of Kuala Lumpur', '吉隆坡联邦直辖区'),
  ('PEN',   'MY', 'Penang', 'Penang', '槟城'),
  ('SGS',   'SG', 'Singapura', 'Singapore', '新加坡');

INSERT INTO cities (code, state_code, label_id, label_en, label_zh) VALUES
  ('JKP', 'DKI', 'Jakarta Pusat', 'Central Jakarta', '中雅加达'),
  ('JKS', 'DKI', 'Jakarta Selatan', 'South Jakarta', '南雅加达'),
  ('JKB', 'DKI', 'Jakarta Barat', 'West Jakarta', '西雅加达'),
  ('JKT', 'DKI', 'Jakarta Timur', 'East Jakarta', '东雅加达'),
  ('BDG', 'JABAR', 'Bandung', 'Bandung', '万隆'),
  ('BKS', 'JABAR', 'Bekasi', 'Bekasi', '勿加泗'),
  ('BGR', 'JABAR', 'Bogor', 'Bogor', '茂物'),
  ('DPK', 'JABAR', 'Depok', 'Depok', '德博'),
  ('SBY', 'JATIM', 'Surabaya', 'Surabaya', '泗水'),
  ('MLG', 'JATIM', 'Malang', 'Malang', '玛琅'),
  ('SDA', 'JATIM', 'Sidoarjo', 'Sidoarjo', '西多阿佐'),
  ('SA',  'SEL', 'Shah Alam', 'Shah Alam', '莎阿南'),
  ('PJ',  'SEL', 'Petaling Jaya', 'Petaling Jaya', '八打灵再也'),
  ('KLG', 'SEL', 'Klang', 'Klang', '巴生'),
  ('KLC', 'KL',  'Kuala Lumpur', 'Kuala Lumpur', '吉隆坡'),
  ('GT',  'PEN', 'George Town', 'George Town', '乔治市'),
  ('BW',  'PEN', 'Butterworth', 'Butterworth', '北海'),
  ('SGC', 'SGS', 'Singapura', 'Singapore', '新加坡');

-- ---------------- Example accounts ----------------
-- Password for ALL seed accounts (demo only): "Paragon123!"
-- password_hash below is a placeholder; replace with a real bcrypt hash before
-- using this seed against a real authentication implementation.
INSERT INTO users (id, email, password_hash, role, full_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'reviewer@paragon-corp.com', '$2b$10$replaceWithRealBcryptHash', 'internal_staff', 'Nadia Putri'),
  ('22222222-2222-2222-2222-222222222222', 'procurement@shn.co.id', '$2b$10$replaceWithRealBcryptHash', 'supplier', 'Dewi Anggraini');

-- ---------------- Example submissions ----------------
INSERT INTO supplier_submissions (
  id, submission_code, legal_status, entity_title, vendor_name, vendor_type, vendor_type_detail,
  status_otv, mobile_phone, phone, email, website, status, submitted_at, decided_at, reject_reason
) VALUES
  ('a1111111-0000-0000-0000-000000000091', 'SUP-2026-0091', 'badan_usaha', 'PT', 'PT Sumber Herbal Nusantara', 'raw_material', 'herbal_extract',
   'regular', '+62 812-3456-7890', '(022) 456-7890', 'procurement@shn.co.id', 'https://www.shn.co.id', 'pending', '2026-08-28 09:00:00+07', NULL, NULL),
  ('a1111111-0000-0000-0000-000000000088', 'SUP-2026-0088', 'badan_usaha', 'CoLtd', 'Golden Packaging Sdn Bhd', 'packaging_material', 'bottle_jar',
   'regular', '+60 12-345 6789', '+60 3-7845 1122', 'sales@goldenpackaging.my', 'https://www.goldenpackaging.my', 'pending', '2026-08-30 11:00:00+07', NULL, NULL),
  ('a1111111-0000-0000-0000-000000000082', 'SUP-2026-0082', 'badan_usaha', 'CV', 'CV Mitra Kantor Sejahtera', 'indirect_material', 'office_supplies',
   'one_time', '+62 811-2345-678', '(021) 555-0192', 'admin@mitrakantor.co.id', 'https://www.mitrakantor.co.id', 'approved', '2026-08-19 08:30:00+07', '2026-08-21 10:00:00+07', NULL),
  ('a1111111-0000-0000-0000-000000000079', 'SUP-2026-0079', 'perorangan', NULL, 'Budi Santoso', 'raw_material', 'fragrance_oil',
   'one_time', '+62 815-6677-8899', NULL, 'budi.santoso88@gmail.com', NULL, 'rejected', '2026-08-15 14:00:00+07', '2026-08-17 09:00:00+07',
   'Dokumen legalitas (NPWP/NIB) belum dilampirkan dan nama pada rekening bank tidak sesuai dengan nama pendaftar. Silakan lengkapi dokumen dan ajukan kembali.');

INSERT INTO supplier_submission_companies (submission_id, company_name) VALUES
  ('a1111111-0000-0000-0000-000000000091', 'Paragon Corp Indonesia'),
  ('a1111111-0000-0000-0000-000000000088', 'Paragon Corp Malaysia'),
  ('a1111111-0000-0000-0000-000000000082', 'Paragon Corp Indonesia'),
  ('a1111111-0000-0000-0000-000000000082', 'Paragon Corp Malaysia'),
  ('a1111111-0000-0000-0000-000000000079', 'Paragon Corp Indonesia');

INSERT INTO supplier_addresses (submission_id, address, country_code, state_code, city_code, district, subdistrict, zip) VALUES
  ('a1111111-0000-0000-0000-000000000091', 'Jl. Industri Raya No. 12, Kawasan Industri Rancaekek', 'ID', 'JABAR', 'BDG', 'Rancaekek', 'Bojongsalam', '40394'),
  ('a1111111-0000-0000-0000-000000000088', 'Lot 24, Jalan Perusahaan 5, Kawasan Perindustrian Batu Caves', 'MY', 'SEL', 'PJ', NULL, NULL, '68100'),
  ('a1111111-0000-0000-0000-000000000082', 'Jl. Raya Bekasi Km 18 No. 7', 'ID', 'DKI', 'JKT', 'Cakung', 'Penggilingan', '13940'),
  ('a1111111-0000-0000-0000-000000000079', 'Jl. Mawar Melati No. 3, Perumahan Griya Asri', 'ID', 'JATIM', 'SDA', 'Waru', 'Tropodo', '61256');

INSERT INTO supplier_contacts (submission_id, contact_name, title, job_position, email, phone, mobile_phone, notes) VALUES
  ('a1111111-0000-0000-0000-000000000091', 'Dewi Anggraini', 'madam', 'sales', 'dewi.a@shn.co.id', '(022) 456-7891', '+62 813-2233-4455', 'Preferensi komunikasi melalui email.'),
  ('a1111111-0000-0000-0000-000000000088', 'Tan Wei Ling', 'miss', 'finance', 'weiling.tan@goldenpackaging.my', '+60 3-7845 1123', '+60 16-778 2233', 'Mohon proses dipercepat karena ada rencana produksi Q4.'),
  ('a1111111-0000-0000-0000-000000000082', 'Bayu Prakoso', 'mr', 'other', 'bayu.p@mitrakantor.co.id', '(021) 555-0193', '+62 812-9988-7766', NULL),
  ('a1111111-0000-0000-0000-000000000079', 'Budi Santoso', 'mr', 'other', 'budi.santoso88@gmail.com', NULL, '+62 815-6677-8899', 'Menjual minyak atsiri hasil produksi rumahan.');

INSERT INTO approval_audit_log (submission_id, action, actor_email, reason, created_at) VALUES
  ('a1111111-0000-0000-0000-000000000082', 'approved', 'reviewer@paragon-corp.com', NULL, '2026-08-21 10:00:00+07'),
  ('a1111111-0000-0000-0000-000000000079', 'rejected', 'reviewer@paragon-corp.com',
   'Dokumen legalitas (NPWP/NIB) belum dilampirkan dan nama pada rekening bank tidak sesuai dengan nama pendaftar. Silakan lengkapi dokumen dan ajukan kembali.', '2026-08-17 09:00:00+07');
