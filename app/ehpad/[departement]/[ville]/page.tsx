import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EhpadListCard from "@/app/components/EhpadListCard";
import { DAYS_PER_MONTH, euros } from "@/app/lib/cost";
import {
  departmentSlug,
  getCityEhpads,
  getDepartmentName,
  parseDepartmentSlug,
  prettyCity,
} from "@/app/lib/directory";
import { SITE_NAME, absoluteUrl, buildPageMetadata, serializeJsonLd } from "@/app/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = {
  params: Promise<{ departement: string; ville: string }>;
};

async function load(departementSlug: string, ville: string) {
  const code = parseDepartmentSlug(departementSlug);
  if (!code) return null;
  const [name, ehpads] = await Promise.all([
    getDepartmentName(code),
    getCityEhpads(code, ville),
  ]);
  if (ehpads.length === 0) return null;
  const cityName = prettyCity(ehpads[0].city ?? ville);
  return { code, departmentName: name, ehpads, cityName };
}

function stats(ehpads: Awaited<ReturnType<typeof getCityEhpads>>) {
  const monthly = ehpads
    .map((e) => e.accommodation_price_single)
    .filter((v): v is number => v != null)
    .map((v) => v * DAYS_PER_MONTH);
  const evaluated = ehpads.filter((e) => e.has_quality_grade).length;
  const withAlzheimer = ehpads.filter(
    (e) => (e.alzheimer_places ?? 0) > 0 || e.has_pasa || e.has_uhr
  ).length;
  return {
    priced: monthly.length,
    min: monthly.length ? Math.min(...monthly) : null,
    max: monthly.length ? Math.max(...monthly) : null,
    avg: monthly.length ? monthly.reduce((a, b) => a + b, 0) / monthly.length : null,
    evaluated,
    withAlzheimer,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { departement, ville } = await params;
  const data = await load(departement, ville);
  if (!data) {
    return { title: `Commune introuvable | ${SITE_NAME}`, robots: { index: false } };
  }
  const s = stats(data.ehpads);
  const count = data.ehpads.length;
  const price =
    s.avg != null ? ` Tarif moyen en chambre seule : ${euros(s.avg)} par mois.` : "";
  return buildPageMetadata({
    title: `EHPAD à ${data.cityName} (${data.code}) : ${count} établissement${count > 1 ? "s" : ""}, tarifs et notes | ${SITE_NAME}`,
    description: `${count} EHPAD à ${data.cityName}.${price} Évaluations de la Haute Autorité de santé, unités Alzheimer et carte.`,
    path: `/ehpad/${departmentSlug(data.code, data.departmentName)}/${ville}`,
  });
}

export default async function CityPage({ params }: Props) {
  const { departement, ville } = await params;
  const data = await load(departement, ville);
  if (!data) notFound();

  const { ehpads, cityName, code, departmentName } = data;
  const s = stats(ehpads);
  const count = ehpads.length;
  const departmentPath = `/ehpad/${departmentSlug(code, departmentName)}`;
  const path = `${departmentPath}/${ville}`;
  const departmentLabel = departmentName ?? `département ${code}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "EHPAD par département", item: absoluteUrl("/ehpad") },
        { "@type": "ListItem", position: 3, name: departmentLabel, item: absoluteUrl(departmentPath) },
        { "@type": "ListItem", position: 4, name: cityName, item: absoluteUrl(path) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `EHPAD à ${cityName}`,
      itemListElement: ehpads.map((e, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: e.name,
        url: absoluteUrl(`/etablissement/${e.finess_geo}`),
      })),
    },
  ];

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
            </Link>{" "}
            /{" "}
            <Link href={departmentPath} className="underline underline-offset-2 hover:text-teal-700">
              {departmentLabel}
            </Link>
          </nav>
          <h1 className="mt-2 text-3xl sm:text-4xl">EHPAD à {cityName}</h1>
          <p className="mt-3 max-w-prose text-foreground/75">
            {count} établissement{count > 1 ? "s" : ""} à {cityName} ({departmentLabel}).
            {s.min != null && s.max != null && s.priced > 0
              ? ` Pour ${s.priced === count ? "tous" : `${s.priced} d'entre eux`}, le tarif d'hébergement en chambre seule ${
                  Math.round(s.min) === Math.round(s.max)
                    ? `est de ${euros(s.min)} par mois`
                    : `va de ${euros(s.min)} à ${euros(s.max)} par mois`
                }, avant le tarif de dépendance et les aides.`
              : " Aucun tarif d'hébergement n'est publié pour le moment."}
            {s.evaluated > 0
              ? ` ${s.evaluated} ${s.evaluated > 1 ? "ont" : "a"} une évaluation de la Haute Autorité de santé.`
              : ""}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/search?q=${encodeURIComponent(cityName)}&radius=10`}
              className="inline-flex min-h-[44px] items-center rounded-full bg-coral-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-700"
            >
              Voir sur la carte, autour de {cityName}
            </Link>
            <Link
              href="/guides/questions-a-poser-lors-d-une-visite"
              className="inline-flex min-h-[44px] items-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-teal-700 ring-1 ring-sage-200 transition-colors hover:bg-sage-50"
            >
              Questions à poser en visite
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ehpads.map((ehpad) => (
            <EhpadListCard key={ehpad.finess_geo} ehpad={ehpad} />
          ))}
        </ul>

        <section className="mt-10 rounded-3xl border border-sage-200 bg-white p-6">
          <h2 className="text-xl">Bon à savoir</h2>
          <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-foreground/80">
            <li>
              Le tarif affiché est celui de l&apos;hébergement en chambre seule. Le
              coût réel dépend aussi du niveau de dépendance de la personne et des
              aides (APA, aide sociale, réduction d&apos;impôt) : chaque fiche
              propose une estimation.
            </li>
            <li>
              {s.withAlzheimer > 0
                ? `${s.withAlzheimer} établissement${s.withAlzheimer > 1 ? "s" : ""} de cette commune déclare${s.withAlzheimer > 1 ? "nt" : ""} une unité pour les personnes atteintes d'Alzheimer ou de maladies apparentées.`
                : "Aucune unité spécialisée Alzheimer n'est déclarée dans cette commune au répertoire officiel. Posez la question en visite."}
            </li>
            <li>
              La disponibilité des places n&apos;est pas publique : appelez
              l&apos;établissement pour connaître le délai d&apos;attente.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
