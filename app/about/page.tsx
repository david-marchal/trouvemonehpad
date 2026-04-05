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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">
        À propos de TrouveMonEHPAD
      </h1>

      <div className="prose prose-lg max-w-none space-y-6 text-foreground/70 leading-relaxed">
        <p className="text-xl text-foreground/80">
          TrouveMonEHPAD aide les familles à trouver la meilleure maison de retraite
          pour leurs proches, en s&apos;appuyant sur les données publiques officielles.
        </p>

        <section className="bg-teal-50 rounded-2xl p-6 sm:p-8 border border-teal-100">
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
          className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-full px-8 py-3 min-h-[44px] transition-colors w-full sm:w-auto"
        >
          Commencer une recherche
        </Link>
      </div>
    </div>
  );
}
