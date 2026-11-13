import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/app/lib/site-config";
import { SITE_NAME, buildPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `Mentions légales | ${SITE_NAME}`,
  description: `Qui édite ${SITE_NAME}, qui l'héberge, comment sont traitées les données et d'où viennent les informations affichées.`,
  path: "/mentions-legales",
});

export default function LegalNoticePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-warm-100 to-coral-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl sm:text-4xl">Mentions légales</h1>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 text-foreground/85 leading-relaxed sm:px-6">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Éditeur du site</h2>
          <p>
            {SITE_NAME} est édité par une personne physique, à titre non
            professionnel. Conformément à l&apos;article 6, III, 2 de la loi du 21
            juin 2004 pour la confiance dans l&apos;économie numérique, son identité
            a été communiquée à l&apos;hébergeur du site.
          </p>
          <p className="mt-2">Le directeur de la publication est l&apos;éditeur du site.</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Contact</h2>
          {CONTACT_EMAIL ? (
            <p>
              Pour toute question ou demande, écrivez à{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-teal-600 underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ) : (
            <p>
              L&apos;adresse de contact du site est en cours de mise en place. Elle
              sera publiée sur cette page.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Hébergeur</h2>
          <p>
            Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
            Site : vercel.com.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Données personnelles
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Le site n&apos;a ni compte, ni formulaire de contact, ni publicité. Nous
              ne collectons pas de données qui vous identifient.
            </li>
            <li>
              Nous mesurons le nombre de visites avec un outil de statistiques
              (Vercel Web Analytics), qui n&apos;utilise pas de cookies de suivi.
            </li>
            <li>
              Les cartes et la liste des commerces proches sont fournies par
              OpenStreetMap : votre navigateur contacte directement leurs serveurs, qui
              reçoivent votre adresse IP et la zone affichée.
            </li>
            <li>
              Ce que vous saisissez dans le simulateur de coût (niveau de
              dépendance, revenus) reste dans votre navigateur et n&apos;est pas
              envoyé au site. Votre navigateur garde en mémoire, quelques heures, la
              liste des commerces déjà consultés, pour éviter de la redemander.
            </li>
          </ul>
          <p className="mt-3">
            Pour exercer vos droits (accès, effacement) ou poser une question sur
            vos données, utilisez l&apos;adresse de contact ci-dessus.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Origine des informations
          </h2>
          <p>
            Les informations affichées viennent de bases publiques : l&apos;annuaire
            FINESS (identité et capacités des établissements), les évaluations de la
            Haute Autorité de santé (HAS) et les tarifs publiés par la CNSA. Les
            cartes et les commerces proches viennent d&apos;OpenStreetMap
            (© contributeurs OpenStreetMap, licence ODbL). Voir aussi{" "}
            <Link href="/about" className="text-teal-600 underline underline-offset-2">
              nos limites
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Responsabilité</h2>
          <p>
            Les informations et les estimations de coût sont données à titre
            indicatif. Elles ne remplacent ni le contrat de séjour, ni la décision du
            conseil départemental pour les aides, ni un conseil médical, juridique
            ou fiscal. Avant tout choix, vérifiez les informations auprès de
            l&apos;établissement.
          </p>
        </section>
      </div>
    </>
  );
}
