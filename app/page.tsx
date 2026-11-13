import type { Metadata } from "next";
import Image from "next/image";
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

// Les chiffres sont recalculés au plus une fois par heure.
export const revalidate = 3600;

const CITIES = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Nice",
  "Nantes",
  "Bordeaux",
  "Lille",
  "Rouen",
  "Strasbourg",
];

const CITY_TINTS = [
  "bg-teal-100 text-teal-700",
  "bg-warm-100 text-warm-700",
  "bg-sky-100 text-sky-700",
  "bg-coral-100 text-coral-700",
  "bg-sun-100 text-sun-700",
];

const GUIDE_TINTS = [
  "bg-teal-100 text-teal-700",
  "bg-warm-100 text-warm-700",
  "bg-sky-100 text-sky-700",
  "bg-coral-100 text-coral-700",
];

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

      <section className="bg-gradient-to-b from-warm-100 via-coral-50 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] max-w-3xl mx-auto">
            Trouvez un EHPAD près de chez vous
          </h1>
          <p className="mt-4 text-lg text-foreground/70">
            Notes officielles, tarifs et coût mensuel estimé.
          </p>
          <div className="mt-9">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative col-span-2 lg:row-span-2 min-h-56 sm:min-h-72 overflow-hidden rounded-3xl bg-sage-100">
            <Image
              src="/hero.jpg"
              alt="Les mains de deux personnes âgées, l'une posée sur l'autre"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_55%]"
            />
          </div>

          <div className="rounded-3xl bg-teal-100 text-teal-700 p-5 sm:p-6 flex flex-col justify-between min-h-36">
            <p className="font-serif text-4xl sm:text-5xl font-semibold">
              {stats ? formatNumber(stats.total) : "Tous"}
            </p>
            <p className="font-medium">EHPAD en France</p>
          </div>

          <div className="rounded-3xl bg-sky-100 text-sky-700 p-5 sm:p-6 flex flex-col justify-between min-h-36">
            <p className="font-serif text-4xl sm:text-5xl font-semibold">
              {stats ? formatNumber(stats.evaluated) : "HAS"}
            </p>
            <p className="font-medium">évalués par la HAS</p>
          </div>

          <div className="rounded-3xl bg-sun-100 text-sun-700 p-5 sm:p-6 flex flex-col justify-between min-h-36">
            <p className="font-serif text-2xl sm:text-3xl font-semibold leading-tight">
              {stats?.updatedAt
                ? formatDateFr(stats.updatedAt)
                : "Chaque jour"}
            </p>
            <p className="font-medium">dernière mise à jour</p>
          </div>

          <div className="rounded-3xl bg-coral-100 text-coral-700 p-5 sm:p-6 flex flex-col justify-between min-h-36">
            <p className="font-serif text-2xl sm:text-3xl font-semibold leading-tight">
              Aucune publicité
            </p>
            <p className="font-medium">aucun EHPAD ne paie pour apparaître</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <h2 className="text-2xl sm:text-3xl">Chercher près de…</h2>
        <ul className="mt-5 flex flex-wrap gap-3">
          {CITIES.map((city, i) => (
            <li key={city}>
              <Link
                href={`/search?q=${encodeURIComponent(city)}&radius=10`}
                className={`inline-flex items-center min-h-[48px] rounded-full px-6 font-semibold transition-transform hover:-translate-y-0.5 ${CITY_TINTS[i % CITY_TINTS.length]}`}
              >
                {city}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <h2 className="text-2xl sm:text-3xl">Avant de choisir</h2>
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {GUIDES.map((g, i) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className={`group h-full min-h-36 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-transform hover:-translate-y-0.5 ${GUIDE_TINTS[i % GUIDE_TINTS.length]}`}
              >
                <span className="font-serif text-xl font-semibold leading-snug">
                  {g.title}
                </span>
                <span className="mt-4 font-semibold underline-offset-4 group-hover:underline">
                  Lire le guide
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <h2 className="text-2xl sm:text-3xl">Un site indépendant</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-teal-100 p-6 text-teal-700">
            <h3 className="text-lg font-semibold">Sans publicité, sans rappel</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Aucun établissement ne paie pour apparaître ici, et personne ne vous
              rappelle : pas de formulaire de contact, pas de démarchage.
            </p>
          </div>
          <div className="rounded-3xl bg-sky-100 p-6 text-sky-700">
            <h3 className="text-lg font-semibold">Des données officielles</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Annuaire FINESS, évaluations de la Haute Autorité de santé, tarifs de
              la CNSA.{" "}
              {stats?.updatedAt
                ? `Dernière mise à jour le ${formatDateFr(stats.updatedAt)}.`
                : "Mises à jour chaque jour."}
            </p>
          </div>
          <div className="rounded-3xl bg-warm-100 p-6 text-warm-700">
            <h3 className="text-lg font-semibold">Nos limites, dites franchement</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Nous ne connaissons pas les places disponibles et nous n&apos;avons pas
              d&apos;avis de familles.{" "}
              <Link href="/about" className="font-semibold underline underline-offset-2">
                Nos sources et nos limites
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-foreground/70">
          Vous préférez parcourir ?{" "}
          <Link href="/ehpad" className="font-semibold text-teal-600 underline underline-offset-2 hover:text-teal-700">
            Les EHPAD par département
          </Link>
        </p>
      </section>

      <section className="border-t border-sage-200 bg-white">
        <p className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-foreground/70">
          Ce site ne classe pas les EHPAD : la HAS ne conçoit pas ses
          évaluations comme un palmarès. Vous hésitez entre deux adresses ?{" "}
          <Link
            href="/comparer"
            className="font-semibold text-teal-600 underline underline-offset-2 hover:text-teal-700"
          >
            Comparez-les côte à côte
          </Link>
          .
        </p>
      </section>
    </>
  );
}
