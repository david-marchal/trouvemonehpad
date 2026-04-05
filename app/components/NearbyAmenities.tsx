import type { ReactNode } from "react";
import {
  AMENITY_CHECKLIST,
  getNearbyAmenities,
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

export default async function NearbyAmenities({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const result = await getNearbyAmenities({ lat, lng, radius: 1000 });

  if (!result.available) {
    return (
      <SectionShell>
        <p className="text-sm text-foreground/55">{FALLBACK_MESSAGE}</p>
      </SectionShell>
    );
  }

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
