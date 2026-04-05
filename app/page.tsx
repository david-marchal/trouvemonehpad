import type { Metadata } from "next";
import SearchBar from "./components/SearchBar";
import {
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  absoluteUrl,
  buildPageMetadata,
  serializeJsonLd,
} from "./lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/favicon.ico"),
    description: SITE_DESCRIPTION,
    areaServed: "FR",
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(organizationJsonLd),
        }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50 to-background -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-24 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-teal-200/70 bg-white/80 px-5 py-2.5 text-teal-700 shadow-sm mb-6">
            <span className="text-2xl" role="img" aria-label="maison de retraite">
              🏡
            </span>
            <span className="text-lg sm:text-xl font-semibold tracking-tight">
              {SITE_NAME}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight max-w-3xl mx-auto">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Comparez les EHPAD et maisons de retraite en France grâce aux
            évaluations publiques de la Haute Autorité de Santé.
          </p>
          <div className="inline-flex items-center gap-2 bg-teal-100/60 text-teal-700 text-sm font-medium rounded-full px-4 py-1.5 mt-6">
            <span>🇫🇷</span>
            <span>Données officielles HAS</span>
          </div>
          <div className="mt-10">
            <SearchBar large />
          </div>
          <p className="mt-4 text-sm text-foreground/40">
            Recherchez par ville, département ou nom d&apos;établissement
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Pourquoi utiliser TrouveMonEHPAD&nbsp;?
          </h2>
          <p className="text-center text-foreground/50 mb-12 max-w-xl mx-auto">
            Un outil gratuit et transparent pour vous aider dans cette décision importante.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Données officielles"
              description="Les évaluations proviennent directement de la Haute Autorité de Santé (HAS), garantissant fiabilité et objectivité."
            />
            <FeatureCard
              icon="🔍"
              title="Comparaison simple"
              description="Recherchez par ville ou département et comparez facilement les établissements selon les critères qui comptent pour vous."
            />
            <FeatureCard
              icon="💚"
              title="100% gratuit"
              description="TrouveMonEHPAD est un service gratuit. Pas de publicité, pas de partenariats commerciaux avec les établissements."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-sage-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Comment ça marche&nbsp;?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <Step
              number="1"
              title="Recherchez"
              description="Entrez une ville, un département ou le nom d'un établissement."
            />
            <Step
              number="2"
              title="Comparez"
              description="Consultez les évaluations HAS et comparez les établissements."
            />
            <Step
              number="3"
              title="Décidez"
              description="Choisissez l'établissement le mieux adapté à vos besoins."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Prêt à trouver le bon établissement&nbsp;?
          </h2>
          <p className="text-foreground/50 mb-8">
            Commencez votre recherche dès maintenant — c&apos;est gratuit et sans inscription.
          </p>
          <SearchBar />
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-foreground/60 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="w-12 h-12 rounded-full bg-teal-500 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-foreground/60 leading-relaxed">{description}</p>
    </div>
  );
}
