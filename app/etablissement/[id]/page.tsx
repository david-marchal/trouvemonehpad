import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getEhpadByFiness } from "@/app/lib/ehpad";
import type { EhpadDetail } from "@/app/lib/ehpad";
import EstablishmentMapWrapper from "@/app/components/EstablishmentMapWrapper";
import NearbyAmenities, {
  NearbyAmenitiesLoading,
} from "@/app/components/NearbyAmenities";
import {
  SITE_NAME,
  absoluteUrl,
  buildPageMetadata,
  serializeJsonLd,
} from "@/app/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ehpad = await getEhpadByFiness(id);
  if (!ehpad) {
    return {
      title: `Établissement introuvable | ${SITE_NAME}`,
      description:
        "Cet établissement n'a pas été trouvé dans notre base de données EHPAD.",
    };
  }

  const fullAddress = [ehpad.address_line, ehpad.postal_code, ehpad.city]
    .filter(Boolean)
    .join(", ");
  const gradeText = ehpad.has_quality_grade
    ? `Note HAS ${ehpad.has_quality_grade}`
    : "Non évalué";
  const locationLabel = ehpad.city
    ? `${ehpad.city}${ehpad.department_name ? `, ${ehpad.department_name}` : ""}`
    : "France";

  return buildPageMetadata({
    title: `${ehpad.name} à ${locationLabel} | ${gradeText} | ${SITE_NAME}`,
    description: `${ehpad.name} à ${locationLabel}. ${gradeText}. Capacité : ${ehpad.capacity_total ?? "Non renseignée"} places. Adresse : ${fullAddress || locationLabel}.`,
    path: `/etablissement/${ehpad.finess_geo}`,
  });
}

const gradeConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Excellent" },
  B: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", label: "Bon" },
  C: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Acceptable" },
  D: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Insuffisant" },
};

function legalStatusLabel(status: string | null): string {
  if (!status) return "Non renseigné";
  const s = status.toLowerCase();
  if (s.includes("public")) return "Public";
  if (s.includes("priv") && s.includes("lucratif") && !s.includes("non")) return "Privé commercial";
  if (s.includes("priv") || s.includes("association") || s.includes("non lucratif")) return "Privé non lucratif";
  return status;
}

function formatImportantCriteriaRate(rate: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    maximumSignificantDigits: 2,
  }).format(rate);
}

function JsonLd({ ehpad }: { ehpad: EhpadDetail }) {
  const fullAddress = [ehpad.address_line, ehpad.postal_code, ehpad.city]
    .filter(Boolean)
    .join(", ");
  const hasPrice =
    ehpad.accommodation_price_single ?? ehpad.accommodation_price_double;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    name: ehpad.name,
    url: absoluteUrl(`/etablissement/${ehpad.finess_geo}`),
    identifier: ehpad.finess_geo,
    address: {
      "@type": "PostalAddress",
      streetAddress: ehpad.address_line || undefined,
      postalCode: ehpad.postal_code || undefined,
      addressLocality: ehpad.city || undefined,
      addressRegion: ehpad.department_name || undefined,
      addressCountry: "FR",
    },
    ...(ehpad.phone ? { telephone: ehpad.phone } : {}),
    ...(ehpad.latitude && ehpad.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: ehpad.latitude,
            longitude: ehpad.longitude,
          },
        }
      : {}),
    ...(hasPrice != null
      ? {
          priceRange: `${hasPrice.toFixed(2)} EUR / jour`,
        }
      : {}),
    ...(ehpad.has_score_100 != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ehpad.has_score_100,
            bestRating: 100,
            worstRating: 0,
            ratingCount: 1,
          },
        }
      : {}),
    description: `${ehpad.name} est un EHPAD situé à ${fullAddress}. ${
      ehpad.has_quality_grade
        ? `Note HAS ${ehpad.has_quality_grade}.`
        : "Évaluation HAS non publiée."
    }`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}

