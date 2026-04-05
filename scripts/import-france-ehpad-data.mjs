import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import proj4 from "proj4";
import * as XLSX from "xlsx";

const DATASETS = {
  hasEvaluations:
    "https://minio.data.has-sante.fr/synae/data/prod/open_data/open_data_echelle_qualite.xlsx",
  finessEstablishments:
    "https://static.data.gouv.fr/resources/finess-extraction-du-fichier-des-etablissements/20260312-094547/etalab-cs1100507-stock-20260311-0343.csv",
  finessEquipments:
    "https://static.data.gouv.fr/resources/finess-extraction-des-equipements-sociaux-et-medico-sociaux/20260312-100627/etalab-cs1100505-stock-20260311-0344.csv",
  pricing:
    "https://www.data.gouv.fr/api/1/datasets/r/ca5315b0-f966-4a43-bd8b-434b0ddbdc3d",
};

const EHPAD_CATEGORY_CODE = "500";
const EHPAD_DISCIPLINE_CODE = "924";
const FULL_TIME_ACTIVITY_CODE = "11";
const BATCH_SIZE = 500;

proj4.defs(
  "EPSG:2154",
  "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 " +
    "+x_0=700000 +y_0=6600000 +ellps=GRS80 " +
    "+towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);

function toDate(value) {
  if (!value) {
    return null;
  }

  const iso = String(value).slice(0, 10);
  return iso || null;
}

function toTimestamp(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value) {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

function parseBoolean(value) {
  if (value === true || value === "TRUE") {
    return true;
  }
  if (value === false || value === "FALSE") {
    return false;
  }
  return null;
}

function cleanText(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim().replace(/\s+/g, " ");
  return normalized || null;
}

function parsePostalLine(line) {
  const cleaned = cleanText(line);
  if (!cleaned) {
    return { postalCode: null, city: null };
  }

  const match = cleaned.match(/^(\d{5})\s+(.*)$/);
  if (!match) {
    return { postalCode: null, city: cleaned };
  }

  return {
    postalCode: match[1],
    city: cleanText(match[2]),
  };
}

function buildAddress(parts) {
  const values = parts
    .map((value) => cleanText(value))
    .filter(Boolean);
  return values.length > 0 ? values.join(" ") : null;
}

function lambert93ToWgs84(x, y) {
  const coordX = toNumber(x);
  const coordY = toNumber(y);
  if (coordX === null || coordY === null) {
    return { latitude: null, longitude: null };
  }

  const [longitude, latitude] = proj4("EPSG:2154", "WGS84", [coordX, coordY]);
  return {
    latitude: Number(latitude.toFixed(8)),
    longitude: Number(longitude.toFixed(8)),
  };
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function fetchLatin1Text(url) {
  const buffer = await fetchBuffer(url);
  return buffer.toString("latin1");
}

function readXlsxRows(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, {
    defval: null,
    raw: false,
  });
}

function readCsvRows(csvText) {
  const workbook = XLSX.read(csvText, { type: "string", FS: ";" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, {
    defval: null,
    raw: false,
  });
}

function parseFinessEstablishments(csvText) {
  const establishments = new Map();

  for (const rawLine of csvText.split(/\r?\n/)) {
    if (!rawLine) {
      continue;
    }

    const row = rawLine.split(";");
    const section = row[0];

    if (section === "structureet") {
      const categoryCode = cleanText(row[18]);
      if (categoryCode !== EHPAD_CATEGORY_CODE) {
        continue;
      }

      const { postalCode, city } = parsePostalLine(row[15]);
      establishments.set(row[1], {
        finessGeo: row[1],
        finessJuridique: cleanText(row[2]),
        name: cleanText(row[3]),
        nameLong: cleanText(row[4]),
        addressLine: buildAddress([row[7], row[8], row[9], row[10], row[11]]),
        postalCode,
        city,
        departmentCode: cleanText(row[13]),
        departmentName: cleanText(row[14]),
        categoryCode,
        categoryLabel: cleanText(row[19]),
        aggregateCategoryCode: cleanText(row[20]),
        aggregateCategoryLabel: cleanText(row[21]),
        siret: cleanText(row[22]),
        apeCode: cleanText(row[23]),
        mftCode: cleanText(row[24]),
        mftLabel: cleanText(row[25]),
        phone: cleanText(row[16]),
        fax: cleanText(row[17]),
        openingDate: toDate(row[28]),
        authorizationDate: toDate(row[29]),
        sourceUpdatedAt: toDate(row[30]),
        capacityTotal: null,
        latitude: null,
        longitude: null,
        legalStatus: null,
      });
      continue;
    }

    if (section === "geolocalisation") {
      const establishment = establishments.get(row[1]);
      if (!establishment) {
        continue;
      }

      const { latitude, longitude } = lambert93ToWgs84(row[2], row[3]);
      establishment.latitude = latitude;
      establishment.longitude = longitude;
    }
  }

  return establishments;
}

function parseFinessCapacities(csvText, establishments) {
  for (const rawLine of csvText.split(/\r?\n/)) {
    if (!rawLine) {
      continue;
    }

    const row = rawLine.split(";");
    if (row[0] !== "equipementsocial") {
      continue;
    }

    const establishment = establishments.get(row[1]);
    if (!establishment) {
      continue;
    }

    const disciplineCode = cleanText(row[2]);
    const activityCode = cleanText(row[4]);
    const installationDeleted = cleanText(row[15]) === "O";
    const authorizationDeleted = cleanText(row[24]) === "O";

    if (
      disciplineCode !== EHPAD_DISCIPLINE_CODE ||
      activityCode !== FULL_TIME_ACTIVITY_CODE ||
      installationDeleted ||
      authorizationDeleted
    ) {
      continue;
    }

    const capacity = toInteger(row[18]) ?? toInteger(row[9]);
    if (capacity === null) {
      continue;
    }

    establishment.capacityTotal = (establishment.capacityTotal ?? 0) + capacity;
  }
}

function parseHasEvaluations(buffer) {
  const rows = readXlsxRows(buffer);
  const evaluations = [];
  const latestByFiness = new Map();

  for (const row of rows) {
    if (cleanText(row.essms_categ_finess_code) !== EHPAD_CATEGORY_CODE) {
      continue;
    }

    const evaluation = {
      evalCode: cleanText(row.eval_code),
      finessGeo: cleanText(row.finess_geo),
      reasonSociale: cleanText(row.raison_sociale),
      evalDateDebut: toDate(row.eval_date_debut),
      evalDateFin: toDate(row.eval_date_fin),
      evalDateClotureTech: toDate(row.eval_date_cloture_tech),
      multiEssms: parseBoolean(row.multi_essms),
      evaluatorName: cleanText(row.oe_nom),
      evaluatorAccreditation: cleanText(row.oe_numero_accreditation),
      nbAt: toInteger(row.nb_at),
      legalStatus: cleanText(row.essms_statut_juridique),
      departmentCode: cleanText(row.departement_code),
      departmentName: cleanText(row.departement_libelle),
      latitude: toNumber(row.latitude),
      longitude: toNumber(row.longitude),
      nbCriteresHors310: toInteger(row.nb_criteres_hors310),
      sommePondereeHors310: toNumber(row.somme_ponderee_hors310),
      moyObjectifsHors310: toNumber(row.moy_objectifs_hors310),
      hasScore100: toNumber(row.moy_objectifs_100),
      hasNbCi: toInteger(row.nb_ci),
      hasNbCiSup35: toInteger(row.nb_ci_sup_3_5),
      hasTauxCiSup35: toNumber(row.taux_ci_sup_3_5),
      hasQualityGrade: cleanText(row.indice_qualite),
    };

    if (!evaluation.evalCode || !evaluation.finessGeo) {
      continue;
    }

    evaluations.push(evaluation);

    const current = latestByFiness.get(evaluation.finessGeo);
    const currentDate = current?.evalDateFin ?? "";
    const nextDate = evaluation.evalDateFin ?? "";
    if (!current || nextDate > currentDate) {
      latestByFiness.set(evaluation.finessGeo, evaluation);
    }
  }

  return {
    evaluations,
    latestByFiness,
  };
}

function parsePricing(csvText) {
  const rows = readCsvRows(csvText);
  const pricingByFiness = new Map();

  for (const row of rows) {
    const finessGeo = cleanText(row.finessEt);
    if (!finessGeo) {
      continue;
    }

    const nextPricing = {
      finessGeo,
      accommodationPriceSingle:
        toNumber(row.prixHebPermCs) ?? toNumber(row.prixHebPermCsa),
      accommodationPriceDouble:
        toNumber(row.prixHebPermCd) ?? toNumber(row.prixHebPermCda),
      dependencyTariffGir12: toNumber(row.TARIF_GIR_12),
      dependencyTariffGir34: toNumber(row.TARIF_GIR_34),
      dependencyTariffGir56: toNumber(row.TARIF_GIR_56),
      sourceUpdatedAt: toTimestamp(row.DATE_MAJ),
    };

    const currentPricing = pricingByFiness.get(finessGeo);
    const currentUpdatedAt = currentPricing?.sourceUpdatedAt?.getTime() ?? -Infinity;
    const nextUpdatedAt = nextPricing.sourceUpdatedAt?.getTime() ?? -Infinity;

    if (!currentPricing || nextUpdatedAt >= currentUpdatedAt) {
      pricingByFiness.set(finessGeo, nextPricing);
    }
  }

  return {
    sourceRowCount: rows.length,
    pricingRows: Array.from(pricingByFiness.values()),
  };
}

function toEstablishmentRow(establishment, latestEvaluation) {
  return {
    finess_geo: establishment.finessGeo,
    finess_juridique: establishment.finessJuridique,
    name: establishment.name,
    name_long: establishment.nameLong,
    address_line: establishment.addressLine,
    postal_code: establishment.postalCode,
    city: establishment.city,
    department_code: establishment.departmentCode,
    department_name: establishment.departmentName,
    category_code: establishment.categoryCode,
    category_label: establishment.categoryLabel,
    aggregate_category_code: establishment.aggregateCategoryCode,
    aggregate_category_label: establishment.aggregateCategoryLabel,
    siret: establishment.siret,
    ape_code: establishment.apeCode,
    mft_code: establishment.mftCode,
    mft_label: establishment.mftLabel,
    phone: establishment.phone,
    fax: establishment.fax,
    opening_date: establishment.openingDate,
    authorization_date: establishment.authorizationDate,
    source_updated_at: establishment.sourceUpdatedAt,
    capacity_total: establishment.capacityTotal,
    latitude: latestEvaluation?.latitude ?? establishment.latitude,
    longitude: latestEvaluation?.longitude ?? establishment.longitude,
    legal_status: latestEvaluation?.legalStatus ?? establishment.legalStatus,
    has_eval_code: latestEvaluation?.evalCode ?? null,
    has_quality_grade: latestEvaluation?.hasQualityGrade ?? null,
    has_score_100: latestEvaluation?.hasScore100 ?? null,
    has_eval_date: latestEvaluation?.evalDateFin ?? null,
    has_eval_closed_at: latestEvaluation?.evalDateClotureTech ?? null,
    has_evaluator_name: latestEvaluation?.evaluatorName ?? null,
    has_nb_ci: latestEvaluation?.hasNbCi ?? null,
    has_nb_ci_sup_3_5: latestEvaluation?.hasNbCiSup35 ?? null,
    has_taux_ci_sup_3_5: latestEvaluation?.hasTauxCiSup35 ?? null,
    updated_at: new Date(),
  };
}

function toEvaluationRow(evaluation) {
  return {
    eval_code: evaluation.evalCode,
    finess_geo: evaluation.finessGeo,
    reason_sociale: evaluation.reasonSociale,
    eval_date_debut: evaluation.evalDateDebut,
    eval_date_fin: evaluation.evalDateFin,
    eval_date_cloture_tech: evaluation.evalDateClotureTech,
    multi_essms: evaluation.multiEssms,
    evaluator_name: evaluation.evaluatorName,
    evaluator_accreditation: evaluation.evaluatorAccreditation,
    nb_at: evaluation.nbAt,
    legal_status: evaluation.legalStatus,
    department_code: evaluation.departmentCode,
    department_name: evaluation.departmentName,
    latitude: evaluation.latitude,
    longitude: evaluation.longitude,
    nb_criteres_hors310: evaluation.nbCriteresHors310,
    somme_ponderee_hors310: evaluation.sommePondereeHors310,
    moy_objectifs_hors310: evaluation.moyObjectifsHors310,
    has_score_100: evaluation.hasScore100,
    has_nb_ci: evaluation.hasNbCi,
    has_nb_ci_sup_3_5: evaluation.hasNbCiSup35,
    has_taux_ci_sup_3_5: evaluation.hasTauxCiSup35,
    has_quality_grade: evaluation.hasQualityGrade,
  };
}

function toPricingRow(pricing) {
  return {
    finess_geo: pricing.finessGeo,
    accommodation_price_single: pricing.accommodationPriceSingle,
    accommodation_price_double: pricing.accommodationPriceDouble,
    dependency_tariff_gir_12: pricing.dependencyTariffGir12,
    dependency_tariff_gir_34: pricing.dependencyTariffGir34,
    dependency_tariff_gir_56: pricing.dependencyTariffGir56,
    source_updated_at: pricing.sourceUpdatedAt,
    updated_at: new Date(),
  };
}

async function insertBatches(sql, tableName, rows) {
  if (rows.length === 0) {
    return;
  }

  const columns = Object.keys(rows[0]);
  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    await sql`INSERT INTO ${sql(tableName)} ${sql(batch, columns)}`;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  console.log("Fetching official datasets...");
  const [hasBuffer, establishmentsText, equipmentsText, pricingText] = await Promise.all([
    fetchBuffer(DATASETS.hasEvaluations),
    fetchLatin1Text(DATASETS.finessEstablishments),
    fetchLatin1Text(DATASETS.finessEquipments),
    fetchBuffer(DATASETS.pricing).then((buffer) => buffer.toString("utf8")),
  ]);

  console.log("Parsing FINESS establishments...");
  const establishments = parseFinessEstablishments(establishmentsText);
  console.log(`Found ${establishments.size} current FINESS EHPAD establishments.`);

  console.log("Parsing FINESS capacities...");
  parseFinessCapacities(equipmentsText, establishments);

  console.log("Parsing HAS evaluations...");
  const { evaluations, latestByFiness } = parseHasEvaluations(hasBuffer);
  console.log(`Found ${evaluations.length} HAS EHPAD evaluation rows.`);

  console.log("Parsing CNSA pricing...");
  const { sourceRowCount: pricingSourceRowCount, pricingRows } = parsePricing(pricingText);
  console.log(
    `Found ${pricingSourceRowCount} CNSA pricing source rows (${pricingRows.length} unique FINESS rows).`,
  );

  const establishmentRows = [];
  let establishmentsWithHas = 0;
  let establishmentsWithCapacity = 0;

  for (const establishment of establishments.values()) {
    const latestEvaluation = latestByFiness.get(establishment.finessGeo) ?? null;
    if (latestEvaluation) {
      establishmentsWithHas += 1;
    }
    if (establishment.capacityTotal !== null) {
      establishmentsWithCapacity += 1;
    }

    establishmentRows.push(toEstablishmentRow(establishment, latestEvaluation));
  }

  const evaluationRows = evaluations
    .filter((evaluation) => establishments.has(evaluation.finessGeo))
    .map(toEvaluationRow);

  const matchedPricingRows = pricingRows
    .filter((pricing) => establishments.has(pricing.finessGeo))
    .map(toPricingRow);

  console.log("Creating schema and loading Neon...");
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
    max: 1,
  });

  try {
    const schemaPath = path.join(process.cwd(), "db", "ehpad_schema.sql");
    const schemaSql = await fs.readFile(schemaPath, "utf8");

    await sql.begin(async (transaction) => {
      await transaction.unsafe(schemaSql);
      await transaction`TRUNCATE TABLE ehpad_pricing, ehpad_has_evaluations, ehpad_establishments RESTART IDENTITY CASCADE`;

      await insertBatches(transaction, "ehpad_establishments", establishmentRows);
      await insertBatches(transaction, "ehpad_has_evaluations", evaluationRows);
      await insertBatches(transaction, "ehpad_pricing", matchedPricingRows);
    });
  } finally {
    await sql.end();
  }

  const gradeCounts = evaluationRows.reduce((accumulator, evaluation) => {
    const grade = evaluation.has_quality_grade ?? "unknown";
    accumulator[grade] = (accumulator[grade] ?? 0) + 1;
    return accumulator;
  }, {});

  console.log(
    JSON.stringify(
      {
        sources: DATASETS,
        imported: {
          establishments: establishmentRows.length,
          evaluations: evaluationRows.length,
          pricingRowsFromSource: pricingSourceRowCount,
          pricingRowsUniqueByFiness: pricingRows.length,
          pricingRowsMatchedByFiness: matchedPricingRows.length,
          pricingRowsUnmatchedByFiness: pricingRows.length - matchedPricingRows.length,
          establishmentsWithHas,
          establishmentsWithCapacity,
          establishmentsWithPricing: matchedPricingRows.length,
        },
        gradeCounts,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
