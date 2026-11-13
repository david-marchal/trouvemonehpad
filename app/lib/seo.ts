import type { Metadata } from "next";

export const SITE_NAME = "TrouveMonEHPAD";
export const SITE_URL = "https://www.trouvemonehpad.fr";
export const SITE_TAGLINE = "Les évaluations officielles des EHPAD, lisibles par les familles";
export const HOME_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const SITE_DESCRIPTION =
  "Note HAS, tarifs d'hébergement et de dépendance, carte et fiche de chaque EHPAD de France. Estimez le coût mensuel selon le niveau de dépendance et comparez 2 ou 3 établissements.";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  openGraphType?: "website" | "article" | "profile" | "book";
};

export function buildPageMetadata({
  title,
  description,
  path,
  openGraphType = "website",
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: openGraphType,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function absoluteUrl(path: string) {
  if (!path || path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
