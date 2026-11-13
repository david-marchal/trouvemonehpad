import { NextRequest, NextResponse } from "next/server";
import {
  normalizeBoundingBox,
  searchByRadius,
  searchEhpads,
  type BoundingBox,
} from "../../lib/ehpad";
import { jsonUtf8 } from "../../lib/http";
import sql from "../../lib/db";
import { repairRecordStrings } from "../../lib/text";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q");

  const lat = params.get("lat");
  const lng = params.get("lng");
  const radius = params.get("radius");
  const north = params.get("north");
  const south = params.get("south");
  const east = params.get("east");
  const west = params.get("west");

  const hasAnyBoundsParam = [north, south, east, west].some(
    (value) => value !== null
  );
  const hasBounds = [north, south, east, west].every((value) => value !== null);

  if (hasAnyBoundsParam && !hasBounds) {
    return NextResponse.json(
      { error: "north, south, east, and west must be provided together" },
      { status: 400 }
    );
  }

  let bounds: BoundingBox | undefined;
  if (hasBounds) {
    const northNum = parseFloat(north!);
    const southNum = parseFloat(south!);
    const eastNum = parseFloat(east!);
    const westNum = parseFloat(west!);

    if ([northNum, southNum, eastNum, westNum].some((value) => Number.isNaN(value))) {
      return NextResponse.json(
        { error: "Invalid bounding box parameters" },
        { status: 400 }
      );
    }

    bounds = normalizeBoundingBox({
      north: northNum,
      south: southNum,
      east: eastNum,
      west: westNum,
    });
  }

  if (query) {
    const radiusKm = radius === null ? 20 : parseFloat(radius);

    if (Number.isNaN(radiusKm)) {
      return NextResponse.json({ error: "Invalid radius" }, { status: 400 });
    }

    const results = await searchEhpads(query, radiusKm, { bounds });
    return jsonUtf8(results);
  }

  const hasAnyRadiusParam = [lat, lng, radius].some((value) => value !== null);
  const hasRadiusSearch = [lat, lng, radius].every((value) => value !== null);

  if (hasAnyRadiusParam && !hasRadiusSearch) {
    return NextResponse.json(
      { error: "lat, lng, and radius must be provided together" },
      { status: 400 }
    );
  }

  if (hasRadiusSearch) {
    const latNum = parseFloat(lat!);
    const lngNum = parseFloat(lng!);
    const radiusKm = parseFloat(radius!);

    if ([latNum, lngNum, radiusKm].some((value) => Number.isNaN(value))) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const results = await searchByRadius(latNum, lngNum, radiusKm, {
      bounds,
    });

    return jsonUtf8(results);
  }

  if (bounds) {
    const results = await sql`
      SELECT
        e.finess_geo,
        e.name,
        e.city,
        e.has_quality_grade,
        e.capacity_total,
        e.mft_code,
        e.latitude::float8 AS latitude,
        e.longitude::float8 AS longitude,
        p.accommodation_price_single::float8 AS accommodation_price_single
      FROM ehpad_establishments e
      LEFT JOIN ehpad_pricing p ON p.finess_geo = e.finess_geo
      WHERE
        e.latitude IS NOT NULL
        AND e.longitude IS NOT NULL
        AND e.latitude BETWEEN ${bounds.south} AND ${bounds.north}
        AND e.longitude BETWEEN ${bounds.west} AND ${bounds.east}
    `;

    return jsonUtf8(results.map((row) => repairRecordStrings(row)));
  }

  // Mode exploration avec filtres : toutes les lignes avec département et tarifs
  if (params.get("details") === "1") {
    const detailed = await sql`
      SELECT
        e.finess_geo,
        e.name,
        e.city,
        e.postal_code,
        e.department_code,
        e.department_name,
        e.address_line,
        e.capacity_total,
        e.mft_code,
        e.alzheimer_places,
        e.has_pasa,
        e.has_uhr,
        e.has_quality_grade,
        e.has_score_100::float8 AS has_score_100,
        e.has_eval_date::text AS has_eval_date,
        e.latitude::float8 AS latitude,
        e.longitude::float8 AS longitude,
        p.accommodation_price_single::float8 AS accommodation_price_single,
        p.dependency_tariff_gir_12::float8 AS dependency_tariff_gir_12,
        p.dependency_tariff_gir_34::float8 AS dependency_tariff_gir_34,
        p.dependency_tariff_gir_56::float8 AS dependency_tariff_gir_56
      FROM ehpad_establishments e
      LEFT JOIN ehpad_pricing p ON p.finess_geo = e.finess_geo
      WHERE e.latitude IS NOT NULL AND e.longitude IS NOT NULL
    `;
    return jsonUtf8(detailed.map((row) => repairRecordStrings(row)));
  }

  // Default: return all markers (lightweight)
  const results = await sql`
    SELECT
      e.finess_geo,
      e.name,
      e.city,
      e.has_quality_grade,
      e.capacity_total,
      e.mft_code,
      e.latitude::float8 AS latitude,
      e.longitude::float8 AS longitude,
      p.accommodation_price_single::float8 AS accommodation_price_single
    FROM ehpad_establishments e
    LEFT JOIN ehpad_pricing p ON p.finess_geo = e.finess_geo
    WHERE e.latitude IS NOT NULL AND e.longitude IS NOT NULL
  `;

  return jsonUtf8(results.map((row) => repairRecordStrings(row)));
}
