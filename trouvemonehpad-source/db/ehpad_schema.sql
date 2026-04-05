CREATE EXTENSION IF NOT EXISTS unaccent;

DROP TABLE IF EXISTS ehpad_pricing;
DROP TABLE IF EXISTS ehpad_has_evaluations;
DROP TABLE IF EXISTS ehpad_establishments;

CREATE TABLE IF NOT EXISTS ehpad_establishments (
  finess_geo TEXT PRIMARY KEY,
  finess_juridique TEXT,
  name TEXT NOT NULL,
  name_long TEXT,
  address_line TEXT,
  postal_code TEXT,
  city TEXT,
  department_code TEXT,
  department_name TEXT,
  category_code TEXT NOT NULL,
  category_label TEXT NOT NULL,
  aggregate_category_code TEXT,
  aggregate_category_label TEXT,
  siret TEXT,
  ape_code TEXT,
  mft_code TEXT,
  mft_label TEXT,
  phone TEXT,
  fax TEXT,
  opening_date DATE,
  authorization_date DATE,
  source_updated_at DATE,
  capacity_total INTEGER,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  legal_status TEXT,
  has_eval_code TEXT,
  has_quality_grade TEXT,
  has_score_100 NUMERIC(5, 2),
  has_eval_date DATE,
  has_eval_closed_at DATE,
  has_evaluator_name TEXT,
  has_nb_ci INTEGER,
  has_nb_ci_sup_3_5 INTEGER,
  has_taux_ci_sup_3_5 NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ehpad_has_evaluations (
  finess_geo TEXT NOT NULL REFERENCES ehpad_establishments (finess_geo) ON DELETE CASCADE,
  eval_code TEXT NOT NULL,
  reason_sociale TEXT,
  eval_date_debut DATE,
  eval_date_fin DATE,
  eval_date_cloture_tech DATE,
  multi_essms BOOLEAN,
  evaluator_name TEXT,
  evaluator_accreditation TEXT,
  nb_at INTEGER,
  legal_status TEXT,
  department_code TEXT,
  department_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  nb_criteres_hors310 INTEGER,
  somme_ponderee_hors310 NUMERIC(8, 2),
  moy_objectifs_hors310 NUMERIC(5, 2),
  has_score_100 NUMERIC(5, 2),
  has_nb_ci INTEGER,
  has_nb_ci_sup_3_5 INTEGER,
  has_taux_ci_sup_3_5 NUMERIC(5, 2),
  has_quality_grade TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (eval_code, finess_geo)
);

CREATE TABLE IF NOT EXISTS ehpad_pricing (
  finess_geo TEXT PRIMARY KEY REFERENCES ehpad_establishments (finess_geo) ON DELETE CASCADE,
  accommodation_price_single NUMERIC(8, 2),
  accommodation_price_double NUMERIC(8, 2),
  dependency_tariff_gir_12 NUMERIC(8, 2),
  dependency_tariff_gir_34 NUMERIC(8, 2),
  dependency_tariff_gir_56 NUMERIC(8, 2),
  source_updated_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ehpad_establishments_department_idx
  ON ehpad_establishments (department_code);

CREATE INDEX IF NOT EXISTS ehpad_establishments_city_idx
  ON ehpad_establishments (lower(city));

CREATE INDEX IF NOT EXISTS ehpad_establishments_name_idx
  ON ehpad_establishments (lower(name));

CREATE INDEX IF NOT EXISTS ehpad_establishments_grade_idx
  ON ehpad_establishments (has_quality_grade);

CREATE INDEX IF NOT EXISTS ehpad_has_evaluations_finess_idx
  ON ehpad_has_evaluations (finess_geo);

CREATE INDEX IF NOT EXISTS ehpad_has_evaluations_eval_date_idx
  ON ehpad_has_evaluations (eval_date_fin DESC);

CREATE INDEX IF NOT EXISTS ehpad_pricing_single_price_idx
  ON ehpad_pricing (accommodation_price_single);
