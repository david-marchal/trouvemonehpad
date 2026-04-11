"use client";

import { useEffect, useRef, useCallback, useEffectEvent, useState } from "react";
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
  onSearchInZone,
}: {
  results: MapResult[];
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onSearchInZone?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const skipNextMoveRef = useRef(false);
  const lastRenderedIdsRef = useRef<string>("");
  const currentBoundsRef = useRef<{ north: number; south: number; east: number; west: number } | null>(null);

  // Afficher le bouton "Rechercher dans cette zone" quand la carte a bougé
  const [showSearchZoneBtn, setShowSearchZoneBtn] = useState(false);

  const handleBoundsChange = useEffectEvent((bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    onBoundsChange?.(bounds);
  });

  // Initialisation de la carte — une seule fois
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

    const handleMoveEnd = () => {
      if (skipNextMoveRef.current) {
        skipNextMoveRef.current = false;
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const b = map.getBounds();
        const bounds = {
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        };
        currentBoundsRef.current = bounds;
        setShowSearchZoneBtn(true);
        handleBoundsChange(bounds);
      }, 300);
    };

    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleMoveEnd);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      lastRenderedIdsRef.current = "";
    };
  }, []);

  // Mise à jour des markers — seulement quand les IDs changent vraiment
  const updateMarkers = useCallback((data: MapResult[]) => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    const newIds = data.map((r) => r.finess_geo).join(",");
    if (newIds === lastRenderedIdsRef.current) return;
    lastRenderedIdsRef.current = newIds;

    cluster.clearLayers();

    const markers = data
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => {
        const marker = L.marker([r.latitude, r.longitude], {
          icon: createMarkerIcon(r.has_quality_grade),
        });

        const gradeHtml = r.has_quality_grade
          ? `<span style="display:inline-block;margin-top:4px;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:600;color:white;background:${gradeColor(r.has_quality_grade)}">Évaluation HAS ${r.has_quality_grade}</span>`
          : "";

        const capacityHtml = r.capacity_total
          ? `<span style="display:inline-block;margin-top:3px;font-size:10px;color:#888">${r.capacity_total} places</span>`
          : "";

        marker.bindPopup(
          `<div style="min-width:190px;font-family:system-ui,sans-serif;padding:2px 0">
            <strong style="font-size:13px;line-height:1.4;display:block;color:#1a1a1a">${r.name}</strong>
            <span style="font-size:11px;color:#888;display:block;margin-top:2px">${r.city || ""}</span>
            <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:4px;align-items:center">
              ${gradeHtml}
              ${capacityHtml}
            </div>
            <a href="/etablissement/${r.finess_geo}" style="display:inline-block;margin-top:8px;font-size:11px;color:#0d9488;text-decoration:none;font-weight:500">Voir la fiche →</a>
          </div>`,
          {
            closeButton: false,
            autoClose: false,
            closeOnClick: false,
          }
        );

        return marker;
      });

    cluster.addLayers(markers);
  }, []);

  useEffect(() => {
    updateMarkers(results);
  }, [results, updateMarkers]);

  // Fly-to quand les résultats changent substantiellement (nouvelle recherche)
  const prevFlyIdsRef = useRef<string>("");
  useEffect(() => {
    const map = mapRef.current;
    if (!map || results.length === 0) return;

    const newIds = results.map((r) => r.finess_geo).join(",");
    if (newIds === prevFlyIdsRef.current) return;

    const prevIdSet = new Set(prevFlyIdsRef.current.split(",").filter(Boolean));
    prevFlyIdsRef.current = newIds;

    const newIdSet = new Set(results.map((r) => r.finess_geo));
    const overlap = [...newIdSet].filter((id) => prevIdSet.has(id)).length;
    const overlapRatio = prevIdSet.size > 0 ? overlap / prevIdSet.size : 0;

    if (overlapRatio > 0.7 && prevIdSet.size > 5) return;

    const geoResults = results.filter((r) => r.latitude != null && r.longitude != null);
    if (geoResults.length === 0) return;

    // Masquer le bouton zone après un fly programmatique
    setShowSearchZoneBtn(false);

    if (geoResults.length === 1) {
      skipNextMoveRef.current = true;
      map.flyTo([geoResults[0].latitude, geoResults[0].longitude], 13, { duration: 0.8 });
    } else {
      const bounds = L.latLngBounds(geoResults.map((r) => [r.latitude, r.longitude] as [number, number]));
      skipNextMoveRef.current = true;
      map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 13, duration: 0.8 });
    }
  }, [results]);

  const handleSearchInZoneClick = useCallback(() => {
    if (!currentBoundsRef.current || !onSearchInZone) return;
    setShowSearchZoneBtn(false);
    onSearchInZone(currentBoundsRef.current);
  }, [onSearchInZone]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Bouton "Rechercher dans cette zone" */}
      {showSearchZoneBtn && onSearchInZone && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={handleSearchInZoneClick}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-teal-700 shadow-md border border-teal-200 hover:bg-teal-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Rechercher dans cette zone
          </button>
        </div>
      )}

      {/* Légende */}
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
