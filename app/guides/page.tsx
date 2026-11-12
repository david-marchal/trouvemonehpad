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

export default function GuidesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl leading-tight">
        Quatre guides pour choisir un EHPAD
      </h1>
      <p className="mt-4 text-foreground/75 max-w-xl">
        Chaque guide cite ses sources et indique la date de sa dernière
        vérification, le {GUIDES_VERIFIED_ON}.
      </p>
      <ul className="mt-10 divide-y divide-sage-200 border-y border-sage-200">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="group block py-6 hover:bg-white/60 transition-colors -mx-3 px-3 rounded"
            >
              <h2 className="text-xl group-hover:text-teal-600 transition-colors">
                {g.title}
              </h2>
              <p className="mt-1 text-foreground/70">{g.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
