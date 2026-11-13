import type { MetadataRoute } from "next";
import { getEhpadSitemapEntries } from "./lib/ehpad";
import { citySlug, departmentSlug, getDirectoryEntries } from "./lib/directory";
import { GUIDES } from "./lib/guides";
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
    {
      url: absoluteUrl("/guides"),
      lastModified: generatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...GUIDES.map((g) => ({
      url: absoluteUrl(`/guides/${g.slug}`),
      lastModified: generatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  const establishments = await getEhpadSitemapEntries();
  const directory = await getDirectoryEntries().catch(() => []);

  const departmentPaths = new Map<string, string>();
  for (const entry of directory) {
    departmentPaths.set(
      entry.department_code,
      `/ehpad/${departmentSlug(entry.department_code, entry.department_name)}`
    );
  }

  const directoryRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/ehpad"),
      lastModified: generatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...[...departmentPaths.values()].map((path) => ({
      url: absoluteUrl(path),
      lastModified: generatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...directory.map((entry) => ({
      url: absoluteUrl(`${departmentPaths.get(entry.department_code)}/${citySlug(entry.city)}`),
      lastModified: generatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [
    ...staticRoutes,
    ...directoryRoutes,
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
