import { NextRequest, NextResponse } from "next/server";
import { AMENITY_CHECKLIST, getNearbyAmenities } from "@/app/lib/nearby-amenities";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = Number.parseFloat(searchParams.get("lat") || "");
  const lng = Number.parseFloat(searchParams.get("lng") || "");
  const radius = Number.parseInt(searchParams.get("radius") || "1000", 10);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "Missing lat/lng" },
      { status: 400 }
    );
  }

  const result = await getNearbyAmenities({ lat, lng, radius });
  const presentCategories = new Set(result.presentCategories);
  const checklist = AMENITY_CHECKLIST.map(({ key, label, icon }) => ({
    key,
    label,
    icon,
    present: presentCategories.has(key),
  }));

  return NextResponse.json(
    {
      ...result,
      checklist,
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=43200, stale-while-revalidate=86400",
      },
    }
  );
}
