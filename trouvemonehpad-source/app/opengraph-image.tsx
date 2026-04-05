import { ImageResponse } from "next/og";
import { SITE_NAME } from "./lib/seo";

export const alt = `${SITE_NAME} | Comparateur d'EHPAD en France`;
export const size = {
  width: 1200,
  height: 630,
};
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
          padding: "56px 64px",
          background:
            "linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 40%, #f8fafc 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 34,
            fontWeight: 700,
            color: "#0f766e",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ccfbf1",
              border: "2px solid #99f6e4",
            }}
          >
            TM
          </div>
          <div>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            Comparez les EHPAD et maisons de retraite en France
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "#334155",
              maxWidth: 960,
            }}
          >
            Donnees HAS, carte interactive, tarifs publics et fiches detaillees
            pour choisir un etablissement plus sereinement.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#0f766e",
          }}
        >
          <div>nestrate.nanocorp.app</div>
          <div>7 399 etablissements</div>
        </div>
      </div>
    ),
    size
  );
}
