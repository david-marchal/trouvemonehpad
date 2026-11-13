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
  detail?: string;
};

export const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const OVERPASS_TIMEOUT_MS = 9500;
const USER_AGENT = "TrouveMonEHPAD/1.0 (https://www.trouvemonehpad.fr)";
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

export function buildOverpassQuery(lat: number, lng: number, radius: number) {
  const fragments = AMENITY_CHECKLIST.flatMap((category) =>
    category.matchers.map(
      ({ tag, value }) =>
        `nw["${tag}"="${value}"](around:${radius},${lat},${lng});`
    )
  );

  return `
    [out:json][timeout:8];
    (
      ${fragments.join("\n      ")}
    );
    out tags;
  `;
}

export function getAmenityChecklistKey(tags: Record<string, string> | undefined) {
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

async function queryOverpass(
  url: string,
  query: string
): Promise<OverpassElement[]> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
    cache: "no-store",
    signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    elements?: OverpassElement[];
    remark?: string;
  };

  // Overpass répond parfois 200 avec une erreur d'exécution et aucun résultat.
  if (payload.remark && /error|timed out|out of memory/i.test(payload.remark)) {
    throw new Error(`Overpass remark: ${payload.remark}`);
  }

  return payload.elements ?? [];
}

async function fetchNearbyAmenitiesFromOverpass(
  lat: number,
  lng: number,
  radius: number
) {
  const query = buildOverpassQuery(lat, lng, radius);
  // Les serveurs sont interrogés en parallèle : le premier qui répond gagne.
  const elements = await Promise.any(
    OVERPASS_URLS.map((url) => queryOverpass(url, query))
  );
  const presentCategories = new Set<AmenityChecklistKey>();

  for (const element of elements) {
    const key = getAmenityChecklistKey(element.tags);
    if (key) {
      presentCategories.add(key);
    }
  }

  return [...presentCategories];
}

function describeError(error: unknown) {
  const list = error instanceof AggregateError ? error.errors : [error];
  return list
    .map((e) => {
      if (!(e instanceof Error)) return String(e);
      const cause = (e as { cause?: unknown }).cause;
      return cause instanceof Error ? `${e.message} (${cause.message})` : e.message;
    })
    .join(" | ")
    .slice(0, 500);
}

function isTimeoutError(error: unknown) {
  if (error instanceof AggregateError) {
    return error.errors.every(
      (e) => e instanceof Error && e.name === "TimeoutError"
    );
  }
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
      detail: describeError(error),
    };
  }
}
