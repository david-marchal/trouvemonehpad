"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AMENITY_CHECKLIST,
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
const REQUEST_SPACING_MS = 1100; // Nominatim : 1 requête par seconde maximum

type Status = "pending" | "yes" | "no" | "error";

// Nominatim (OpenStreetMap) sait chercher par type de lieu dans une zone.
// Recherche : mot-clé → types OSM acceptés dans les résultats.
const SEARCHES: Record<
  AmenityChecklistKey,
  { q: string; types: string[]; limit?: number }[]
> = {
  bakery: [{ q: "bakery", types: ["bakery"] }],
  pharmacy: [{ q: "pharmacy", types: ["pharmacy"] }],
  supermarket: [{ q: "supermarket", types: ["supermarket"] }],
  doctor: [
    { q: "doctors", types: ["doctors"] },
    { q: "clinic", types: ["clinic"] },
  ],
  // « bank » désigne aussi un banc en anglais : on filtre sur le type.
  bank: [
    { q: "bank", types: ["bank"], limit: 40 },
    { q: "banque", types: ["bank"], limit: 40 },
  ],
  post_office: [{ q: "post office", types: ["post_office"] }],
  restaurant: [{ q: "restaurant", types: ["restaurant"] }],
  park: [{ q: "park", types: ["park"] }],
  hospital: [{ q: "hospital", types: ["hospital"] }],
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(a));
}

type NominatimResult = { type: string; lat: string; lon: string };

async function searchNominatim(
  lat: number,
  lng: number,
  q: string,
  limit: number,
  signal: AbortSignal
) {
  const dLat = RADIUS / 111320;
  const dLng = RADIUS / (111320 * Math.cos((lat * Math.PI) / 180));
  const viewbox = [lng - dLng, lat + dLat, lng + dLng, lat - dLat].join(",");
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q,
      viewbox,
      bounded: "1",
      format: "jsonv2",
      limit: String(limit),
      "accept-language": "fr",
    });
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
  });
  if (!response.ok) throw new Error(`status ${response.status}`);
  return (await response.json()) as NominatimResult[];
}

async function isPresent(
  lat: number,
  lng: number,
  key: AmenityChecklistKey,
  signal: AbortSignal
) {
  for (const search of SEARCHES[key]) {
    const results = await searchNominatim(
      lat,
      lng,
      search.q,
      search.limit ?? 10,
      signal
    );
    const found = results.some(
      (r) =>
        search.types.includes(r.type) &&
        distanceMeters(lat, lng, Number(r.lat), Number(r.lon)) <= RADIUS
    );
    if (found) return true;
    await wait(REQUEST_SPACING_MS);
  }
  return false;
}

function readCache(cacheKey: string): Record<string, Status> | null {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { at: number; statuses: Record<string, Status> };
    return Date.now() - cached.at < CACHE_TTL_MS ? cached.statuses : null;
  } catch {
    return null;
  }
}

export default function NearbyAmenities({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;
    const cacheKey = `nearby-v2:${lat.toFixed(4)}:${lng.toFixed(4)}:${RADIUS}`;
    const controller = new AbortController();
    (async () => {
      const cached = readCache(cacheKey);
      if (cached) {
        setStatuses(cached);
        return;
      }
      const done: Record<string, Status> = {};
      let hadError = false;
      for (const { key } of AMENITY_CHECKLIST) {
        if (controller.signal.aborted) return;
        try {
          done[key] = (await isPresent(lat, lng, key, controller.signal))
            ? "yes"
            : "no";
        } catch {
          if (controller.signal.aborted) return;
          done[key] = "error";
          hadError = true;
        }
        setStatuses({ ...done });
        await wait(REQUEST_SPACING_MS);
      }
      if (!hadError) {
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ at: Date.now(), statuses: done })
          );
        } catch {}
      }
    })();

    return () => controller.abort();
  }, [lat, lng]);

  const noCoordinates = typeof lat !== "number" || typeof lng !== "number";
  const values = Object.values(statuses);
  const allFailed =
    values.length === AMENITY_CHECKLIST.length &&
    values.every((v) => v === "error");

  if (noCoordinates || allFailed) {
    return (
      <SectionShell>
        <p className="text-sm text-foreground/55">{FALLBACK_MESSAGE}</p>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <p className="text-xs text-foreground/40 mb-4">
        Dans un rayon de 1 km · Données OpenStreetMap
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {AMENITY_CHECKLIST.map(({ key, label, icon }) => {
          const status = statuses[key] ?? "pending";
          const isPresent = status === "yes";
          const text =
            status === "yes"
              ? "Disponible à proximité"
              : status === "no"
                ? "Non repéré"
                : status === "error"
                  ? "Indisponible"
                  : "Recherche…";

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
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg"
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
                  {text}
                </p>
              </div>
              <span
                className={`text-lg font-semibold ${
                  isPresent ? "text-emerald-700" : "text-foreground/25"
                }`}
                aria-hidden="true"
              >
                {status === "yes" ? "✓" : status === "pending" ? "" : "–"}
              </span>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
