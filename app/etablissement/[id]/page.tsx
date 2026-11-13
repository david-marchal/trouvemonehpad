import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getEhpadByFiness } from "@/app/lib/ehpad";
import type { EhpadDetail } from "@/app/lib/ehpad";
import EstablishmentMapWrapper from "@/app/components/EstablishmentMapWrapper";
import CostCalculator from "@/app/components/CostCalculator";
import { plainSummary } from "@/app/lib/summary";
import { citySlug, departmentSlug, prettyCity } from "@/app/lib/directory";
import { aideSociale, AIDE_SOCIALE_LABEL } from "@/app/lib/aide-sociale";
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
    ? `Évaluation HAS ${ehpad.has_quality_grade}`
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
  A: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", label: "Excellent" },
  B: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200", label: "Bon" },
  C: { bg: "bg-sun-100", text: "text-sun-700", border: "border-sun-200", label: "Acceptable" },
  D: { bg: "bg-coral-100", text: "text-coral-700", border: "border-coral-100", label: "Insuffisant" },
};

// Statut juridique — label + couleur de badge
function legalStatusConfig(status: string | null): { label: string; bg: string; text: string; border: string } {
  if (!status) return { label: "Non renseigné", bg: "bg-sage-50", text: "text-foreground/50", border: "border-sage-200" };
  const s = status.toLowerCase();
  if (s.includes("public")) return { label: "Public", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  if (s.includes("priv") && s.includes("lucratif") && !s.includes("non"))
    return { label: "Privé commercial", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
  if (s.includes("priv") || s.includes("association") || s.includes("non lucratif"))
    return { label: "Privé non lucratif", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
  return { label: status, bg: "bg-sage-50", text: "text-foreground/50", border: "border-sage-200" };
}

function legalStatusLabel(status: string | null): string {
  return legalStatusConfig(status).label;
}

// Indicateur d'ancienneté de l'évaluation HAS (cycle de 5 ans)
function evalFreshnessIndicator(evalDateStr: string | null): {
  label: string;
  sublabel: string;
  dot: string;
} {
  if (!evalDateStr) return { label: "", sublabel: "", dot: "" };
  const evalDate = new Date(evalDateStr);
  const now = new Date();
  const diffYears = (now.getTime() - evalDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  if (diffYears < 2.5) return {
    label: "Récente",
    sublabel: "Évaluation de moins de 2 ans et demi",
    dot: "bg-emerald-500",
  };
  if (diffYears < 5) return {
    label: "À renouveler bientôt",
    sublabel: "Évaluation de plus de 2 ans et demi",
    dot: "bg-amber-400",
  };
  return {
    label: "À renouveler",
    sublabel: "Évaluation de plus de 5 ans",
    dot: "bg-rose-400",
  };
}

function formatImportantCriteriaRate(rate: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(rate / 100);
}

function TariffDetail({ ehpad }: { ehpad: EhpadDetail }) {
  return (
    <>

                {/* Hébergement */}
                {(ehpad.accommodation_price_single != null || ehpad.accommodation_price_double != null) && (
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-wide text-foreground/45 mb-2">Hébergement</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {ehpad.accommodation_price_single != null && (
                        <div className="bg-sage-50 rounded-2xl p-3">
                          <p className="text-foreground/50 text-xs">Chambre individuelle</p>
                          <p className="mt-1 font-semibold text-base">{ehpad.accommodation_price_single.toFixed(2)} €<span className="text-xs font-normal text-foreground/50">/jour</span></p>
                          <p className="text-foreground/40 text-xs mt-0.5">≈ {(ehpad.accommodation_price_single * 30).toFixed(0)} €/mois</p>
                        </div>
                      )}
                      {ehpad.accommodation_price_double != null && (
                        <div className="bg-sage-50 rounded-2xl p-3">
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
                      <p className="text-xs uppercase tracking-wide text-foreground/45">Tarif selon la dépendance</p>
                      <span className="text-xs text-foreground/35 italic">financé en partie par l&apos;APA</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {ehpad.dependency_tariff_gir_12 != null && (
                        <div className="flex items-center gap-3 rounded-2xl border border-coral-100 bg-coral-50 px-4 py-3">
                          <div className="flex-1">
                            <p className="font-medium text-coral-700">Dépendance forte</p>
                            <p className="text-xs text-coral-600 mt-0.5">GIR 1 et 2 · aide permanente</p>
                          </div>
                          <p className="font-semibold text-coral-700 whitespace-nowrap">{ehpad.dependency_tariff_gir_12.toFixed(2)} €/jour</p>
                        </div>
                      )}
                      {ehpad.dependency_tariff_gir_34 != null && (
                        <div className="flex items-center gap-3 rounded-2xl border border-sun-200 bg-sun-100 px-4 py-3">
                          <div className="flex-1">
                            <p className="font-medium text-sun-700">Dépendance modérée</p>
                            <p className="text-xs text-sun-700 mt-0.5">GIR 3 et 4 · aide quotidienne</p>
                          </div>
                          <p className="font-semibold text-sun-700 whitespace-nowrap">{ehpad.dependency_tariff_gir_34.toFixed(2)} €/jour</p>
                        </div>
                      )}
                      {ehpad.dependency_tariff_gir_56 != null && (
                        <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-100 px-4 py-3">
                          <div className="flex-1">
                            <p className="font-medium text-teal-800">Dépendance légère</p>
                            <p className="text-xs text-teal-600 mt-0.5">GIR 5 et 6 · aide ponctuelle</p>
                          </div>
                          <p className="font-semibold text-teal-800 whitespace-nowrap">{ehpad.dependency_tariff_gir_56.toFixed(2)} €/jour</p>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-foreground/40">
                      Le niveau de dépendance de votre proche est mesuré par son groupe GIR, de 1 (très dépendant) à 6 (autonome). Il détermine le tarif ci-dessus et l&apos;éligibilité à l&apos;APA (Allocation Personnalisée d&apos;Autonomie).
                    </p>
                  </div>
                )}
    </>
  );
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
        ? `Évaluation HAS ${ehpad.has_quality_grade}.`
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
  const lsc = legalStatusConfig(ehpad.legal_status);
  const freshness = evalFreshnessIndicator(ehpad.has_eval_date);

  return (
    <>
      <JsonLd ehpad={ehpad} />
      <div className="border-b border-sage-200 bg-gradient-to-b from-warm-100 to-coral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8">
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
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {ehpad.name}
            </h1>
            <p className="mt-2 text-foreground/60">{fullAddress}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {ehpad.department_code && ehpad.department_name && (
                <span className="bg-sky-100 text-sky-700 rounded-full px-3 py-1 font-medium">
                  {ehpad.department_code} · {ehpad.department_name}
                </span>
              )}
              {ehpad.category_label && (
                <span className="bg-sage-50 text-foreground/60 rounded-full px-3 py-1">
                  {ehpad.category_label}
                </span>
              )}
              {/* Statut juridique coloré */}
              <span className={`rounded-full px-3 py-1 border font-medium ${lsc.bg} ${lsc.text} ${lsc.border}`}>
                {lsc.label}
              </span>
              {ehpad.capacity_total && (
                <span className="bg-sage-50 text-foreground/60 rounded-full px-3 py-1">
                  {ehpad.capacity_total} places
                </span>
              )}
              {(ehpad.alzheimer_places || ehpad.has_pasa || ehpad.has_uhr) && (
                <a
                  href="#alzheimer"
                  className="rounded-full px-3 py-1 border font-medium bg-coral-50 text-coral-700 border-coral-100 hover:bg-coral-100"
                >
                  Unité Alzheimer
                </a>
              )}
              {aideSociale(ehpad.mft_code) !== "inconnu" && (
                <span
                  className={`rounded-full px-3 py-1 border font-medium ${
                    aideSociale(ehpad.mft_code) === "oui"
                      ? "bg-teal-100 text-teal-700 border-teal-200"
                      : "bg-sage-50 text-foreground/60 border-sage-200"
                  }`}
                >
                  {AIDE_SOCIALE_LABEL[aideSociale(ehpad.mft_code)]}
                </span>
              )}
            </div>
          </div>

          {/* HAS Grade Badge */}
          {gc && grade ? (
            <div
              className={`flex-shrink-0 rounded-3xl border ${gc.bg} ${gc.border} px-6 py-5 text-center min-w-[140px]`}
            >
              <p className={`text-xs uppercase tracking-wide font-medium ${gc.text}`}>
                Évaluation HAS
              </p>
              <p className={`text-5xl font-bold mt-1 ${gc.text}`}>{grade}</p>
              {ehpad.has_score_100 != null && (
                <p className={`mt-1 text-sm font-medium ${gc.text}`}>
                  {ehpad.has_score_100.toFixed(1)}/100
                </p>
              )}
              <p className={`mt-1 text-xs ${gc.text}`}>{gc.label}</p>
              {ehpad.has_eval_date && (
                <p className={`mt-1 text-[11px] opacity-75 ${gc.text}`}>
                  Évaluée en{" "}
                  {new Date(ehpad.has_eval_date).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ) : (
            <div className="flex-shrink-0 rounded-3xl bg-sage-100 px-6 py-5 text-center min-w-[140px]">
              <p className="text-xs uppercase tracking-wide text-foreground/45">
                Évaluation HAS
              </p>
              <p className="mt-2 text-sm font-medium text-foreground/60">
                Non publié
              </p>
            </div>
          )}
        </div>

      </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Résumé en langage clair */}
            <section className="rounded-3xl border border-sage-200 bg-white p-6">
              <h2 className="text-xl mb-2">En clair</h2>
              <div className="space-y-2 text-foreground/85 leading-relaxed max-w-prose">
                {plainSummary(ehpad).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <p className="mt-3 text-sm text-foreground/65">
                <Link href="/guides/lire-une-evaluation-has" className="text-teal-600 underline underline-offset-2">
                  Comment lire une évaluation HAS
                </Link>
              </p>
            </section>

            {/* Tarif et reste à payer */}
            {ehpad.accommodation_price_single != null ? (
              <CostCalculator
                aideSociale={aideSociale(ehpad.mft_code)}
                pricing={{
                  accommodation_price_single: ehpad.accommodation_price_single,
                  dependency_tariff_gir_12: ehpad.dependency_tariff_gir_12,
                  dependency_tariff_gir_34: ehpad.dependency_tariff_gir_34,
                  dependency_tariff_gir_56: ehpad.dependency_tariff_gir_56,
                }}
              >
                <TariffDetail ehpad={ehpad} />
              </CostCalculator>
            ) : ehpad.accommodation_price_double != null ||
              ehpad.dependency_tariff_gir_12 != null ||
              ehpad.dependency_tariff_gir_34 != null ||
              ehpad.dependency_tariff_gir_56 != null ? (
              <section className="rounded-3xl border border-sage-200 bg-white p-6">
                <h2 className="text-xl mb-4">Tarifs</h2>
                <TariffDetail ehpad={ehpad} />
              </section>
            ) : null}

            {/* Et maintenant ? */}
            <section className="rounded-3xl bg-teal-100 p-6">
              <h2 className="text-xl mb-4 text-teal-700">Et maintenant ?</h2>
              <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <li className="rounded-2xl bg-white p-4">
                  <p className="font-semibold">1. Appelez l&apos;établissement</p>
                  <p className="mt-1 text-sm text-foreground/75 leading-relaxed">
                    Demandez s&apos;il a une place, le délai d&apos;attente et le dossier
                    d&apos;admission à remplir.
                  </p>
                  {ehpad.phone ? (
                    <a
                      href={`tel:${ehpad.phone.replace(/\s/g, "")}`}
                      className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-coral-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-700"
                    >
                      Appeler le {ehpad.phone}
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-foreground/60">
                      Numéro non renseigné dans les bases publiques.
                    </p>
                  )}
                </li>
                <li className="rounded-2xl bg-white p-4">
                  <p className="font-semibold">2. Visitez, deux fois si possible</p>
                  <p className="mt-1 text-sm text-foreground/75 leading-relaxed">
                    Une fois en semaine, une fois le week-end ou à l&apos;heure du repas.
                    Apportez la liste de questions.
                  </p>
                  <Link
                    href={`/etablissement/${ehpad.finess_geo}/visite`}
                    className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-600 transition-colors hover:bg-teal-100"
                  >
                    Imprimer les questions
                  </Link>
                </li>
                <li className="rounded-2xl bg-white p-4">
                  <p className="font-semibold">3. Lisez avant de signer</p>
                  <p className="mt-1 text-sm text-foreground/75 leading-relaxed">
                    Demandez le contrat de séjour, le règlement de fonctionnement et le
                    rapport d&apos;évaluation HAS complet.
                  </p>
                  <Link
                    href={`/comparer?ids=${ehpad.finess_geo}`}
                    className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-600 transition-colors hover:bg-teal-100"
                  >
                    Comparer avec un autre
                  </Link>
                </li>
              </ol>
            </section>


            {/* HAS Evaluation details */}
            {ehpad.has_quality_grade && (
              <section className="bg-white rounded-3xl border border-sage-200 p-6">
                <h2 className="text-lg font-semibold mb-2">Évaluation HAS</h2>
                <p className="mb-4 text-sm text-foreground/75 leading-relaxed max-w-prose">
                  La lettre résume l&apos;évaluation officielle, de A (la meilleure) à D.
                  Elle ne dit rien de l&apos;ambiance au quotidien : demandez le rapport
                  complet et visitez.{" "}
                  <Link
                    href="/guides/lire-une-evaluation-has"
                    className="text-teal-600 underline underline-offset-2"
                  >
                    Comment la lire
                  </Link>
                </p>
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
                      {/* Indicateur de fraîcheur */}
                      {freshness.dot && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${freshness.dot}`} />
                          <span className="text-xs text-foreground/50">{freshness.label}</span>
                        </div>
                      )}
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
                {/* Explication ancienneté */}
                {freshness.sublabel && (
                  <p className="mt-4 text-xs text-foreground/40 border-t border-sage-100 pt-3">
                    {freshness.sublabel}. Les évaluations HAS sont renouvelées tous les 5 ans.
                  </p>
                )}
              </section>
            )}

            {/* Alzheimer */}
            <section id="alzheimer" className="scroll-mt-4 rounded-3xl border border-sage-200 bg-white p-6">
              <h2 className="text-xl mb-2">Accompagnement Alzheimer</h2>
              {ehpad.alzheimer_places || ehpad.has_pasa || ehpad.has_uhr ? (
                <ul className="space-y-2 text-foreground/85 leading-relaxed max-w-prose">
                  {ehpad.alzheimer_places ? (
                    <li>
                      <strong>{ehpad.alzheimer_places} places</strong> déclarées pour des
                      personnes atteintes de la maladie d&apos;Alzheimer ou de maladies
                      apparentées.
                    </li>
                  ) : null}
                  {ehpad.has_pasa ? (
                    <li>
                      <strong>Un PASA</strong> (pôle d&apos;activités et de soins adaptés) :
                      des activités en journée pour les résidents qui ont des troubles
                      modérés.
                    </li>
                  ) : null}
                  {ehpad.has_uhr ? (
                    <li>
                      <strong>Une UHR</strong> (unité d&apos;hébergement renforcée) : une
                      unité sécurisée pour les troubles du comportement sévères.
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="text-foreground/85 leading-relaxed max-w-prose">
                  Aucune unité spécialisée n&apos;est déclarée pour cet établissement dans
                  le répertoire officiel (FINESS). Cela ne veut pas dire qu&apos;il
                  n&apos;accueille pas de personnes malades : posez la question lors de la
                  visite.
                </p>
              )}
              <p className="mt-3 text-sm text-foreground/55">
                Source : répertoire FINESS, à confirmer avec l&apos;établissement.
              </p>
            </section>

          </div>

          {/* Right column - Map */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {ehpad.latitude && ehpad.longitude ? (
                <div className="h-[300px] lg:h-[350px] rounded-3xl overflow-hidden border border-sage-200 shadow-sm">
                  <EstablishmentMapWrapper
                    lat={ehpad.latitude}
                    lng={ehpad.longitude}
                    name={ehpad.name}
                    grade={ehpad.has_quality_grade}
                  />
                </div>
              ) : (
                <div className="h-[200px] rounded-3xl bg-sage-50 border border-sage-200 flex items-center justify-center">
                  <p className="text-sm text-foreground/40">
                    Coordonnées non disponibles
                  </p>
                </div>
              )}

              {/* Nearby amenities */}
              <Suspense fallback={<NearbyAmenitiesLoading />}>
                <NearbyAmenities lat={ehpad.latitude} lng={ehpad.longitude} />
              </Suspense>

              {/* Quick actions */}
              <div className="bg-white rounded-3xl border border-sage-200 p-5 space-y-3">
                <Link
                  href={`/comparer?ids=${ehpad.finess_geo}`}
                  className="block w-full text-center text-sm font-semibold rounded-full px-4 py-3 bg-coral-600 text-white hover:bg-coral-700 transition-colors"
                >
                  Comparer avec d&apos;autres EHPAD
                </Link>
                {ehpad.city && ehpad.department_code && (
                  <Link
                    href={`/ehpad/${departmentSlug(ehpad.department_code, ehpad.department_name)}/${citySlug(ehpad.city)}`}
                    className="block w-full text-center text-sm font-medium rounded-full px-4 py-3 bg-sun-100 text-sun-700 hover:bg-sun-200 transition-colors"
                  >
                    Tous les EHPAD de {prettyCity(ehpad.city)}
                  </Link>
                )}
                {ehpad.city && (
                  <Link
                    href={`/search?q=${encodeURIComponent(ehpad.city)}&radius=10`}
                    className="block w-full text-center text-sm font-medium rounded-full px-4 py-3 bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors"
                  >
                    Voir les EHPAD à {ehpad.city}
                  </Link>
                )}
                {ehpad.department_name && (
                  <Link
                    href={`/search?q=${encodeURIComponent(ehpad.department_name)}&radius=0`}
                    className="block w-full text-center text-sm font-medium rounded-full px-4 py-3 bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
                  >
                    EHPAD du {ehpad.department_name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-foreground/50">
          Numéro FINESS : <span className="font-mono">{ehpad.finess_geo}</span>. Données
          publiques : annuaire FINESS, évaluations de la HAS, tarifs de la CNSA.
        </p>
      </div>
    </>
  );
}
