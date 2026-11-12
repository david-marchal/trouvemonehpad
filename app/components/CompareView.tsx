"use client";

import Link from "next/link";
import { useState } from "react";
import type { EhpadDetail } from "../lib/ehpad";
import { GIR_OPTIONS, estimateMonthly, euros, type GirGroup } from "../lib/cost";
import CompareAdd from "./CompareAdd";

function href(ids: string[]) {
  return ids.length ? `/comparer?ids=${ids.join(",")}` : "/comparer";
}

export default function CompareView({ ehpads }: { ehpads: EhpadDetail[] }) {
  const [gir, setGir] = useState<GirGroup>("34");
  const ids = ehpads.map((e) => e.finess_geo);

  const rows: { label: string; cell: (e: EhpadDetail) => React.ReactNode }[] = [
    {
      label: "Lieu",
      cell: (e) =>
        [e.city, e.department_name].filter(Boolean).join(", ") || "Non renseigné",
    },
    {
      label: "Note HAS",
      cell: (e) =>
        e.has_quality_grade ? (
          <span>
            <span className="font-serif text-2xl font-semibold text-teal-700">
              {e.has_quality_grade}
            </span>
            {e.has_score_100 != null && (
              <span className="text-foreground/70">
                {" "}
                {e.has_score_100.toFixed(1).replace(".", ",")} / 100
              </span>
            )}
          </span>
        ) : (
          "Non publiée"
        ),
    },
    {
      label: "Date de l'évaluation",
      cell: (e) =>
        e.has_eval_date
          ? new Date(e.has_eval_date).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })
          : "Non renseignée",
    },
    {
      label: "Places",
      cell: (e) => e.capacity_total ?? "Non renseigné",
    },
    {
      label: "Chambre seule, par jour",
      cell: (e) =>
        e.accommodation_price_single != null
          ? `${e.accommodation_price_single.toFixed(2).replace(".", ",")} €`
          : "Non publié",
    },
    {
      label: "Coût mensuel estimé",
      cell: (e) => {
        const est = estimateMonthly(e, gir);
        if (!est) return "Non calculable";
        return est.apaPossible && est.avecApa != null
          ? `${euros(est.avecApa)} à ${euros(est.sansApa)}`
          : euros(est.sansApa);
      },
    },
  ];

  return (
    <div className="mt-8">
      {ehpads.length > 0 && (
        <>
          <fieldset className="mb-5">
            <legend className="text-sm font-semibold mb-2">
              Niveau d&apos;autonomie pour le coût estimé
            </legend>
            <div className="inline-flex rounded-lg border border-sage-200 bg-white p-1 gap-1">
              {GIR_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setGir(o.value)}
                  aria-pressed={gir === o.value}
                  className={`rounded-md px-4 py-2 text-sm min-h-[44px] transition-colors ${
                    gir === o.value
                      ? "bg-teal-600 text-white"
                      : "hover:bg-sage-100"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="overflow-x-auto rounded-xl border border-sage-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">
                Comparaison des établissements sélectionnés
              </caption>
              <thead>
                <tr className="border-b border-sage-200 align-bottom">
                  <td className="p-4 w-40" />
                  {ehpads.map((e) => (
                    <th key={e.finess_geo} scope="col" className="p-4 align-top">
                      <Link
                        href={`/etablissement/${e.finess_geo}`}
                        className="font-semibold text-base text-teal-700 hover:underline"
                      >
                        {e.name}
                      </Link>
                      <div className="mt-2">
                        <Link
                          href={href(ids.filter((i) => i !== e.finess_geo))}
                          className="text-xs font-normal text-foreground/60 underline underline-offset-2 hover:text-rose-500"
                        >
                          Retirer
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-sage-100 last:border-0">
                    <th scope="row" className="p-4 font-medium text-foreground/70">
                      {r.label}
                    </th>
                    {ehpads.map((e) => (
                      <td key={e.finess_geo} className="p-4 align-top">
                        {r.cell(e)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-foreground/65 max-w-2xl">
            Coût estimé en chambre seule, mois de 30 jours. Pour un GIR 1 à 4,
            le bas de la fourchette suppose que l&apos;APA couvre la dépendance
            hors ticket modérateur. Les revenus, l&apos;aide au logement et la
            réduction d&apos;impôt ne sont pas pris en compte.
          </p>
        </>
      )}

      <CompareAdd ids={ids} />
    </div>
  );
}
