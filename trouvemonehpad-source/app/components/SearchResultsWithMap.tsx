"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const SearchResultsMap = dynamic(() => import("./SearchResultsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-sage-50 rounded-xl border border-sage-200">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-foreground/40 text-sm">Chargement de la carte…</p>
      </div>
    </div>
  ),
});

type SearchResult = {
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

const gradeClasses: Record<string, string> = {
  A: "bg-emerald-50 text-emerald-700 border-emerald-200",
  B: "bg-teal-50 text-teal-700 border-teal-200",
  C: "bg-amber-50 text-amber-700 border-amber-200",
  D: "bg-rose-50 text-rose-700 border-rose-200",
};

function QualityBadge({
  grade,
  score,
}: {
  grade: string | null;
  score: number | null;
}) {
  if (!grade) {
    return (
      <div className="rounded-xl bg-sage-100 px-4 py-3 text-center min-w-24">
        <p className="text-xs uppercase tracking-wide text-foreground/45">HAS</p>
        <p className="mt-1 text-sm font-medium text-foreground/65">Non publié</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center min-w-24 ${
        gradeClasses[grade] ?? "bg-sage-100 text-foreground/70 border-sage-200"
      }`}
    >
      <p className="text-xs uppercase tracking-wide">HAS</p>
      <p className="mt-1 text-2xl font-bold">{grade}</p>
      {score !== null ? (
        <p className="mt-1 text-xs">{score.toFixed(2)}/100</p>
      ) : null}
    </div>
  );
}

export default function SearchResultsWithMap({
  results,
  query,
  radiusKm,
}: {
  results: SearchResult[];
  query: string;
  radiusKm: number;
}) {
  const [highlightedFiness, setHighlightedFiness] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const resultRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const hasGeoResults = results.some(
    (r) => r.latitude != null && r.longitude != null
  );

  function handleMarkerClick(finess: string) {
    setHighlightedFiness(finess);
    const el = resultRefs.current.get(finess);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <div className="mt-8">
      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-foreground/50">
          <span className="font-semibold text-foreground">{results.length}</span>{" "}
          résultat{results.length !== 1 ? "s" : ""} pour{" "}
          <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>
          {radiusKm > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full px-2.5 py-0.5">
              {radiusKm} km
            </span>
          )}
        </p>
        {hasGeoResults && (
          <button
            onClick={() => setShowMap((v) => !v)}
            className="text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer bg-sage-100 text-foreground/60 hover:bg-sage-200 min-h-[44px] inline-flex items-center"
          >
            {showMap ? "Masquer la carte" : "Afficher la carte"}
          </button>
        )}
      </div>

      {/* Map + results layout */}
      <div className={`flex flex-col ${showMap && hasGeoResults ? "lg:flex-row" : ""} gap-6`}>
        {/* Map panel */}
        {showMap && hasGeoResults && (
          <div className="lg:w-1/2 xl:w-3/5 h-[350px] lg:h-[calc(100vh-16rem)] lg:sticky lg:top-20">
            <SearchResultsMap
              results={results}
              highlightedFiness={highlightedFiness}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}

        {/* Results list */}
        <div className={`${showMap && hasGeoResults ? "lg:w-1/2 xl:w-2/5" : "w-full"} space-y-4`}>
          {results.map((result) => (
            <div
              key={result.finess_geo}
              ref={(el) => {
                if (el) resultRefs.current.set(result.finess_geo, el);
              }}
              onMouseEnter={() => setHighlightedFiness(result.finess_geo)}
              onMouseLeave={() => setHighlightedFiness(null)}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                highlightedFiness === result.finess_geo
                  ? "border-teal-400 shadow-md ring-1 ring-teal-200"
                  : "border-sage-200"
              }`}
            >
              <Link href={`/etablissement/${result.finess_geo}`} className="block">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-foreground leading-snug hover:text-teal-600 transition-colors">
                    {result.name}
                  </h2>
                  <p className="mt-1 text-sm text-foreground/60">
                    {[result.address_line, result.postal_code, result.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-foreground/55">
                    {result.department_code && result.department_name ? (
                      <span className="bg-sage-50 rounded-full px-2.5 py-0.5">
                        {result.department_code} · {result.department_name}
                      </span>
                    ) : null}
                    {result.capacity_total ? (
                      <span className="bg-sage-50 rounded-full px-2.5 py-0.5">
                        {result.capacity_total} places
                      </span>
                    ) : null}
                    {result.distance_km != null && (
                      <span className="bg-teal-50 text-teal-700 rounded-full px-2.5 py-0.5 font-medium">
                        {result.distance_km < 1
                          ? `${Math.round(result.distance_km * 1000)} m`
                          : `${result.distance_km.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  {result.has_eval_date && (
                    <p className="mt-2 text-xs text-foreground/40">
                      Évaluation HAS du{" "}
                      {new Date(result.has_eval_date).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <QualityBadge
                    grade={result.has_quality_grade}
                    score={result.has_score_100}
                  />
                </div>
              </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
