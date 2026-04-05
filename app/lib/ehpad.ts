import { cache } from "react";
import sql from "./db";
import { repairRecordStrings } from "./text";

export type EhpadDetail = {
  finess_geo: string;
  name: string;
  name_long: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  department_code: string | null;
  department_name: string | null;
  category_label: string | null;
  legal_status: string | null;
  phone: string | null;
  capacity_total: number | null;
  latitude: number | null;
  longitude: number | null;
  has_quality_grade: string | null;
  has_score_100: number | null;
  has_eval_date: string | null;
  has_eval_closed_at: string | null;
  has_evaluator_name: string | null;
  has_taux_ci_sup_3_5: number | null;
  accommodation_price_single: number | null;
  accommodation_price_double: number | null;
  dependency_tariff_gir_12: number | null;
  dependency_tariff_gir_34: number | null;
  dependency_tariff_gir_56: number | null;
};

export const getEhpadByFiness = cache(
  async (finess: string): Promise<EhpadDetail | null> => {
    const rows = await sql<EhpadDetail[]>`
      SELECT
        e.finess_geo,
        e.name,
        e.name_long,
        e.address_line,
        e.postal_code,
        e.city,
        e.department_code,
        e.department_name,
        e.category_label,
        e.legal_status,
        e.phone,
        e.capacity_total,
        e.latitude::float8 AS latitude,
        e.longitude::float8 AS longitude,
        e.has_quality_grade,
        e.has_score_100::float8 AS has_score_100,
        e.has_eval_date::text AS has_eval_date,
        e.has_eval_closed_at::text AS has_eval_closed_at,
        e.has_evaluator_name,
        e.has_taux_ci_sup_3_5::float8 AS has_taux_ci_sup_3_5,
        p.accommodation_price_single::float8 AS accommodation_price_single,
        p.accommodation_price_double::float8 AS accommodation_price_double,
        p.dependency_tariff_gir_12::float8 AS dependency_tariff_gir_12,
        p.dependency_tariff_gir_34::float8 AS dependency_tariff_gir_34,
        p.dependency_tariff_gir_56::float8 AS dependency_tariff_gir_56
      FROM ehpad_establishments e
      LEFT JOIN ehpad_pricing p ON p.finess_geo = e.finess_geo
      WHERE e.finess_geo = ${finess}
      LIMIT 1
    `;
    return rows.length > 0 ? repairRecordStrings(rows[0]) : null;
  }
);

export type EhpadSitemapEntry = {
  finess_geo: string;
  last_modified: string | null;
};

export const getEhpadSitemapEntries = cache(
  async (): Promise<EhpadSitemapEntry[]> =>
    sql<EhpadSitemapEntry[]>`
      SELECT
        finess_geo,
        COALESCE(has_eval_closed_at::text, has_eval_date::text) AS last_modified
      FROM ehpad_establishments
      ORDER BY finess_geo ASC
    `.then((rows) => rows.map((row) => repairRecordStrings(row)))
);

export type EhpadSearchResult = {
  finess_geo: string;
  name: string;
  city: string | null;
  postal_code: string | null;
  department_code: string | null;
  department_name: string | null;
  address_line: string | null;
  capacity_total: number | null;
  has_quality_grade: string | null;
  has_score_100: number | null;
  has_eval_date: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
};

export type BoundingBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type RadiusSearchOptions = {
  bounds?: BoundingBox;
  limit?: number;
};

function normalizeSearchQuery(query: string | string[] | undefined) {
  if (Array.isArray(query)) {
    return query[0]?.trim() ?? "";
  }
  return query?.trim() ?? "";
}

export function normalizeBoundingBox(bounds: BoundingBox): BoundingBox {
  return {
    north: Math.max(bounds.north, bounds.south),
    south: Math.min(bounds.north, bounds.south),
    east: Math.max(bounds.east, bounds.west),
    west: Math.min(bounds.east, bounds.west),
  };
}

function createBoundingBox(lat: number, lng: number, radiusKm: number): BoundingBox {
  const latitudeDelta = radiusKm / 111.32;
  const longitudeDelta =
    radiusKm /
    Math.max(Math.cos((lat * Math.PI) / 180) * 111.32, 0.01);

  return {
    north: Math.min(90, lat + latitudeDelta),
    south: Math.max(-90, lat - latitudeDelta),
    east: Math.min(180, lng + longitudeDelta),
    west: Math.max(-180, lng - longitudeDelta),
  };
}

/**
 * Try to geocode a query by looking up known city coordinates from our EHPAD data.
 * Returns the center lat/lng of matching establishments if found.
 */
