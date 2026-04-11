"use client";

import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const SearchMapClustered = dynamic(() => import("./SearchMapClustered"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-sage-50">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <p className="text-sm text-foreground/40">Chargement de la carte…</p>
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
  dependency_tariff_gir_12?: number | null;
  dependency_tariff_gir_34?: number | null;
  dependency_tariff_gir_56?: number | null;
};

type MapResult = {
  finess_geo: string;
  name: string;
  city: string | null;
  has_quality_grade: string | null;
  capacity_total: number | null;
  latitude: number;
  longitude: number;
};

type SelectedLocation = {
  label: string;
  lat: number;
  lng: number;
};

type SearchPageClientProps = {
  initialQuery?: string;
  initialRadiusKm?: number;
  initialResults?: SearchResult[];
};

type BanSuggestion = {
  properties: {
    label: string;
    city: string;
    postcode: string;
    context: string;
    name: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};

type Department = {
  department_code: string;
  department_name: string;
};

const GRADE_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "A", label: "A — Excellent" },
  { value: "B", label: "B — Bon" },
  { value: "C", label: "C — Suffisant" },
  { value: "D", label: "D — Insuffisant" },
];

const GIR_OPTIONS = [
  { value: "", label: "Tous niveaux GIR" },
  { value: "12", label: "GIR 1-2 — Dépendance totale" },
  { value: "34", label: "GIR 3-4 — Dépendance partielle" },
  { value: "56", label: "GIR 5-6 — Dépendance légère" },
];

const RESULT_ROW_HEIGHT = 134;
const RESULT_OVERSCAN = 8;

const gradeColors: Record<string, string> = {
  A: "bg-emerald-50 text-emerald-700 border-emerald-200",
  B: "bg-teal-50 text-teal-700 border-teal-200",
  C: "bg-amber-50 text-amber-700 border-amber-200",
  D: "bg-rose-50 text-rose-700 border-rose-200",
};

function normalizeRadius(radiusKm: number | undefined) {
  if (typeof radiusKm !== "number" || Number.isNaN(radiusKm)) {
    return 20;
  }
  return Math.min(Math.max(radiusKm, 0), 100);
}

function toMapResults(results: SearchResult[]): MapResult[] {
  return results
    .filter((result) => result.latitude != null && result.longitude != null)
    .map((result) => ({
      finess_geo: result.finess_geo,
      name: result.name,
      city: result.city,
      has_quality_grade: result.has_quality_grade,
      capacity_total: result.capacity_total,
      latitude: result.latitude!,
      longitude: result.longitude!,
    }));
}

// Filtre un tableau de MapResult selon les filtres actifs
function filterMapResults(
  results: MapResult[],
  searchResults: SearchResult[],
  departmentFilter: string,
  gradeFilter: string,
  girFilter: string
): MapResult[] {
  if (!departmentFilter && !gradeFilter && !girFilter) return results;

  // Construire un Set des finess_geo qui passent les filtres
  const allowedFiness = new Set(
    searchResults
      .filter((r) => {
        if (departmentFilter && r.department_code !== departmentFilter) return false;
        if (gradeFilter && r.has_quality_grade !== gradeFilter) return false;
        if (girFilter) {
          const key = `dependency_tariff_gir_${girFilter}` as keyof SearchResult;
          if (r[key] == null) return false;
        }
        return true;
      })
      .map((r) => r.finess_geo)
  );

  return results.filter((r) => allowedFiness.has(r.finess_geo));
}

