type OverpassElement = {
  tags?: Record<string, string>;
};

type AmenityTag = "amenity" | "shop" | "leisure";

export const AMENITY_CHECKLIST = [
  {
    key: "bakery",
    label: "Boulangerie",
    icon: "🥖",
    matchers: [{ tag: "shop", value: "bakery" }],
  },
  {
    key: "pharmacy",
    label: "Pharmacie",
    icon: "💊",
    matchers: [{ tag: "amenity", value: "pharmacy" }],
  },
  {
    key: "supermarket",
    label: "Supermarché",
    icon: "🛒",
    matchers: [{ tag: "shop", value: "supermarket" }],
  },
  {
    key: "doctor",
    label: "Médecin",
    icon: "🩺",
    matchers: [
      { tag: "amenity", value: "doctors" },
      { tag: "amenity", value: "clinic" },
    ],
  },
  {
    key: "bank",
    label: "Banque",
    icon: "🏦",
    matchers: [{ tag: "amenity", value: "bank" }],
  },
  {
    key: "post_office",
    label: "Poste",
    icon: "📮",
    matchers: [{ tag: "amenity", value: "post_office" }],
  },
  {
    key: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    matchers: [{ tag: "amenity", value: "restaurant" }],
  },
  {
    key: "park",
    label: "Parc",
    icon: "🌳",
    matchers: [{ tag: "leisure", value: "park" }],
  },
  {
    key: "hospital",
    label: "Hôpital",
    icon: "🏥",
    matchers: [{ tag: "amenity", value: "hospital" }],
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  icon: string;
  matchers: readonly { tag: AmenityTag; value: string }[];
}>;

export type AmenityChecklistKey = (typeof AMENITY_CHECKLIST)[number]["key"];

export type NearbyAmenitiesResult = {
  available: boolean;
  presentCategories: AmenityChecklistKey[];
  radius: number;
  source: "live" | "cache" | "stale" | "unavailable";
  error?: "missing_coordinates" | "timeout" | "upstream";
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const DEFAULT_RADIUS_METERS = 1000;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const nearbyAmenitiesCache = new Map<
  string,
  { expiresAt: number; data: Omit<NearbyAmenitiesResult, "source"> }
>();

function buildCacheKey(lat: number, lng: number, radius: number) {
  return `${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}`;
}

function normalizeRadius(radius: number | undefined) {
  if (!radius || Number.isNaN(radius)) {
    return DEFAULT_RADIUS_METERS;
  }

  return Math.min(Math.max(Math.round(radius), 100), 2000);
}

function buildOverpassQuery(lat: number, lng: number, radius: number) {
  const fragments = AMENITY_CHECKLIST.flatMap((category) =>
    category.matchers.map(
      ({ tag, value }) =>
        `nwr["${tag}"="${value}"](around:${radius},${lat},${lng});`
    )
  );

  return `
    [out:json][timeout:5];
    (
      ${fragments.join("\n      ")}
    );
    out center tags;
  `;
}

function getAmenityChecklistKey(tags: Record<string, string> | undefined) {
  if (!tags) {
    return null;
  }

  for (const category of AMENITY_CHECKLIST) {
    if (category.matchers.some(({ tag, value }) => tags[tag] === value)) {
      return category.key;
    }
  }

  return null;
}

async function fetchNearbyAmenitiesFromOverpass(
  lat: number,
  lng: number,
  radius: number
) {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(buildOverpassQuery(lat, lng, radius))}`,
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { elements?: OverpassElement[] };
  const presentCategories = new Set<AmenityChecklistKey>();

  for (const element of payload.elements ?? []) {
    const key = getAmenityChecklistKey(element.tags);
    if (key) {
      presentCategories.add(key);
    }
  }

  return [...presentCategories];
}

function isTimeoutError(error: unknown) {
  return error instanceof Error && error.name === "TimeoutError";
}

export async function getNearbyAmenities(params: {
  lat: number | null | undefined;
  lng: number | null | undefined;
  radius?: number;
}): Promise<NearbyAmenitiesResult> {
  const radius = normalizeRadius(params.radius);

  if (typeof params.lat !== "number" || typeof params.lng !== "number") {
    return {
      available: false,
      presentCategories: [],
      radius,
      source: "unavailable",
      error: "missing_coordinates",
    };
  }

  const cacheKey = buildCacheKey(params.lat, params.lng, radius);
  const cached = nearbyAmenitiesCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, source: "cache" };
  }

  try {
    const presentCategories = await fetchNearbyAmenitiesFromOverpass(
      params.lat,
      params.lng,
      radius
    );
    const data = {
      available: true,
      presentCategories,
      radius,
    } satisfies Omit<NearbyAmenitiesResult, "source">;

    nearbyAmenitiesCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return { ...data, source: "live" };
  } catch (error) {
    if (cached) {
      return { ...cached.data, source: "stale" };
    }

    return {
      available: false,
      presentCategories: [],
      radius,
      source: "unavailable",
      error: isTimeoutError(error) ? "timeout" : "upstream",
    };
  }
}
