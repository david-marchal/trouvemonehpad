import type { Metadata } from "next";
import { searchEhpads } from "../lib/ehpad";
import { SITE_NAME, buildPageMetadata } from "../lib/seo";
import SearchPageClient from "../components/SearchPageClient";

export const metadata: Metadata = buildPageMetadata({
  title: `Recherche d'EHPAD et maisons de retraite | ${SITE_NAME}`,
  description:
    "Recherchez des EHPAD et maisons de retraite en France par ville, département, code postal ou nom d'établissement.",
  path: "/search",
});

function getSingleParam(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseRadius(value: string | undefined) {
  if (!value) {
    return 20;
  }

  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return 20;
  }

  return Math.min(Math.max(parsed, 0), 100);
}

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;
  const initialQuery = getSingleParam(params.q)?.trim() ?? "";
  const initialRadiusKm = parseRadius(getSingleParam(params.radius));
  const initialResults =
    initialQuery.length > 0 ? await searchEhpads(initialQuery, initialRadiusKm) : [];

  return (
    <SearchPageClient
      initialQuery={initialQuery}
      initialRadiusKm={initialRadiusKm}
      initialResults={initialResults}
    />
  );
}
