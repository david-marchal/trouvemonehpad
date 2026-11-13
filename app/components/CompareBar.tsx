"use client";

import Link from "next/link";
import { MAX_COMPARE, useCompareSelection } from "../lib/compare-selection";

/** Barre fixe en bas de l'écran : visible dès qu'un établissement est sélectionné. */
export default function CompareBar() {
  const { ids, clear } = useCompareSelection();
  if (ids.length === 0) return null;

  const ready = ids.length >= 2;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1100] p-3 sm:p-4">
      <div
        role="region"
        aria-label="Établissements à comparer"
        className="pointer-events-auto mx-auto flex max-w-xl flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-3xl bg-foreground px-5 py-3 text-white shadow-[0_8px_30px_rgba(23,40,43,0.35)]"
      >
        <p className="text-sm" aria-live="polite">
          <strong>{ids.length}</strong> sélectionné{ids.length > 1 ? "s" : ""} sur{" "}
          {MAX_COMPARE}
          {!ready ? <span className="text-white/75"> : choisissez-en un autre</span> : null}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="min-h-[44px] cursor-pointer text-sm text-white/80 underline underline-offset-2 hover:text-white"
          >
            Vider
          </button>
          {ready ? (
            <Link
              href={`/comparer?ids=${ids.join(",")}`}
              className="inline-flex min-h-[44px] items-center rounded-full bg-coral-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-700"
            >
              Comparer ({ids.length})
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex min-h-[44px] items-center rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white/60"
            >
              Comparer
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
