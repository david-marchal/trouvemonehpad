import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, GUIDES_VERIFIED_ON } from "../lib/guides";
import { SITE_NAME, buildPageMetadata } from "../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `Guides pour choisir un EHPAD | ${SITE_NAME}`,
  description:
    "Lire une évaluation HAS, comprendre le coût d'un EHPAD, le GIR et l'APA, préparer une visite : quatre guides sourcés pour les familles.",
  path: "/guides",
});

const TINTS = [
  "bg-teal-100 text-teal-700",
  "bg-warm-100 text-warm-700",
  "bg-sky-100 text-sky-700",
  "bg-coral-100 text-coral-700",
];

export default function GuidesPage() {
  return (
    <>
      <div className="bg-gradient-to-b from-warm-100 to-coral-50 border-b border-sage-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-5xl leading-tight">
            Quatre guides pour choisir un EHPAD
          </h1>
          <p className="mt-4 text-lg text-foreground/70 max-w-xl">
            Chaque guide cite ses sources et indique la date de sa dernière
            vérification, le {GUIDES_VERIFIED_ON}.
          </p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GUIDES.map((g, i) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className={`group h-full min-h-48 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-transform hover:-translate-y-0.5 ${TINTS[i % TINTS.length]}`}
              >
                <span>
                  <span className="block font-serif text-2xl font-semibold leading-snug">
                    {g.title}
                  </span>
                  <span className="mt-2 block opacity-85">{g.summary}</span>
                </span>
                <span className="mt-5 font-semibold underline-offset-4 group-hover:underline">
                  Lire le guide
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
