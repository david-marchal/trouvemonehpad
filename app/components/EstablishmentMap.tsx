"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const GRADE_COLORS: Record<string, string> = {
  A: "#059669",
  B: "#0d9488",
  C: "#d97706",
  D: "#e11d48",
};

export default function EstablishmentMap({
  lat,
  lng,
  name,
  grade,
}: {
  lat: number;
  lng: number;
  name: string;
  grade: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    const color = grade ? GRADE_COLORS[grade] || "#94a3b8" : "#94a3b8";

    const icon = L.divIcon({
      className: "ehpad-marker",
      html: `<div style="
        width: 20px; height: 20px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([lat, lng], { icon })
      .bindPopup(`<strong>${name}</strong>`)
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name, grade]);

  return <div ref={containerRef} className="w-full h-full" />;
}
