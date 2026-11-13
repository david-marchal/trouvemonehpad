import { ImageResponse } from "next/og";
import { SITE_NAME } from "./lib/seo";

export const alt = `${SITE_NAME}, les évaluations officielles des EHPAD`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#FDF8F2",
          color: "#2E2420",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="96" height="96" viewBox="0 0 32 32">
            <path
              d="M3.5 15 16 4l12.5 11"
              fill="none"
              stroke="#C2414B"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 13.5V27h18V13.5"
              fill="none"
              stroke="#C2414B"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 23.4c-3.6-2.3-4.8-3.9-4.8-5.5a2.6 2.6 0 0 1 4.8-1.3 2.6 2.6 0 0 1 4.8 1.3c0 1.6-1.2 3.2-4.8 5.5Z"
              fill="#E8943D"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.95 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#C67A2E" }}>TrouveMon</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: "#C2414B", letterSpacing: -1 }}>EHPAD</div>
          </div>
        </div>

        <div
          style={{
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: -2,
            maxWidth: 980,
          }}
        >
          Les évaluations officielles des EHPAD, enfin lisibles.
        </div>

        <div style={{ fontSize: 30, color: "#6B5A50" }}>
          Note HAS, tarifs, carte et coût mensuel estimé selon le niveau de dépendance.
        </div>
      </div>
    ),
    size
  );
}
