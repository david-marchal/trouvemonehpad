import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  departmentSlug,
  getDepartmentCities,
  getDepartmentName,
  parseDepartmentSlug,
} from "@/app/lib/directory";
import { SITE_NAME, absoluteUrl, buildPageMetadata, serializeJsonLd } from "@/app/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = {
  params: Promise<{ departement: string }>;
};

async function load(slug: string) {
  const code = parseDepartmentSlug(slug);
  if (!code) return null;
  const [name, cities] = await Promise.all([getDepartmentName(code), getDepartmentCities(code)]);
  if (cities.length === 0) return null;
  return { code, name, cities };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { departement } = await params;
  const data = await load(departement);
  if (!data) {
    return { title: `Département introuvable | ${SITE_NAME}`, robots: { index: false } };
  }
  const label = data.name ?? `département ${data.code}`;
  const total = data.cities.reduce((sum, city) => sum + city.total, 0);
  return buildPageMetadata({
    title: `EHPAD ${data.name ? `en ${label}` : label} (${data.code}) : ${total} établissements, tarifs et notes | ${SITE_NAME}`,
    description: `${total} EHPAD répartis dans ${data.cities.length} communes du département ${label}. Tarifs d'hébergement, évaluations HAS et carte.`,
    path: `/ehpad/${departmentSlug(data.code, data.name)}`,
  });
}

export default async function DepartmentPage({ params }: Props) {
  const { departement } = await params;
  const data = await load(departement);
  if (!data) notFound();

  const label = data.name ?? `Département ${data.code}`;
  const total = data.cities.reduce((sum, city) => sum + city.total, 0);
  const path = `/ehpad/${departmentSlug(data.code, data.name)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "EHPAD par département", item: absoluteUrl("/ehpad") },
      { "@type": "ListItem", position: 3, name: label, item: absoluteUrl(path) },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <section className="bg-gradient-to-b from-warm-100 to-coral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <nav aria-label="Fil d'Ariane" className="text-sm text-foreground/60">
            <Link href="/ehpad" className="underline underline-offset-2 hover:text-teal-700">
              EHPAD par département
            </Link>
          </nav>
          <h1 className="mt-2 text-3xl sm:text-4xl">
            Les EHPAD : {label} ({data.code})
          </h1>
          <p className="mt-3 max-w-prose text-foreground/75">
            {total} établissements dans {data.cities.length} communes. Choisissez
            une commune, ou{" "}
            <Link
              href={`/search?q=${encodeURIComponent(label)}&radius=0`}
              className="font-medium text-teal-700 underline underline-offset-2"
            >
              voyez-les tous sur la carte
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.cities.map((city) => (
            <li key={city.slug}>
              <Link
                href={`${path}/${city.slug}`}
                className="flex min-h-[44px] items-center justify-between gap-3 rounded-2xl border border-sage-200 bg-white px-4 py-3 text-sm transition-colors hover:border-coral-500"
              >
                <span className="font-medium text-foreground">{city.name}</span>
                <span className="text-foreground/55">{city.total}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
