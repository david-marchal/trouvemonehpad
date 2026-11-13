"use client";

import { useState } from "react";
import { MAX_COMPARE, useCompareSelection } from "../lib/compare-selection";

/** Bouton de la fiche : ajoute ou retire l'établissement de la comparaison. */
export default function CompareToggle({ id }: { id: string }) {
  const { ids, toggle } = useCompareSelection();
  const [full, setFull] = useState(false);
  const selected = ids.includes(id);

  function onClick() {
    const ok = toggle(id);
    setFull(!ok);
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`block min-h-[44px] w-full cursor-pointer rounded-full px-4 py-3 text-center text-sm font-semibold transition-colors ${
          selected
            ? "bg-white text-coral-700 ring-2 ring-coral-600 hover:bg-coral-50"
            : "bg-coral-600 text-white hover:bg-coral-700"
        }`}
      >
        {selected ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
      </button>
      {full ? (
        <p className="mt-2 text-xs text-foreground/65" role="status">
          {MAX_COMPARE} établissements au maximum : retirez-en un avant d&apos;en ajouter.
        </p>
      ) : null}
    </div>
  );
}
