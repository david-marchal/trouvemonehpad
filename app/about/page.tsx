import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, buildPageMetadata } from "../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `À propos de ${SITE_NAME} | Mission et données HAS`,
  description:
    "Découvrez comment TrouveMonEHPAD rend les évaluations publiques HAS des maisons de retraite plus lisibles, comparables et accessibles aux familles.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
    <div className="bg-gradient-to-b from-warm-100 to-coral-50 border-b border-sage-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-5xl font-bold">
          À propos de TrouveMonEHPAD
        </h1>
      </div>
    </div>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      <div className="prose prose-lg max-w-none space-y-6 text-foreground/70 leading-relaxed">
        <p className="text-xl text-foreground/80">
          TrouveMonEHPAD aide les familles à trouver la meilleure maison de retraite
          pour leurs proches, en s&apos;appuyant sur les données publiques officielles.
        </p>

        <section className="bg-teal-100 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">
            Notre mission
          </h2>
          <p>
            Choisir un établissement pour un proche est une décision difficile et
            émotionnelle. Les évaluations de la Haute Autorité de Santé (HAS)
            existent pour aider les familles, mais elles sont souvent difficiles
            d&apos;accès et complexes à interpréter.
          </p>
          <p className="mt-3">
            TrouveMonEHPAD rend ces données accessibles, comparables et
            compréhensibles, pour que chaque famille puisse faire un choix
            éclairé.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Des données fiables et transparentes
          </h2>
          <p>
            Toutes les évaluations présentées sur TrouveMonEHPAD proviennent
            directement des données publiques de la{" "}
            <strong>Haute Autorité de Santé (HAS)</strong>, l&apos;organisme
            public indépendant chargé d&apos;évaluer la qualité des
            établissements de santé en France.
          </p>
          <p className="mt-3">
            Nous ne modifions pas ces données. Nous les présentons de manière
            claire et structurée pour faciliter votre recherche.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Gratuit et indépendant
          </h2>
          <p>
            TrouveMonEHPAD est un service entièrement gratuit. Nous n&apos;avons aucun
            partenariat commercial avec les établissements et ne percevons
            aucune commission. Notre seul objectif est de vous aider à faire le
            meilleur choix pour vos proches.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Nos limites
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Nous ne savons pas si un établissement a une place libre : cette
              information n&apos;est pas publique. Appelez-le.
            </li>
            <li>
              Nous n&apos;avons ni photos ni avis de familles. Une note résume une
              évaluation faite à un moment donné ; elle ne remplace pas une visite.
            </li>
            <li>
              Les tarifs viennent de la CNSA et ne sont pas publiés pour tous les
              établissements. Les unités Alzheimer viennent du répertoire FINESS
              et peuvent être incomplètes.
            </li>
            <li>
              Les estimations de coût sont indicatives : elles ne remplacent pas
              le contrat de séjour ni la décision du département pour l&apos;APA.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            About TrouveMonEHPAD (English)
          </h2>
          <p>
            TrouveMonEHPAD helps families in France compare and evaluate retirement
            homes (EHPAD) using official public data from the Haute Autorité de
            Santé (HAS). Our goal is to make this critical information
            accessible, comparable, and easy to understand — so every family can
            make an informed decision.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-coral-600 hover:bg-coral-700 text-white font-semibold rounded-full px-8 py-3 min-h-[44px] transition-colors w-full sm:w-auto"
        >
          Commencer une recherche
        </Link>
      </div>
    </div>
    </>
  );
}
