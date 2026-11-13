import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "../../lib/guides";
import { SITE_NAME, buildPageMetadata } from "../../lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: `Guide introuvable | ${SITE_NAME}` };
  return buildPageMetadata({
    title: `${guide.title} | ${SITE_NAME}`,
    description: guide.summary,
    path: `/guides/${guide.slug}`,
    openGraphType: "article",
  });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <>
    <div className="bg-gradient-to-b from-warm-100 to-coral-50 border-b border-sage-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <nav className="text-sm text-foreground/60 mb-5">
          <Link href="/guides" className="hover:text-coral-600">
            Guides
          </Link>
        </nav>
        <h1 className="text-3xl sm:text-5xl leading-tight">{guide.title}</h1>
        <p className="mt-3 text-sm text-foreground/65">
          Dernière vérification : {guide.verifiedOn}
        </p>
      </div>
    </div>
    <article className="max-w-2xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">

      {guide.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="text-2xl">{s.heading}</h2>
          {s.paragraphs?.map((p) => (
            <p key={p} className="mt-3 leading-relaxed text-foreground/85">
              {p}
            </p>
          ))}
          {s.items && (
            <ul className="mt-3 space-y-2 list-disc pl-5 marker:text-coral-500 leading-relaxed text-foreground/85">
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <aside className="mt-12 rounded-3xl bg-sun-100 px-6 py-5">
        <h2 className="text-lg">Les limites de ce guide</h2>
        <p className="mt-2 text-foreground/80">{guide.limits}</p>
      </aside>

      <section className="mt-10">
        <h2 className="text-lg">Sources</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {guide.sources.map((src) => (
            <li key={src.url}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
              >
                {src.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-sage-200 pt-6">
        <h2 className="text-lg">Autres guides</h2>
        <ul className="mt-2 space-y-1">
          {others.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="text-teal-600 hover:underline"
              >
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
    </>
  );
}