export default async function EtablissementPage({ params }: Props) {
  const { id } = await params;
  const ehpad = await getEhpadByFiness(id);
  if (!ehpad) notFound();

  const fullAddress = [ehpad.address_line, ehpad.postal_code, ehpad.city]
    .filter(Boolean)
    .join(", ");
  const grade = ehpad.has_quality_grade;
  const gc = grade ? gradeConfig[grade] : null;

  return (
    <>
      <JsonLd ehpad={ehpad} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-foreground/50">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <Link href="/search" className="hover:text-teal-600 transition-colors">
            Recherche
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground/70">{ehpad.name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {ehpad.name}
            </h1>
            <p className="mt-2 text-foreground/60">{fullAddress}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {ehpad.department_code && ehpad.department_name && (
                <span className="bg-sage-50 text-foreground/60 rounded-full px-3 py-1">
                  {ehpad.department_code} · {ehpad.department_name}
                </span>
              )}
              {ehpad.category_label && (
                <span className="bg-sage-50 text-foreground/60 rounded-full px-3 py-1">
                  {ehpad.category_label}
                </span>
              )}
              <span className="bg-sage-50 text-foreground/60 rounded-full px-3 py-1">
                {legalStatusLabel(ehpad.legal_status)}
              </span>
              {ehpad.capacity_total && (
                <span className="bg-sage-50 text-foreground/60 rounded-full px-3 py-1">
                  {ehpad.capacity_total} places
                </span>
              )}
            </div>
          </div>

          {/* HAS Grade Badge */}
          {gc && grade ? (
            <div
              className={`flex-shrink-0 rounded-2xl border ${gc.bg} ${gc.border} px-6 py-5 text-center min-w-[140px]`}
            >
              <p className={`text-xs uppercase tracking-wide font-medium ${gc.text}`}>
                Note HAS
              </p>
              <p className={`text-5xl font-bold mt-1 ${gc.text}`}>{grade}</p>
              {ehpad.has_score_100 != null && (
                <p className={`mt-1 text-sm font-medium ${gc.text}`}>
                  {ehpad.has_score_100.toFixed(1)}/100
                </p>
              )}
              <p className={`mt-1 text-xs ${gc.text}/70`}>{gc.label}</p>
            </div>
          ) : (
            <div className="flex-shrink-0 rounded-2xl bg-sage-100 px-6 py-5 text-center min-w-[140px]">
              <p className="text-xs uppercase tracking-wide text-foreground/45">
                Note HAS
              </p>
              <p className="mt-2 text-sm font-medium text-foreground/60">
                Non publié
              </p>
            </div>
          )}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* HAS Evaluation details */}
            {ehpad.has_quality_grade && (
              <section className="bg-white rounded-xl border border-sage-200 p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Évaluation HAS
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {ehpad.has_eval_date && (
                    <div>
                      <p className="text-foreground/45 text-xs uppercase tracking-wide">
                        Date d&apos;évaluation
                      </p>
                      <p className="mt-1 font-medium">
                        {new Date(ehpad.has_eval_date).toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </p>
                    </div>
                  )}
                  {ehpad.has_evaluator_name && (
                    <div>
                      <p className="text-foreground/45 text-xs uppercase tracking-wide">
                        Évaluateur
                      </p>
                      <p className="mt-1 font-medium">
                        {ehpad.has_evaluator_name}
                      </p>
                    </div>
                  )}
                  {ehpad.has_score_100 != null && (
                    <div>
                      <p className="text-foreground/45 text-xs uppercase tracking-wide">
                        Score global
                      </p>
                      <p className="mt-1 font-medium">
                        {ehpad.has_score_100.toFixed(2)} / 100
                      </p>
                    </div>
                  )}
                  {ehpad.has_taux_ci_sup_3_5 != null && (
                    <div>
                      <p className="text-foreground/45 text-xs uppercase tracking-wide">
                        Critères importants satisfaits
                      </p>
                      <p className="mt-1 font-medium">
                        {formatImportantCriteriaRate(ehpad.has_taux_ci_sup_3_5)}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Pricing */}
            {(ehpad.accommodation_price_single || ehpad.accommodation_price_double || ehpad.dependency_tariff_gir_56 || ehpad.dependency_tariff_gir_34 || ehpad.dependency_tariff_gir_12) && (
              <section className="bg-white rounded-xl border border-sage-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Tarifs</h2>

                {/* Hébergement */}
                {(ehpad.accommodation_price_single != null || ehpad.accommodation_price_double != null) && (
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-wide text-foreground/45 mb-2">Hébergement</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {ehpad.accommodation_price_single != null && (
                        <div className="bg-sage-50 rounded-lg p-3">
                          <p className="text-foreground/50 text-xs">Chambre individuelle</p>
                          <p className="mt-1 font-semibold text-base">{ehpad.accommodation_price_single.toFixed(2)} €<span className="text-xs font-normal text-foreground/50">/jour</span></p>
                          <p className="text-foreground/40 text-xs mt-0.5">≈ {(ehpad.accommodation_price_single * 30).toFixed(0)} €/mois</p>
                        </div>
                      )}
                      {ehpad.accommodation_price_double != null && (
                        <div className="bg-sage-50 rounded-lg p-3">
                          <p className="text-foreground/50 text-xs">Chambre double</p>
                          <p className="mt-1 font-semibold text-base">{ehpad.accommodation_price_double.toFixed(2)} €<span className="text-xs font-normal text-foreground/50">/jour</span></p>
                          <p className="text-foreground/40 text-xs mt-0.5">≈ {(ehpad.accommodation_price_double * 30).toFixed(0)} €/mois</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tarifs dépendance GIR */}
                {(ehpad.dependency_tariff_gir_12 != null || ehpad.dependency_tariff_gir_34 != null || ehpad.dependency_tariff_gir_56 != null) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs uppercase tracking-wide text-foreground/45">Tarif dépendance (GIR)</p>
                      <span className="text-xs text-foreground/35 italic">financé en partie par l&apos;APA</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {ehpad.dependency_tariff_gir_12 != null && (
                        <div className="flex items-center gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3">
                          <div className="flex-1">
                            <p className="font-medium text-rose-800">GIR 1 &amp; 2</p>
                            <p className="text-xs text-rose-600 mt-0.5">Dépendance totale — aide permanente</p>
                          </div>
                          <p className="font-semibold text-rose-800 whitespace-nowrap">{ehpad.dependency_tariff_gir_12.toFixed(2)} €/jour</p>
                        </div>
                      )}
                      {ehpad.dependency_tariff_gir_34 != null && (
                        <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                          <div className="flex-1">
                            <p className="font-medium text-amber-800">GIR 3 &amp; 4</p>
                            <p className="text-xs text-amber-600 mt-0.5">Dépendance partielle — aide quotidienne</p>
                          </div>
                          <p className="font-semibold text-amber-800 whitespace-nowrap">{ehpad.dependency_tariff_gir_34.toFixed(2)} €/jour</p>
                        </div>
                      )}
                      {ehpad.dependency_tariff_gir_56 != null && (
                        <div className="flex items-center gap-3 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3">
                          <div className="flex-1">
                            <p className="font-medium text-teal-800">GIR 5 &amp; 6</p>
                            <p className="text-xs text-teal-600 mt-0.5">Dépendance légère — aide ponctuelle</p>
                          </div>
                          <p className="font-semibold text-teal-800 whitespace-nowrap">{ehpad.dependency_tariff_gir_56.toFixed(2)} €/jour</p>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-foreground/40">
                      Le GIR (Groupe Iso-Ressources) mesure le niveau de dépendance de 1 (très dépendant) à 6 (autonome). Il détermine le tarif dépendance et l&apos;éligibilité à l&apos;APA (Allocation Personnalisée d&apos;Autonomie).
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* General info */}
            <section className="bg-white rounded-xl border border-sage-200 p-6">
              <h2 className="text-lg font-semibold mb-4">
                Informations générales
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {ehpad.phone && (
                  <div>
                    <dt className="text-foreground/45 text-xs uppercase tracking-wide">
                      Téléphone
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={`tel:${ehpad.phone}`}
                        className="text-teal-600 hover:underline"
                      >
                        {ehpad.phone}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-foreground/45 text-xs uppercase tracking-wide">
                    Statut
                  </dt>
                  <dd className="mt-1">{legalStatusLabel(ehpad.legal_status)}</dd>
                </div>
                {ehpad.capacity_total && (
                  <div>
                    <dt className="text-foreground/45 text-xs uppercase tracking-wide">
                      Capacité
                    </dt>
                    <dd className="mt-1">{ehpad.capacity_total} places</dd>
                  </div>
                )}
                {ehpad.category_label && (
                  <div>
                    <dt className="text-foreground/45 text-xs uppercase tracking-wide">
                      Type
                    </dt>
                    <dd className="mt-1">{ehpad.category_label}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Nearby amenities */}
            <Suspense fallback={<NearbyAmenitiesLoading />}>
              <NearbyAmenities lat={ehpad.latitude} lng={ehpad.longitude} />
            </Suspense>
          </div>

          {/* Right column - Map */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-6">
              {ehpad.latitude && ehpad.longitude ? (
                <div className="h-[300px] lg:h-[350px] rounded-xl overflow-hidden border border-sage-200 shadow-sm">
                  <EstablishmentMapWrapper
                    lat={ehpad.latitude}
                    lng={ehpad.longitude}
                    name={ehpad.name}
                    grade={ehpad.has_quality_grade}
                  />
                </div>
              ) : (
                <div className="h-[200px] rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-center">
                  <p className="text-sm text-foreground/40">
                    Coordonnées non disponibles
                  </p>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-white rounded-xl border border-sage-200 p-5 space-y-3">
                {ehpad.city && (
                  <Link
                    href={`/search?q=${encodeURIComponent(ehpad.city)}&radius=20`}
                    className="block w-full text-center text-sm font-medium rounded-lg px-4 py-2.5 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                  >
                    Voir les EHPAD à {ehpad.city}
                  </Link>
                )}
                {ehpad.department_name && (
                  <Link
                    href={`/search?q=${encodeURIComponent(ehpad.department_name)}&radius=0`}
                    className="block w-full text-center text-sm font-medium rounded-lg px-4 py-2.5 bg-sage-50 text-foreground/70 hover:bg-sage-100 transition-colors"
                  >
                    EHPAD du {ehpad.department_name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
