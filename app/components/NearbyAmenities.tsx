"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AMENITY_CHECKLIST,
  OVERPASS_URLS,
  buildOverpassQuery,
  getAmenityChecklistKey,
  type AmenityChecklistKey,
} from "@/app/lib/nearby-amenities";

const SECTION_TITLE = "Commerces et services à proximité";
const FALLBACK_MESSAGE = "Données non disponibles pour le moment";

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-sage-200 p-6">
      <h2 className="text-lg font-semibold mb-4">{SECTION_TITLE}</h2>
      {children}
    </section>
  );
}

export function NearbyAmenitiesLoading() {
  return (
    <SectionShell>
      <div className="flex items-center gap-2 text-sm text-foreground/50">
        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        Chargement…
      </div>
    </SectionShell>
  );
}

const RADIUS = 1000;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

// La requête part du navigateur du visiteur : les serveurs Overpass
// refusent les requêtes venant des serveurs d'hébergement (Vercel).
async function queryOverpass(url: string, query: string) {
  const response = await fetch(url, {
    method: "POST",
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`status ${response.status}`);
  const payload = (await response.json()) as {
    elements?: { tags?: Record<string, string> }[];
    remark?: string;
  };
  if (payload.remark && /error|timed out|out of memory/i.test(payload.remark)) {
    throw new Error(payload.remark);
  }
  return payload.elements ?? [];
}

async function loadCategories(lat: number, lng: number) {
  const cacheKey = `nearby:${lat.toFixed(4)}:${lng.toFixed(4)}:${RADIUS}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw) as {
        at: number;
        keys: AmenityChecklistKey[];
      };
      if (Date.now() - cached.at < CACHE_TTL_MS) return cached.keys;
    }
  } catch {}

  const query = buildOverpassQuery(lat, lng, RADIUS);
  const elements = await Promise.any(
    OVERPASS_URLS.map((url) => queryOverpass(url, query))
  );
  const found = new Set<AmenityChecklistKey>();
  for (const element of elements) {
    const key = getAmenityChecklistKey(element.tags);
    if (key) found.add(key);
  }
  const keys = [...found];
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), keys }));
  } catch {}
  return keys;
}

export default function NearbyAmenities({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const [keys, setKeys] = useState<AmenityChecklistKey[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;
    let cancelled = false;
    loadCategories(lat, lng)
      .then((result) => {
        if (!cancelled) setKeys(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  const noCoordinates = typeof lat !== "number" || typeof lng !== "number";

  if (failed || noCoordinates) {
    return (
      <SectionShell>
        <p className="text-sm text-foreground/55">{FALLBACK_MESSAGE}</p>
      </SectionShell>
    );
  }

  if (keys === null) {
    return <NearbyAmenitiesLoading />;
  }

  const result = { presentCategories: keys };
  const presentCategories = new Set(result.presentCategories);

  return (
    <SectionShell>
      <p className="text-xs text-foreground/40 mb-4">
        Dans un rayon de 1 km · Données OpenStreetMap
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {AMENITY_CHECKLIST.map(({ key, label, icon }) => {
          const isPresent = presentCategories.has(key);

          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                isPresent
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-sage-200 bg-sage-50"
              }`}
            >
              <span
                className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg ${
                  isPresent ? "bg-white" : "bg-white/70"
                }`}
                aria-hidden="true"
              >
                {icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p
                  className={`text-xs ${
                    isPresent ? "text-emerald-700" : "text-foreground/45"
                  }`}
                >
                  {isPresent ? "Disponible à proximité" : "Non repéré"}
                </p>
              </div>
              <span
                className={`text-lg font-semibold ${
                  isPresent ? "text-emerald-700" : "text-foreground/25"
                }`}
                aria-hidden="true"
              >
                {isPresent ? "✓" : "–"}
              </span>
            </div>
          );
        })}
      </div>

      {result.presentCategories.length === 0 && (
        <p className="mt-4 text-sm text-foreground/55">
          Aucun service n&apos;a été repéré dans cette sélection de catégories.
        </p>
      )}
    </SectionShell>
  );
}
