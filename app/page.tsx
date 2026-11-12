import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "./components/SearchBar";
import { GUIDES } from "./lib/guides";
import { formatDateFr, formatNumber, getSiteStats } from "./lib/site-stats";
import {
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildPageMetadata,
  serializeJsonLd,
} from "./lib/seo";

// Les chiffres sont recalculés au plus une fois par jour.
export const revalidate = 86400;

export const metadata: Metadata = buildPageMetadata({
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default async function Home() {
  const stats = await getSiteStats();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    description: SITE_DESCRIPTION,
    areaServed: "FR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(organizationJsonLd),
        }}
      />

      <section className="border-b border-sage-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-14 sm:pt-20 sm:pb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] max-w-3xl">
            {stats
              ? `Les évaluations officielles de ${formatNumber(stats.total)} EHPAD, enfin lisibles.`
              : "Les évaluations officielles des EHPAD, enfin lisibles."}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/75 max-w-2xl leading-relaxed">
            Note de la HAS, tarifs d&apos;hébergement et de dépendance, carte,
            et un calcul du coût mensuel selon le niveau d&apos;autonomie de
            votre proche. Aucun établissement ne paie pour apparaître ici.
          </p>
          <div className="mt-9 max-w-2xl">
            <SearchBar large />
            <p className="mt-3 text-sm text-foreground/60 px-1">
              Une ville, un code postal, un département ou le nom d&apos;un
              établissement.
            </p>
          </div>
          <p className="mt-10 text-sm text-foreground/65 max-w-xl">
            {stats?.updatedAt
              ? `Données mises à jour le ${formatDateFr(stats.updatedAt)}, `
              : "Données mises à jour chaque mois, "}
            à partir de trois bases publiques : l&apos;annuaire FINESS, les
            évaluations de la HAS
            {stats ? ` (${formatNumber(stats.evaluated)} établissements évalués)` : ""}{" "}
            et les tarifs de la CNSA.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-3xl leading-tight">
              Avant de regarder les notes
            </h2>
            <p className="mt-3 text-foreground/75 max-w-md">
              Une lettre A ne dit pas tout, et un prix au jour ne dit pas
              combien vous paierez. Ces guides expliquent comment lire ce que
              vous allez trouver.
            </p>
          </div>
          <ul className="lg:col-span-3 divide-y divide-sage-200 border-y border-sage-200">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group block py-5 -mx-3 px-3 rounded hover:bg-white/60 transition-colors"
                >
                  <h3 className="font-semibold text-lg group-hover:text-teal-600 transition-colors">
                    {g.title}
                  </h3>
                  <p className="mt-1 text-foreground/70">{g.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-sage-50 border-t border-sage-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-3xl leading-tight">
            Ce que ce site ne fait pas
          </h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Il ne classe pas les établissements du meilleur au pire. La HAS
            elle-même ne conçoit pas ses évaluations comme un palmarès : le
            public accueilli, la taille et l&apos;organisation changent d&apos;un
            EHPAD à l&apos;autre. Utilisez la note pour savoir quelles
            questions poser, puis allez visiter.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Vous hésitez entre deux ou trois adresses ?{" "}
            <Link
              href="/comparer"
              className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
            >
              Mettez-les côte à côte
            </Link>
            , avec le coût mensuel estimé pour chacun.
          </p>
        </div>
      </section>
    </>
  );
}
