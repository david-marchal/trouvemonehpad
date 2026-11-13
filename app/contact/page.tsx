import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/app/lib/site-config";
import { SITE_NAME, buildPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `Contact | ${SITE_NAME}`,
  description: `Contacter ${SITE_NAME} : une erreur sur une fiche, une question, une demande d'un établissement ou d'un professionnel.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-warm-100 to-coral-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl sm:text-4xl">Nous contacter</h1>
          <p className="mt-3 max-w-prose text-foreground/75">
            Une erreur sur une fiche, une question, une demande d&apos;un
            établissement ou d&apos;un professionnel : écrivez-nous.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 leading-relaxed text-foreground/85 sm:px-6">
        {CONTACT_EMAIL ? (
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-[44px] items-center rounded-full bg-coral-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-700"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        ) : (
          <p>L&apos;adresse de contact est en cours de mise en place.</p>
        )}

        <section className="rounded-3xl border border-sage-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Vous représentez un établissement ?</h2>
          <p className="mt-2">
            Les informations de chaque fiche viennent de bases publiques
            (FINESS, HAS, CNSA) : pour les corriger, il faut passer par ces
            organismes. Nous pouvons vous indiquer la démarche.
          </p>
          <p className="mt-2">
            Aucun établissement ne peut payer pour modifier sa note, son rang ou sa
            place dans les résultats.
          </p>
        </section>

        <p className="text-sm text-foreground/60">
          Voir aussi les{" "}
          <Link href="/mentions-legales" className="text-teal-600 underline underline-offset-2">
            mentions légales
          </Link>
          .
        </p>
      </div>
    </>
  );
}
