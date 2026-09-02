-- =====================================================================
-- Paragon Supply Collaboration Hub — PostgreSQL Schema
-- Covers: users/roles, supplier registration (General/Address/Contact),
-- approval workflow + audit log, and reference/lookup data.
-- Reference: PRD-Paragon-Supply-Collaboration-Hub.docx, section 8, 9, 11.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('supplier', 'internal_staff');
CREATE TYPE legal_status_enum AS ENUM ('perorangan', 'badan_usaha');
CREATE TYPE vendor_type_enum AS ENUM ('raw_material', 'packaging_material', 'indirect_material');
CREATE TYPE otv_status_enum AS ENUM ('one_time', 'regular');
CREATE TYPE contact_title_enum AS ENUM ('miss', 'mr', 'madam');
CREATE TYPE job_position_enum AS ENUM ('finance', 'sales', 'quality', 'other');
CREATE TYPE submission_status_enum AS ENUM ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------
-- USERS  (both supplier accounts and internal Paragon staff accounts)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(180) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL,
  full_name       VARCHAR(180),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Password reset tokens (Forgot Password flow — PRD section 7)
CREATE TABLE password_reset_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(255) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- REFERENCE / LOOKUP DATA
-- ---------------------------------------------------------------------
CREATE TABLE vendor_type_details (
  code            VARCHAR(60) PRIMARY KEY,
  vendor_type     vendor_type_enum NOT NULL,
  label_id        VARCHAR(120) NOT NULL,
  label_en        VARCHAR(120) NOT NULL,
  label_zh        VARCHAR(120) NOT NULL,
  sort_order      SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE countries (
  code            VARCHAR(10) PRIMARY KEY,
  label_id        VARCHAR(120) NOT NULL,
  label_en        VARCHAR(120) NOT NULL,
  label_zh        VARCHAR(120) NOT NULL
);

CREATE TABLE states (
  code            VARCHAR(10) PRIMARY KEY,
  country_code    VARCHAR(10) NOT NULL REFERENCES countries(code),
  label_id        VARCHAR(120) NOT NULL,
  label_en        VARCHAR(120) NOT NULL,
  label_zh        VARCHAR(120) NOT NULL
);

CREATE TABLE cities (
  code            VARCHAR(10) PRIMARY KEY,
  state_code      VARCHAR(10) NOT NULL REFERENCES states(code),
  label_id        VARCHAR(120) NOT NULL,
  label_en        VARCHAR(120) NOT NULL,
  label_zh        VARCHAR(120) NOT NULL
);

-- ---------------------------------------------------------------------
-- SUPPLIER SUBMISSIONS  (core registration record — PRD section 8)
-- ---------------------------------------------------------------------
CREATE TABLE supplier_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_code     VARCHAR(20) NOT NULL UNIQUE,      -- e.g. SUP-2026-0091
  created_by_user_id  UUID REFERENCES users(id),

  -- Tab 1: General
  legal_status        legal_status_enum NOT NULL,
  entity_title         VARCHAR(30),                      -- PT/CV/Co. Ltd./Firma/Koperasi; required if legal_status = badan_usaha
  vendor_name          VARCHAR(180) NOT NULL,
  vendor_type          vendor_type_enum NOT NULL,
  vendor_type_detail   VARCHAR(60) NOT NULL REFERENCES vendor_type_details(code),
  status_otv           otv_status_enum NOT NULL,
  mobile_phone         VARCHAR(40) NOT NULL,
  phone                VARCHAR(40),
  email                VARCHAR(180) NOT NULL,
  website              VARCHAR(180),

  status               submission_status_enum NOT NULL DEFAULT 'pending',
  submitted_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at           TIMESTAMPTZ,
  decided_by_user_id   UUID REFERENCES users(id),
  reject_reason        TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Companies targeted by the submission (multi-select: Paragon Corp Indonesia / Malaysia)
CREATE TABLE supplier_submission_companies (
  submission_id   UUID NOT NULL REFERENCES supplier_submissions(id) ON DELETE CASCADE,
  company_name    VARCHAR(80) NOT NULL,
  PRIMARY KEY (submission_id, company_name)
);

-- Tab 2: Supplier Address (1:1 with submission)
CREATE TABLE supplier_addresses (
  submission_id   UUID PRIMARY KEY REFERENCES supplier_submissions(id) ON DELETE CASCADE,
  address         TEXT NOT NULL,
  country_code    VARCHAR(10) NOT NULL REFERENCES countries(code),
  state_code      VARCHAR(10) NOT NULL REFERENCES states(code),
  city_code       VARCHAR(10) NOT NULL REFERENCES cities(code),
  district        VARCHAR(120),
  subdistrict     VARCHAR(120),
  zip             VARCHAR(15) NOT NULL
);

-- Tab 3: Contact Detail (1:1 with submission)
CREATE TABLE supplier_contacts (
  submission_id   UUID PRIMARY KEY REFERENCES supplier_submissions(id) ON DELETE CASCADE,
  contact_name    VARCHAR(180) NOT NULL,
  title           contact_title_enum NOT NULL,
  job_position    job_position_enum NOT NULL,
  email           VARCHAR(180) NOT NULL,
  phone           VARCHAR(40),
  mobile_phone    VARCHAR(40) NOT NULL,
  notes           TEXT
);

-- ---------------------------------------------------------------------
-- APPROVAL AUDIT LOG  (PRD section 9.7 — APRV-11, immutable trail)
-- ---------------------------------------------------------------------
CREATE TABLE approval_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES supplier_submissions(id) ON DELETE CASCADE,
  action          VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
  actor_user_id   UUID REFERENCES users(id),
  actor_email     VARCHAR(180) NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX idx_submissions_status ON supplier_submissions(status);
CREATE INDEX idx_submissions_submitted_at ON supplier_submissions(submitted_at DESC);
CREATE INDEX idx_states_country ON states(country_code);
CREATE INDEX idx_cities_state ON cities(state_code);
CREATE INDEX idx_vendor_type_details_type ON vendor_type_details(vendor_type);
CREATE INDEX idx_audit_log_submission ON approval_audit_log(submission_id);
