import type { MetadataRoute } from "next";
import { getEhpadSitemapEntries } from "./lib/ehpad";
import { absoluteUrl } from "./lib/seo";

const generatedAt = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: generatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/search"),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const establishments = await getEhpadSitemapEntries();

  return [
    ...staticRoutes,
    ...establishments.map((establishment) => ({
      url: absoluteUrl(`/etablissement/${establishment.finess_geo}`),
      lastModified: establishment.last_modified
        ? new Date(establishment.last_modified)
        : generatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
