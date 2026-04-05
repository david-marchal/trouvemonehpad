import type { Metadata } from "next";

export const SITE_NAME = "TrouveMonEHPAD";
export const SITE_URL = "https://nestrate.nanocorp.app";
export const SITE_TAGLINE = "Trouvez la résidence idéale pour vos proches";
export const HOME_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const SITE_DESCRIPTION = SITE_TAGLINE;

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