function QualityBadge({
  grade,
  score,
}: {
  grade: string | null;
  score: number | null;
}) {
  if (!grade) {
    return (
      <div className="min-w-[72px] rounded-xl bg-sage-100 px-3 py-2 text-center">
        <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">
          HAS
        </p>
        <p className="mt-0.5 text-xs font-medium text-foreground/50">N/A</p>
      </div>
    );
  }

  return (
    <div
      className={`min-w-[72px] rounded-xl border px-3 py-2 text-center ${gradeColors[grade] ?? "border-sage-200 bg-sage-100 text-foreground/70"}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider">HAS</p>
      <p className="mt-0.5 text-xl font-bold leading-none">{grade}</p>
      {score !== null ? (
        <p className="mt-1 text-[10px] opacity-75">{score.toFixed(1)}/100</p>
      ) : null}
    </div>
  );
}

function ResultCard({
  result,
  highlighted,
  onMouseEnter,
  onMouseLeave,
}: {
  result: SearchResult;
  highlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`h-full rounded-xl border bg-white p-4 transition-all duration-200 group ${
        highlighted
          ? "scale-[1.01] border-teal-400 shadow-md ring-1 ring-teal-200"
          : "border-sage-200 shadow-sm hover:border-sage-300 hover:shadow-md"
      }`}
    >
      <Link href={`/etablissement/${result.finess_geo}`} className="block h-full">
        <div className="flex h-full items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-teal-600">
              {result.name}
            </h3>
            <p className="mt-1 truncate text-xs text-foreground/55">
              {[result.city, result.department_code].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {result.capacity_total ? (
                <span className="inline-flex items-center rounded-full bg-sage-50 px-2 py-0.5 text-[11px] text-foreground/55">
                  {result.capacity_total} places
                </span>
              ) : null}
              {result.distance_km != null ? (
                <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
                  {result.distance_km < 1
                    ? `${Math.round(result.distance_km * 1000)} m`
                    : `${result.distance_km.toFixed(1)} km`}
                </span>
              ) : null}
            </div>
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
  );
}

function VirtualizedResultsList({
  results,
  highlightedFiness,
  onHighlightChange,
}: {
  results: SearchResult[];
  highlightedFiness: string | null;
  onHighlightChange: (finess: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setViewportHeight(container.clientHeight);
    };

    handleResize();
    handleScroll();

    container.addEventListener("scroll", handleScroll, { passive: true });
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = 0;
    setScrollTop(0);
  }, [results]);

  const totalHeight = Math.max(results.length * RESULT_ROW_HEIGHT, viewportHeight);
  const startIndex = Math.max(
    Math.floor(scrollTop / RESULT_ROW_HEIGHT) - RESULT_OVERSCAN,
    0
  );
  const visibleCount =
    Math.ceil(viewportHeight / RESULT_ROW_HEIGHT) + RESULT_OVERSCAN * 2;
  const endIndex = Math.min(startIndex + visibleCount, results.length);
  const visibleResults = results.slice(startIndex, endIndex);

  return (
    <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <div className="relative" style={{ height: totalHeight }}>
        {visibleResults.map((result, index) => {
          const rowIndex = startIndex + index;

          return (
            <div
              key={result.finess_geo}
              className="absolute left-0 right-0 px-0 pb-2.5"
              style={{
                top: rowIndex * RESULT_ROW_HEIGHT,
                height: RESULT_ROW_HEIGHT,
              }}
            >
              <ResultCard
                result={result}
                highlighted={highlightedFiness === result.finess_geo}
                onMouseEnter={() => onHighlightChange(result.finess_geo)}
                onMouseLeave={() => onHighlightChange(null)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPageClient({
  initialQuery = "",
  initialRadiusKm = 20,
  initialResults = [],
}: SearchPageClientProps) {
  const normalizedInitialQuery = initialQuery.trim();
  const normalizedInitialRadius = normalizeRadius(initialRadiusKm);

  const [searchText, setSearchText] = useState(normalizedInitialQuery);
  const [suggestions, setSuggestions] = useState<BanSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const [radiusKm, setRadiusKm] = useState(normalizedInitialRadius);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [girFilter, setGirFilter] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  const [results, setResults] = useState<SearchResult[]>(initialResults);
  // mapResults = résultats bruts de la carte (exploration sans recherche)
  const [mapResults, setMapResults] = useState<MapResult[]>(() =>
    toMapResults(initialResults)
  );
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(
    normalizedInitialQuery.length > 0
  );
  const [highlightedFiness, setHighlightedFiness] = useState<string | null>(
    null
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Ref pour stabiliser la référence de displayMapResults
  // et éviter de recréer les markers Leaflet à chaque render
  const prevDisplayIdsRef = useRef<string>("");
  const stableDisplayMapResultsRef = useRef<MapResult[]>([]);

  useEffect(() => {
    fetch("/api/ehpads/departments")
      .then((response) => response.json())
      .then(setDepartments)
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const nextInitialQuery = initialQuery.trim();
    const nextInitialRadius = normalizeRadius(initialRadiusKm);

    setSearchText(nextInitialQuery);
    setRadiusKm(nextInitialRadius);
    setSelectedLocation(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setResults(initialResults);
    setHasSearched(nextInitialQuery.length > 0);
    setHighlightedFiness(null);
    startTransition(() => {
      setMapResults(toMapResults(initialResults));
    });
  }, [initialQuery, initialRadiusKm, initialResults]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchInput = useCallback((value: string) => {
    setSearchText(value);
    setSelectedLocation(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&type=municipality&limit=5`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);
  }, []);

  const selectSuggestion = useCallback((suggestion: BanSuggestion) => {
    const { label } = suggestion.properties;
    const [lng, lat] = suggestion.geometry.coordinates;

    setSearchText(label);
    setSelectedLocation({ label, lat, lng });
    setShowSuggestions(false);
    setSuggestions([]);
  }, []);

  const executeSearch = useCallback(
    async (overrides?: {
      query?: string;
      radiusKm?: number;
      selectedLocation?: SelectedLocation | null;
    }) => {
      const nextQuery = (overrides?.query ?? searchText).trim();
      const nextRadiusKm = normalizeRadius(overrides?.radiusKm ?? radiusKm);
      const nextSelectedLocation =
        overrides && "selectedLocation" in overrides
          ? overrides.selectedLocation ?? null
          : selectedLocation;

      if (!nextQuery && !nextSelectedLocation) {
        return;
      }

      setLoading(true);
      setHasSearched(true);
      setHighlightedFiness(null);

      try {
        const params = new URLSearchParams();

        if (nextSelectedLocation) {
          params.set("lat", String(nextSelectedLocation.lat));
          params.set("lng", String(nextSelectedLocation.lng));
        } else {
          params.set("q", nextQuery);
        }

        params.set("radius", String(nextRadiusKm));

        const response = await fetch(`/api/ehpads?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data: SearchResult[] = await response.json();
        startTransition(() => {
          setResults(data);
        });
      } catch {
        startTransition(() => {
          setResults([]);
        });
      } finally {
        setLoading(false);
      }
    },
    [radiusKm, searchText, selectedLocation]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setShowSuggestions(false);
      void executeSearch();
    },
    [executeSearch]
  );

  useEffect(() => {
    if (hasSearched) {
      return;
    }

    async function loadInitialMarkers() {
      try {
        const response = await fetch("/api/ehpads");
        if (!response.ok) {
          throw new Error("Initial map request failed");
        }

        const data = await response.json();
        startTransition(() => {
          setMapResults(data);
        });
      } catch {
        startTransition(() => {
          setMapResults([]);
        });
      }
    }

    void loadInitialMarkers();
  }, [hasSearched]);

  const handleBoundsChange = useCallback(
    async (bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }) => {
      // En mode exploration (pas de recherche), on charge les markers de la zone visible
      // En mode recherche, la carte affiche déjà les résultats filtrés — on ne touche à rien
      if (hasSearched) {
        return;
      }

      try {
        const params = new URLSearchParams({
          north: String(bounds.north),
          south: String(bounds.south),
          east: String(bounds.east),
          west: String(bounds.west),
        });
        const response = await fetch(`/api/ehpads?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Bounds request failed");
        }

        const data = await response.json();
        startTransition(() => {
          setMapResults(data);
        });
      } catch {
        startTransition(() => {
          setMapResults([]);
        });
      }
    },
    [hasSearched]
  );

  // Recherche déclenchée depuis le bouton "Rechercher dans cette zone" sur la carte
  const handleSearchInZone = useCallback(
    async (bounds: { north: number; south: number; east: number; west: number }) => {
      setLoading(true);
      setHasSearched(true);
      setHighlightedFiness(null);

      try {
        const params = new URLSearchParams({
          north: String(bounds.north),
          south: String(bounds.south),
          east: String(bounds.east),
          west: String(bounds.west),
        });
        const response = await fetch(`/api/ehpads?${params.toString()}`);
        if (!response.ok) throw new Error("Zone search failed");

        const data: SearchResult[] = await response.json();
        startTransition(() => {
          setResults(data);
        });
      } catch {
        startTransition(() => {
          setResults([]);
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Calcul des résultats filtrés ---
  const filteredResults = results.filter((result) => {
    if (departmentFilter && result.department_code !== departmentFilter) return false;
    if (gradeFilter && result.has_quality_grade !== gradeFilter) return false;
    if (girFilter) {
      const key = `dependency_tariff_gir_${girFilter}` as keyof SearchResult;
      if (result[key] == null) return false;
    }
    return true;
  });
  const deferredFilteredResults = useDeferredValue(filteredResults);

  // --- Calcul de displayMapResults ---
  // Règle : on applique toujours les filtres actifs sur la carte,
  // que ce soit en mode recherche ou en mode exploration.
  // On stabilise la référence pour éviter de recréer les markers Leaflet inutilement.
  const rawDisplayMapResults = (() => {
    if (hasSearched) {
      // Mode recherche : filtrer les résultats de recherche
      return toMapResults(deferredFilteredResults);
    }
    // Mode exploration : filtrer les markers de la carte
    // On n'a pas les champs GIR dans mapResults (légers), donc on filtre
    // uniquement sur département et note
    if (departmentFilter || gradeFilter) {
      return mapResults.filter((r) => {
        if (departmentFilter) return false; // mapResults n'a pas department_code → skip
        if (gradeFilter && r.has_quality_grade !== gradeFilter) return false;
        return true;
      });
    }
    return mapResults;
  })();

  const newDisplayIds = rawDisplayMapResults.map((r) => r.finess_geo).join(",");
  if (newDisplayIds !== prevDisplayIdsRef.current) {
    prevDisplayIdsRef.current = newDisplayIds;
    stableDisplayMapResultsRef.current = rawDisplayMapResults;
  }
  const displayMapResults = stableDisplayMapResultsRef.current;

  // Note: mapResults n'a pas department_code ni dependency_tariff_gir_*
  // Pour le mode exploration avec filtres, on charge les résultats complets si nécessaire
  const [explorationResults, setExplorationResults] = useState<SearchResult[]>([]);
  const hasActiveFilters = !!(departmentFilter || gradeFilter || girFilter);

  useEffect(() => {
    if (hasSearched || !hasActiveFilters) {
      setExplorationResults([]);
      return;
    }
    // Charger les résultats complets pour pouvoir filtrer en mode exploration
    fetch("/api/ehpads")
      .then((r) => r.json())
      .then((data: SearchResult[]) => setExplorationResults(data))
      .catch(() => {});
  }, [hasSearched, hasActiveFilters]);

  // Recalcul du displayMapResults en mode exploration avec filtres
  const explorationMapResults = hasSearched
    ? null
    : hasActiveFilters && explorationResults.length > 0
    ? filterMapResults(
        toMapResults(explorationResults),
        explorationResults,
        departmentFilter,
        gradeFilter,
        girFilter
      )
    : null;

  const finalDisplayMapResults = explorationMapResults ?? displayMapResults;

  const newFinalIds = finalDisplayMapResults.map((r) => r.finess_geo).join(",");
  const stableFinalRef = useRef<MapResult[]>(finalDisplayMapResults);
  const prevFinalIdsRef = useRef<string>(newFinalIds);
  if (newFinalIds !== prevFinalIdsRef.current) {
    prevFinalIdsRef.current = newFinalIds;
    stableFinalRef.current = finalDisplayMapResults;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
      <div className="flex w-full flex-col border-r border-sage-200 bg-[#FFFBF7] md:w-[55%]">
        <div className="border-b border-sage-100 p-4 pb-0">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center rounded-xl border-2 border-sage-200 bg-white shadow-sm transition-all focus-within:border-teal-400 focus-within:shadow-md">
              <svg
                className="ml-3.5 h-5 w-5 flex-shrink-0 text-foreground/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(event) => handleSearchInput(event.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Ville, code postal ou nom..."
                className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35"
                autoComplete="off"
              />
              <button
                type="submit"
                className="mr-1.5 min-h-[44px] cursor-pointer rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600 active:bg-teal-700"
              >
                Rechercher
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 ? (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-sage-200 bg-white shadow-lg"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.properties.label}-${index}`}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="flex min-h-[44px] w-full cursor-pointer items-center gap-2.5 border-b border-sage-100 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-sage-50"
                  >
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-teal-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {suggestion.properties.name}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {suggestion.properties.context}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 pb-4">
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="min-h-[44px] min-w-[140px] cursor-pointer appearance-none rounded-lg border border-sage-200 bg-white px-2.5 py-2.5 text-xs text-foreground/70 focus:border-teal-400 focus:outline-none"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
            >
              <option value="">Département</option>
              {departments.map((department) => (
                <option
                  key={department.department_code}
                  value={department.department_code}
                >
                  {department.department_code} — {department.department_name}
                </option>
              ))}
            </select>

            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
              className="min-h-[44px] min-w-[120px] cursor-pointer appearance-none rounded-lg border border-sage-200 bg-white px-2.5 py-2.5 text-xs text-foreground/70 focus:border-teal-400 focus:outline-none"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
            >
              {GRADE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value ? `Note ${option.label}` : "Note HAS"}
                </option>
              ))}
            </select>

            <select
              value={girFilter}
              onChange={(event) => setGirFilter(event.target.value)}
              className="min-h-[44px] min-w-[140px] cursor-pointer appearance-none rounded-lg border border-sage-200 bg-white px-2.5 py-2.5 text-xs text-foreground/70 focus:border-teal-400 focus:outline-none"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
            >
              {GIR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-foreground/50">Rayon</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={radiusKm}
                onChange={(event) => setRadiusKm(Number(event.target.value))}
                className="h-2 w-20 cursor-pointer accent-teal-500"
              />
              <span className="min-w-[40px] text-xs font-medium text-teal-600">
                {radiusKm === 0 ? "Exact" : `${radiusKm} km`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                <p className="text-sm text-foreground/40">Recherche en cours…</p>
              </div>
            </div>
          ) : hasSearched ? (
            deferredFilteredResults.length > 0 ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="px-4 pb-3 pt-4">
                  <p className="text-xs text-foreground/45">
                    <span className="font-semibold text-foreground/70">
                      {filteredResults.length}
                    </span>{" "}
                    établissement{filteredResults.length !== 1 ? "s" : ""}
                    {selectedLocation ? (
                      <span>
                        {" "}
                        près de{" "}
                        <span className="font-medium text-foreground/70">
                          {selectedLocation.label}
                        </span>
                      </span>
                    ) : null}
                    {hasActiveFilters ? (
                      <span className="text-teal-600"> (filtré)</span>
                    ) : null}
                  </p>
                </div>
                <VirtualizedResultsList
                  results={deferredFilteredResults}
                  highlightedFiness={highlightedFiness}
                  onHighlightChange={setHighlightedFiness}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="px-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage-100">
                    <svg
                      className="h-6 w-6 text-foreground/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-foreground/70">
                    Aucun résultat
                  </p>
                  <p className="mt-1 text-xs text-foreground/45">
                    Essayez d&apos;augmenter le rayon ou de modifier vos filtres.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="px-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
                  <svg
                    className="h-7 w-7 text-teal-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground/70">
                  Rechercher un EHPAD
                </p>
                <p className="mx-auto mt-1 max-w-[240px] text-xs text-foreground/45">
                  Saisissez une ville ou un code postal pour trouver des
                  établissements à proximité.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[45%] md:block">
        <SearchMapClustered
          results={stableFinalRef.current}
          onBoundsChange={handleBoundsChange}
          onSearchInZone={handleSearchInZone}
        />
      </div>
    </div>
  );
}
