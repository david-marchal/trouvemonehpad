import type { Metadata } from "next";
import { getEhpadsByFiness } from "../lib/ehpad";
import { SITE_NAME, buildPageMetadata } from "../lib/seo";
import CompareView from "../components/CompareView";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: `Comparer des EHPAD côte à côte | ${SITE_NAME}`,
    description:
      "Mettez 2 ou 3 EHPAD côte à côte : note HAS, places, tarifs et coût mensuel estimé selon le niveau de dépendance.",
    path: "/comparer",
  }),
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ ids?: string }> };

export default async function ComparerPage({ searchParams }: Props) {
  const { ids } = await searchParams;
  const list = Array.from(
    new Set(
      (ids ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[0-9A-Za-z]{9}$/.test(s))
    )
  ).slice(0, 3);

  const ehpads = list.length ? await getEhpadsByFiness(list) : [];

  return (
    <>
      <div className="bg-gradient-to-b from-warm-100 to-coral-50 border-b border-sage-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-5xl leading-tight">
            Comparer des EHPAD
          </h1>
          <p className="mt-3 text-lg text-foreground/70 max-w-2xl">
            Jusqu&apos;à trois établissements côte à côte, avec le coût
            mensuel estimé selon le niveau de dépendance.
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <CompareView ehpads={ehpads} />
      </div>
    </>
  );
}
