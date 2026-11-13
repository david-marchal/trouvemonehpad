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
          background: "#F7F9F8",
          color: "#17282B",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 38,
            fontWeight: 700,
            color: "#164B47",
          }}
        >
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path
              d="M16 2C9.4 2 4 7.3 4 13.8 4 22 16 30 16 30s12-8 12-16.2C28 7.3 22.6 2 16 2Z"
              fill="#164B47"
            />
            <path d="M11.5 20v-5.2a4.5 4.5 0 0 1 9 0V20Z" fill="#F7F9F8" />
          </svg>
          <div>{SITE_NAME}</div>
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

        <div style={{ fontSize: 30, color: "#3B4F52", fontFamily: "sans-serif" }}>
          Note HAS, tarifs, carte et coût mensuel estimé selon le niveau de dépendance.
        </div>
      </div>
    ),
    size
  );
}
