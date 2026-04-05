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
        finess_geo,
        name,
        city,
        has_quality_grade,
        capacity_total,
        latitude::float8 AS latitude,
        longitude::float8 AS longitude
      FROM ehpad_establishments
      WHERE
        latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND latitude BETWEEN ${bounds.south} AND ${bounds.north}
        AND longitude BETWEEN ${bounds.west} AND ${bounds.east}
    `;

    return jsonUtf8(results.map((row) => repairRecordStrings(row)));
  }

  // Default: return all markers (lightweight)
  const results = await sql`
    SELECT
      finess_geo,
      name,
      city,
      has_quality_grade,
      capacity_total,
      latitude::float8 AS latitude,
      longitude::float8 AS longitude
    FROM ehpad_establishments
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  `;

  return jsonUtf8(results.map((row) => repairRecordStrings(row)));
}