async function geocodeFromEhpadData(
  term: string
): Promise<{ lat: number; lng: number } | null> {
  const likePattern = `%${term}%`;
  const rows = await sql<{ lat: number; lng: number }[]>`
    SELECT
      AVG(latitude)::float8 AS lat,
      AVG(longitude)::float8 AS lng
    FROM ehpad_establishments
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      AND (
        unaccent(lower(city)) LIKE unaccent(lower(${likePattern}))
        OR postal_code = ${term}
        OR upper(department_code) = upper(${term})
        OR unaccent(lower(department_name)) LIKE unaccent(lower(${likePattern}))
      )
    HAVING COUNT(*) > 0
  `;
  if (rows.length > 0 && rows[0].lat != null) {
    return { lat: rows[0].lat, lng: rows[0].lng };
  }
  return null;
}

export async function searchEhpads(
  query: string | string[] | undefined,
  radiusKm: number = 20,
  options: RadiusSearchOptions = {}
) {
  const term = normalizeSearchQuery(query);
  if (!term) {
    return [];
  }

  // If radius search is requested, try to geocode and search by distance
  if (radiusKm > 0) {
    const center = await geocodeFromEhpadData(term);
    if (center) {
      return searchByRadius(center.lat, center.lng, radiusKm, options);
    }
    // Fall through to text search if geocoding fails
  }

  const likePattern = `%${term}%`;
  const bounds = options.bounds ? normalizeBoundingBox(options.bounds) : null;

  if (bounds) {
    const rows = await sql<EhpadSearchResult[]>`
      SELECT
        finess_geo,
        name,
        city,
        postal_code,
        department_code,
        department_name,
        address_line,
        capacity_total,
        has_quality_grade,
        has_score_100::float8 AS has_score_100,
        has_eval_date::text AS has_eval_date,
        latitude::float8 AS latitude,
        longitude::float8 AS longitude
      FROM ehpad_establishments
      WHERE
        latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND latitude BETWEEN ${bounds.south} AND ${bounds.north}
        AND longitude BETWEEN ${bounds.west} AND ${bounds.east}
        AND (
          unaccent(lower(name)) LIKE unaccent(lower(${likePattern}))
          OR unaccent(lower(city)) LIKE unaccent(lower(${likePattern}))
          OR unaccent(lower(department_name)) LIKE unaccent(lower(${likePattern}))
          OR upper(department_code) = upper(${term})
          OR postal_code = ${term}
          OR finess_geo = ${term}
        )
      ORDER BY
        CASE has_quality_grade
          WHEN 'A' THEN 4
          WHEN 'B' THEN 3
          WHEN 'C' THEN 2
          WHEN 'D' THEN 1
          ELSE 0
      END DESC,
        has_score_100 DESC NULLS LAST,
        name ASC
    `;
    return rows.map((row) => repairRecordStrings(row));
  }

  const rows = await sql<EhpadSearchResult[]>`
    SELECT
      finess_geo,
      name,
      city,
      postal_code,
      department_code,
      department_name,
      address_line,
      capacity_total,
      has_quality_grade,
      has_score_100::float8 AS has_score_100,
      has_eval_date::text AS has_eval_date,
      latitude::float8 AS latitude,
      longitude::float8 AS longitude
    FROM ehpad_establishments
    WHERE
      unaccent(lower(name)) LIKE unaccent(lower(${likePattern}))
      OR unaccent(lower(city)) LIKE unaccent(lower(${likePattern}))
      OR unaccent(lower(department_name)) LIKE unaccent(lower(${likePattern}))
      OR upper(department_code) = upper(${term})
      OR postal_code = ${term}
      OR finess_geo = ${term}
    ORDER BY
      CASE has_quality_grade
        WHEN 'A' THEN 4
        WHEN 'B' THEN 3
        WHEN 'C' THEN 2
        WHEN 'D' THEN 1
        ELSE 0
    END DESC,
      has_score_100 DESC NULLS LAST,
      name ASC
  `;
  return rows.map((row) => repairRecordStrings(row));
}

export async function searchByRadius(
  lat: number,
  lng: number,
  radiusKm: number,
  options: RadiusSearchOptions = {}
) {
  const safeRadius = Math.min(Math.max(radiusKm, 0), 200);
  const bounds = normalizeBoundingBox(
    options.bounds ?? createBoundingBox(lat, lng, safeRadius)
  );

  const rows = await sql<EhpadSearchResult[]>`
    SELECT * FROM (
      SELECT
        finess_geo,
        name,
        city,
        postal_code,
        department_code,
        department_name,
        address_line,
        capacity_total,
        has_quality_grade,
        has_score_100::float8 AS has_score_100,
        has_eval_date::text AS has_eval_date,
        latitude::float8 AS latitude,
        longitude::float8 AS longitude,
        (6371 * acos(
          LEAST(1, cos(radians(${lat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(latitude)))
        )) AS distance_km
      FROM ehpad_establishments
      WHERE
        latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND latitude BETWEEN ${bounds.south} AND ${bounds.north}
        AND longitude BETWEEN ${bounds.west} AND ${bounds.east}
    ) sub
    WHERE distance_km <= ${safeRadius}
    ORDER BY distance_km ASC
  `;
  return rows.map((row) => repairRecordStrings(row));
}
