import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/app/components/PrintButton";
import { getEhpadByFiness } from "@/app/lib/ehpad";
import { getGuide } from "@/app/lib/guides";
import { SITE_NAME } from "@/app/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ehpad = await getEhpadByFiness(id);
  return {
    title: ehpad
      ? `Fiche de visite : ${ehpad.name} | ${SITE_NAME}`
      : `Fiche de visite | ${SITE_NAME}`,
    // Page à imprimer : inutile de la faire référencer.
    robots: { index: false, follow: true },
  };
}

export default async function VisitSheetPage({ params }: Props) {
  const { id } = await params;
  const ehpad = await getEhpadByFiness(id);
  if (!ehpad) notFound();

  const guide = getGuide("questions-a-poser-lors-d-une-visite");
  if (!guide) notFound();

  const address = [ehpad.address_line, [ehpad.postal_code, ehpad.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="no-print mb-6">
        <Link
          href={`/etablissement/${ehpad.finess_geo}`}
          className="text-sm text-teal-600 underline underline-offset-2 hover:text-teal-700"
        >
          Retour à la fiche
        </Link>
      </div>

      <header className="mb-6 border-b border-sage-200 pb-5">
        <p className="text-sm text-foreground/60">Fiche de visite</p>
        <h1 className="mt-1 text-3xl">{ehpad.name}</h1>
        {address ? <p className="mt-2 text-foreground/75">{address}</p> : null}
        {ehpad.phone ? (
          <p className="mt-1 text-foreground/75">Téléphone : {ehpad.phone}</p>
        ) : null}
        <p className="mt-4 text-sm text-foreground/70">
          Date de la visite : ____ / ____ / ________ &nbsp;&nbsp; Heure : ____ h ____
          &nbsp;&nbsp; Reçu par : ______________________
        </p>
        <div className="mt-5">
          <PrintButton label="Imprimer cette fiche" />
        </div>
      </header>

      <div className="space-y-6">
        {guide.sections.map((section) => (
          <section key={section.heading} className="break-inside-avoid">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <ul className="mt-2 space-y-3">
              {(section.items ?? []).map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-1 h-4 w-4 flex-shrink-0 rounded border-2 border-foreground/50"
                    aria-hidden="true"
                  />
                  <span className="flex-1">
                    <span className="block leading-snug">{item}</span>
                    <span className="mt-2 block border-b border-dotted border-foreground/30 pb-3" />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="break-inside-avoid">
          <h2 className="text-lg font-semibold">Mes notes</h2>
          <div className="mt-2 space-y-6">
            {[0, 1, 2, 3, 4].map((line) => (
              <div key={line} className="border-b border-dotted border-foreground/30" />
            ))}
          </div>
        </section>
      </div>

      <p className="mt-8 text-xs text-foreground/55">
        {guide.limits} Fiche générée par {SITE_NAME}.
      </p>
    </div>
  );
}
