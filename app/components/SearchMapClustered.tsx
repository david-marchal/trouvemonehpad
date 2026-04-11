"use client";

import { useEffect, useRef, useCallback, useEffectEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

type MapResult = {
  finess_geo: string;
  name: string;
  city: string | null;
  has_quality_grade: string | null;
  capacity_total: number | null;
  latitude: number;
  longitude: number;
};

const GRADE_COLORS: Record<string, string> = {
  A: "#059669",
  B: "#0d9488",
  C: "#d97706",
  D: "#e11d48",
};

function gradeColor(grade: string | null) {
  return grade ? GRADE_COLORS[grade] || "#94a3b8" : "#94a3b8";
}

function createMarkerIcon(grade: string | null) {
  const color = gradeColor(grade);
  return L.divIcon({
    className: "ehpad-marker",
    html: `<div style="
      width:12px;height:12px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  });
}

const FRANCE_CENTER: L.LatLngExpression = [46.6, 2.2];
const FRANCE_ZOOM = 6;

export default function SearchMapClustered({
  results,
  onBoundsChange,
}: {
  results: MapResult[];
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const skipNextMoveRef = useRef(false);
  const isZoomingRef = useRef(false);
  const handleBoundsChange = useEffectEvent((bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    onBoundsChange?.(bounds);
  });

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: FRANCE_CENTER,
      zoom: FRANCE_ZOOM,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    const cluster = (L as unknown as { markerClusterGroup: (opts?: object) => L.MarkerClusterGroup }).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 16,
    });
    map.addLayer(cluster);
    clusterRef.current = cluster;
    mapRef.current = map;

    // Debounced bounds change handler
    const handleMoveEnd = () => {
      if (skipNextMoveRef.current) {
        skipNextMoveRef.current = false;
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const b = map.getBounds();
        handleBoundsChange({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      }, 300);
    };

    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleMoveEnd);
    map.on("zoomstart", () => { isZoomingRef.current = true; });
    map.on("zoomend", () => { isZoomingRef.current = false; });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  // Update markers when results change
  const resultsIdRef = useRef<string>("");
  const updateMarkers = useCallback((data: MapResult[]) => {
    // Ne pas recréer les markers pendant un zoom — Leaflet.markercluster gère ça nativement
    if (isZoomingRef.current) return;

    const cluster = clusterRef.current;
    if (!cluster) return;

    // Évite les recréations inutiles si les IDs n'ont pas changé
    const newId = data.map((r) => r.finess_geo).join(",");
    if (newId === resultsIdRef.current) return;
    resultsIdRef.current = newId;

    cluster.clearLayers();

    const markers = data
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => {
        const marker = L.marker([r.latitude, r.longitude], {
          icon: createMarkerIcon(r.has_quality_grade),
        });

        const gradeHtml = r.has_quality_grade
          ? `<span style="display:inline-block;margin-top:4px;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:600;color:white;background:${gradeColor(r.has_quality_grade)}">Note ${r.has_quality_grade}</span>`
          : "";

        marker.bindPopup(
          `<div style="min-width:180px;font-family:system-ui,sans-serif">
            <strong style="font-size:13px;line-height:1.3;display:block">${r.name}</strong>
            <span style="font-size:11px;color:#666">${r.city || ""}</span>
            ${gradeHtml}
            <br/><a href="/etablissement/${r.finess_geo}" style="font-size:11px;color:#0d9488;text-decoration:none;margin-top:4px;display:inline-block">Voir la fiche →</a>
          </div>`,
          { closeButton: false }
        );

        return marker;
      });

    cluster.addLayers(markers);
  }, []);

  useEffect(() => {
    updateMarkers(results);
  }, [results, updateMarkers]);

  // Fly to results when search results change (from search, not from map drag)
  const prevResultsRef = useRef<MapResult[]>([]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || results.length === 0) return;

    // Only fly if results changed substantially (not from bounds query)
    const prevIds = new Set(prevResultsRef.current.map((r) => r.finess_geo));
    const newIds = new Set(results.map((r) => r.finess_geo));
    const overlap = [...newIds].filter((id) => prevIds.has(id)).length;
    const overlapRatio = prevIds.size > 0 ? overlap / prevIds.size : 0;

    prevResultsRef.current = results;

    // If >70% overlap, results came from bounds query — don't fly
    if (overlapRatio > 0.7 && prevIds.size > 5) return;

    const geoResults = results.filter((r) => r.latitude != null && r.longitude != null);
    if (geoResults.length === 0) return;

    if (geoResults.length === 1) {
      skipNextMoveRef.current = true;
      map.flyTo([geoResults[0].latitude, geoResults[0].longitude], 13, { duration: 0.8 });
    } else {
      const bounds = L.latLngBounds(geoResults.map((r) => [r.latitude, r.longitude] as [number, number]));
      skipNextMoveRef.current = true;
      map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 13, duration: 0.8 });
    }
  }, [results]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* Grade legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-sage-200 z-[1000]">
        <div className="flex items-center gap-3 text-xs">
          {(["A", "B", "C", "D"] as const).map((g) => (
            <div key={g} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: GRADE_COLORS[g] }} />
              <span className="text-foreground/60">{g}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#94a3b8" }} />
            <span className="text-foreground/60">N/A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
