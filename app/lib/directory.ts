import { cache } from "react";
import sql from "./db";
import { repairRecordStrings } from "./text";

/* ---------- Noms et adresses web ---------- */

/** Supprime « CEDEX » et son numéro : « ROUEN CEDEX 2 » devient « ROUEN ». */
export function cleanCityName(city: string): string {
  return city
    .replace(/\bCEDEX\b\s*\d*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function citySlug(city: string): string {
  return slugify(cleanCityName(city));
}

const SMALL_WORDS = new Set([
  "de", "du", "des", "la", "le", "les", "sur", "sous", "en", "et", "aux", "au", "à", "d", "l",
]);

/** « SAINT-ÉTIENNE-DU-ROUVRAY » devient « Saint-Étienne-du-Rouvray ». */
export function prettyCity(city: string): string {
  const cleaned = cleanCityName(city).toLowerCase();
  return cleaned
    .split(/(\s+|-|')/)
    .map((part, index, parts) => {
      if (!part || /^(\s+|-|')$/.test(part)) return part;
      const isFirst = parts.slice(0, index).every((p) => !p || /^(\s+|-|')$/.test(p));
      if (!isFirst && SMALL_WORDS.has(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

export function departmentSlug(code: string, name: string | null): string {
  const base = name ? slugify(name) : "";
  return base ? `${base}-${code.toLowerCase()}` : code.toLowerCase();
}

/** « seine-maritime-76 » donne « 76 ». Renvoie null si le format est inconnu. */
export function parseDepartmentSlug(slug: string): string | null {
  const match = slug.toLowerCase().match(/(?:^|-)([0-9]{2,3}|2a|2b)$/);
  return match ? match[1].toUpperCase() : null;
}

/* ---------- Requêtes ---------- */

export type DepartmentSummary = {
  department_code: string;
  department_name: string | null;
  total: number;
};

export const getDepartmentList = cache(async (): Promise<DepartmentSummary[]> => {
  const rows = await sql<DepartmentSummary[]>`
    SELECT
      department_code,
      MAX(department_name) AS department_name,
      COUNT(*)::int AS total
    FROM ehpad_establishments
    WHERE department_code IS NOT NULL
    GROUP BY department_code
    ORDER BY department_code ASC
  `;
  return rows.map((row) => repairRecordStrings(row));
});

export type CitySummary = {
  slug: string;
  name: string;
  total: number;
};

function groupCities(rows: { city: string | null; total: number }[]): CitySummary[] {
  const bySlug = new Map<string, CitySummary>();
  for (const row of rows) {
    if (!row.city) continue;
    const slug = citySlug(row.city);
    if (!slug) continue;
    const existing = bySlug.get(slug);
    if (existing) {
      existing.total += row.total;
    } else {
      bySlug.set(slug, { slug, name: prettyCity(row.city), total: row.total });
    }
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export const getDepartmentCities = cache(
  async (departmentCode: string): Promise<CitySummary[]> => {
    const rows = await sql<{ city: string | null; total: number }[]>`
      SELECT city, COUNT(*)::int AS total
      FROM ehpad_establishments
      WHERE department_code = ${departmentCode}
      GROUP BY city
    `;
    return groupCities(rows.map((row) => repairRecordStrings(row)));
  }
);

export const getDepartmentName = cache(
  async (departmentCode: string): Promise<string | null> => {
    const rows = await sql<{ department_name: string | null }[]>`
      SELECT MAX(department_name) AS department_name
      FROM ehpad_establishments
      WHERE department_code = ${departmentCode}
    `;
    return rows[0] ? repairRecordStrings(rows[0]).department_name : null;
  }
);

export type CityEhpad = {
  finess_geo: string;
  name: string;
  city: string | null;
  postal_code: string | null;
  address_line: string | null;
  capacity_total: number | null;
  has_quality_grade: string | null;
  has_score_100: number | null;
  alzheimer_places: number | null;
  has_pasa: boolean;
  has_uhr: boolean;
  accommodation_price_single: number | null;
};

export const getCityEhpads = cache(
  async (departmentCode: string, slug: string): Promise<CityEhpad[]> => {
    const rows = await sql<CityEhpad[]>`
      SELECT
        e.finess_geo,
        e.name,
        e.city,
        e.postal_code,
        e.address_line,
        e.capacity_total,
        e.has_quality_grade,
        e.has_score_100::float8 AS has_score_100,
        e.alzheimer_places,
        e.has_pasa,
        e.has_uhr,
        p.accommodation_price_single::float8 AS accommodation_price_single
      FROM ehpad_establishments e
      LEFT JOIN ehpad_pricing p ON p.finess_geo = e.finess_geo
      WHERE e.department_code = ${departmentCode}
      ORDER BY e.name ASC
    `;
    return rows
      .map((row) => repairRecordStrings(row))
      .filter((row) => row.city && citySlug(row.city) === slug);
  }
);

export type DirectoryEntry = {
  department_code: string;
  department_name: string | null;
  city: string;
};

/** Toutes les villes qui ont au moins un EHPAD, pour le plan du site. */
export const getDirectoryEntries = cache(async (): Promise<DirectoryEntry[]> => {
  const rows = await sql<
    { department_code: string; department_name: string | null; city: string | null }[]
  >`
    SELECT department_code, MAX(department_name) AS department_name, city
    FROM ehpad_establishments
    WHERE department_code IS NOT NULL AND city IS NOT NULL
    GROUP BY department_code, city
  `;
  const seen = new Set<string>();
  const entries: DirectoryEntry[] = [];
  for (const raw of rows) {
    const row = repairRecordStrings(raw);
    if (!row.city) continue;
    const key = `${row.department_code}/${citySlug(row.city)}`;
    if (seen.has(key) || !citySlug(row.city)) continue;
    seen.add(key);
    entries.push({
      department_code: row.department_code,
      department_name: row.department_name,
      city: row.city,
    });
  }
  return entries;
});
