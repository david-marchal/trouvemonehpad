"use client";

import { useEffect, useRef, useCallback, useEffectEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const GRADE_COLORS: Record<string, string> = {
  A: "#059669",
  B: "#0d9488",
  C: "#d97706",
  D: "#e11d48",
};

function gradeColor(grade: string | null) {
  return grade ? GRADE_COLORS[grade] || "#94a3b8" : "#94a3b8";
}

function createMarkerIcon(grade: string | null, highlighted = false) {
  const color = gradeColor(grade);
  const size = highlighted ? 18 : 12;
  const border = highlighted ? 3 : 2;
  return L.divIcon({
    className: "ehpad-marker",
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border: ${border}px solid ${highlighted ? "#1a1a1a" : "white"};
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,${highlighted ? 0.5 : 0.3});
      transition: all 0.15s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const FRANCE_CENTER: [number, number] = [46.6, 2.3];
const FRANCE_ZOOM = 6;

export default function SearchResultsMap({
  results,
  highlightedFiness,
  onMarkerClick,
}: {
  results: SearchResult[];
  highlightedFiness?: string | null;
  onMarkerClick?: (finess: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const handleMarkerClick = useEffectEvent((finess: string) => {
    onMarkerClick?.(finess);
  });

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: FRANCE_CENTER,
      zoom: FRANCE_ZOOM,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render markers when results change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();
    markerMapRef.current.clear();

    const geoResults = results.filter(
      (r) => r.latitude != null && r.longitude != null
    );

    if (geoResults.length === 0) return;

    const bounds = L.latLngBounds([]);

    geoResults.forEach((r) => {
      const marker = L.marker([r.latitude!, r.longitude!], {
        icon: createMarkerIcon(r.has_quality_grade, r.finess_geo === highlightedFiness),
      });

      marker.bindPopup(
        `<div style="min-width:160px">
          <strong style="font-size:13px">${r.name}</strong><br/>
          <span style="font-size:11px;color:#666">${r.city || ""}${r.postal_code ? ` (${r.postal_code})` : ""}</span>
          ${r.has_quality_grade ? `<br/><span style="font-size:12px;font-weight:600;color:${gradeColor(r.has_quality_grade)}">Note HAS : ${r.has_quality_grade}</span>` : ""}
          ${r.distance_km != null ? `<br/><span style="font-size:11px;color:#3A8E80">${r.distance_km < 1 ? `${Math.round(r.distance_km * 1000)} m` : `${r.distance_km.toFixed(1)} km`}</span>` : ""}
        </div>`,
        { closeButton: false }
      );

      marker.on("click", () => {
        handleMarkerClick(r.finess_geo);
      });

      marker.addTo(layer);
      markerMapRef.current.set(r.finess_geo, marker);
      bounds.extend([r.latitude!, r.longitude!]);
    });

    // Fit map to results
    if (geoResults.length === 1) {
      mapRef.current.setView(
        [geoResults[0].latitude!, geoResults[0].longitude!],
        13
      );
    } else {
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }, [results, highlightedFiness]);

  // Highlight a specific marker
  const highlightMarker = useCallback((finess: string | null) => {
    markerMapRef.current.forEach((marker, key) => {
      // We need the grade to recreate the icon - get it from popup content
      const isHighlighted = key === finess;
      // Find result to get grade
      const r = results.find((res) => res.finess_geo === key);
      if (r) {
        marker.setIcon(createMarkerIcon(r.has_quality_grade, isHighlighted));
        if (isHighlighted) {
          marker.openPopup();
        }
      }
    });
  }, [results]);

  // Re-highlight when highlightedFiness changes
  useEffect(() => {
    highlightMarker(highlightedFiness || null);
  }, [highlightedFiness, highlightMarker]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-sage-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-sage-200 z-[1000]">
        <div className="flex items-center gap-3 text-xs">
          {(["A", "B", "C", "D"] as const).map((grade) => (
            <div key={grade} className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: GRADE_COLORS[grade] }}
              />
              <span className="text-foreground/60">{grade}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#94a3b8" }}
            />
            <span className="text-foreground/60">N/A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
