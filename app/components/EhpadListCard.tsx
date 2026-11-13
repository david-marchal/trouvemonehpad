import Link from "next/link";
import type { CityEhpad } from "@/app/lib/directory";
import { DAYS_PER_MONTH, euros } from "@/app/lib/cost";

export default function EhpadListCard({ ehpad }: { ehpad: CityEhpad }) {
  const hasAlzheimer =
    !!(ehpad.alzheimer_places && ehpad.alzheimer_places > 0) ||
    ehpad.has_pasa ||
    ehpad.has_uhr;

  return (
    <li>
      <Link
        href={`/etablissement/${ehpad.finess_geo}`}
        className="group flex min-h-[44px] items-start gap-4 rounded-3xl border border-sage-200 bg-white p-5 transition-shadow hover:shadow-[0_8px_30px_rgba(23,40,43,0.12)]"
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-coral-600">
            {ehpad.name}
          </h3>
          <p className="mt-1 text-sm text-foreground/60">
            {[ehpad.address_line, [ehpad.postal_code, ehpad.city].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(", ")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {ehpad.capacity_total ? (
              <span className="rounded-full bg-sage-50 px-2.5 py-1 text-foreground/65">
                {ehpad.capacity_total} places
              </span>
            ) : null}
            {hasAlzheimer ? (
              <span className="rounded-full bg-coral-50 px-2.5 py-1 font-medium text-coral-700">
                Unité Alzheimer
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-foreground/70">
            {ehpad.accommodation_price_single != null ? (
              <>
                <span className="font-semibold text-warm-700">
                  {euros(ehpad.accommodation_price_single * DAYS_PER_MONTH)}
                </span>{" "}
                <span className="text-xs text-foreground/55">/ mois</span>
              </>
            ) : (
              <span className="text-xs text-foreground/55">Tarif non publié</span>
            )}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          {ehpad.has_quality_grade ? (
            <>
              <p className="font-serif text-3xl font-semibold leading-none text-teal-700">
                {ehpad.has_quality_grade}
              </p>
              <p className="mt-1 text-xs text-foreground/55">évaluation HAS</p>
            </>
          ) : (
            <p className="text-xs text-foreground/55">Pas d&apos;évaluation HAS</p>
          )}
        </div>
      </Link>
    </li>
  );
}
