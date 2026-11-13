"use client";

import Link from "next/link";
import { useState } from "react";
import type { EhpadDetail } from "../lib/ehpad";
import {
  DAYS_PER_MONTH,
  GIR_OPTIONS,
  estimateMonthly,
  euros,
  monthlyAfterTaxReduction,
  type GirGroup,
} from "../lib/cost";
import CompareAdd from "./CompareAdd";
import { aideSociale } from "../lib/aide-sociale";

const GRADE_TINT: Record<string, string> = {
  A: "bg-teal-100 text-teal-700",
  B: "bg-sky-100 text-sky-700",
  C: "bg-sun-100 text-sun-700",
  D: "bg-coral-100 text-coral-700",
};

function href(ids: string[]) {
  return ids.length ? `/comparer?ids=${ids.join(",")}` : "/comparer";
}

type Row = {
  label: string;
  hint?: string;
  /** « price » : ligne de tarif, mise en avant. « total » : ligne du coût estimé, la plus visible. */
  emphasis?: "price" | "total";
  cell: (e: EhpadDetail) => React.ReactNode;
};

export default function CompareView({ ehpads }: { ehpads: EhpadDetail[] }) {
  const [gir, setGir] = useState<GirGroup>("34");
  const ids = ehpads.map((e) => e.finess_geo);
  const girLabel = GIR_OPTIONS.find((o) => o.value === gir)?.label.toLowerCase() ?? "";

  const rows: Row[] = [
    {
      label: "Hébergement, par mois",
      hint: "Chambre seule",
      emphasis: "price",
      cell: (e) =>
        e.accommodation_price_single != null ? (
          <span>
            <span className="font-serif text-2xl font-semibold">
              {euros(e.accommodation_price_single * DAYS_PER_MONTH)}
            </span>
            <span className="block text-xs font-normal text-foreground/60">
              {e.accommodation_price_single.toFixed(2).replace(".", ",")} € par jour
            </span>
          </span>
        ) : (
          <span className="font-normal text-foreground/65">Non publié</span>
        ),
    },
    {
      label: "Dépendance, par mois",
      hint: `Sans aide, ${girLabel}`,
      emphasis: "price",
      cell: (e) => {
        const est = estimateMonthly(e, gir);
        return est ? (
          <span className="font-serif text-xl font-semibold">
            {euros(est.dependanceTotale)}
          </span>
        ) : (
          <span className="font-normal text-foreground/65">Non publié</span>
        );
      },
    },
    {
      label: "Vous paierez environ",
      hint: "Par mois, avec ou sans l'APA",
      emphasis: "total",
      cell: (e) => {
        const est = estimateMonthly(e, gir);
        if (!est) return <span className="font-normal">Non calculable</span>;
        return (
          <span className="font-serif text-2xl font-semibold">
            {est.apaPossible && est.avecApa != null
              ? `${euros(est.avecApa)} à ${euros(est.sansApa)}`
              : euros(est.sansApa)}
          </span>
        );
      },
    },
    {
      label: "Après réduction d'impôt",
      hint: "Par mois, en moyenne",
      emphasis: "total",
      cell: (e) => {
        const est = estimateMonthly(e, gir);
        if (!est) return <span className="font-normal">Non calculable</span>;
        return (
          <span className="text-base font-semibold">
            {est.apaPossible && est.avecApa != null
              ? `${euros(monthlyAfterTaxReduction(est.avecApa))} à ${euros(monthlyAfterTaxReduction(est.sansApa))}`
              : euros(monthlyAfterTaxReduction(est.sansApa))}
          </span>
        );
      },
    },
    {
      label: "Note HAS",
      cell: (e) =>
        e.has_quality_grade ? (
          <span>
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl font-serif text-2xl font-semibold ${GRADE_TINT[e.has_quality_grade] ?? "bg-sage-100 text-foreground/70"}`}
            >
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
      label: "Unité Alzheimer",
      cell: (e) => {
        const parts: string[] = [];
        if (e.alzheimer_places) parts.push(`${e.alzheimer_places} places`);
        if (e.has_pasa) parts.push("PASA");
        if (e.has_uhr) parts.push("UHR");
        return parts.length ? parts.join(", ") : "Aucune déclarée";
      },
    },
    {
      label: "Aide sociale",
      cell: (e) => {
        const a = aideSociale(e.mft_code);
        return a === "oui" ? "Habilité" : a === "non" ? "Non habilité" : "Non précisé";
      },
    },
    {
      label: "Places",
      cell: (e) => e.capacity_total ?? "Non renseigné",
    },
    {
      label: "Lieu",
      cell: (e) =>
        [e.city, e.department_name].filter(Boolean).join(", ") || "Non renseigné",
    },
  ];

  const rowTint = (r: Row) =>
    r.emphasis === "total"
      ? "bg-warm-100 text-warm-700"
      : r.emphasis === "price"
        ? "bg-warm-100/50 text-warm-700"
        : "bg-white";

  return (
    <div className="mt-8">
      {ehpads.length > 0 && (
        <>
          <fieldset className="mb-5">
            <legend className="text-sm font-semibold mb-2">
              Niveau de dépendance de votre proche
            </legend>
            <div className="inline-flex flex-wrap rounded-3xl sm:rounded-full border border-sage-200 bg-white p-1 gap-1">
              {GIR_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setGir(o.value)}
                  aria-pressed={gir === o.value}
                  className={`rounded-full px-4 py-2 text-sm min-h-[44px] cursor-pointer transition-colors ${
                    gir === o.value
                      ? "bg-coral-600 text-white font-semibold"
                      : "hover:bg-sage-100"
                  }`}
                >
                  {o.label}
                  <span className="ml-1.5 text-xs opacity-75">{o.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="overflow-x-auto rounded-3xl border border-sage-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">
                Comparaison des établissements sélectionnés
              </caption>
              <thead>
                <tr className="border-b border-sage-200 align-bottom bg-warm-50">
                  <td className="sticky left-0 z-10 w-40 bg-warm-50 p-4" />
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
                          className="text-xs font-normal text-foreground/60 underline underline-offset-2 hover:text-coral-600"
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
                  <tr
                    key={r.label}
                    className={`border-b border-sage-100 last:border-0 ${r.emphasis ? rowTint(r) : ""}`}
                  >
                    <th
                      scope="row"
                      className={`sticky left-0 z-10 p-4 font-medium ${rowTint(r)} ${r.emphasis ? "" : "text-foreground/70"}`}
                    >
                      {r.label}
                      {r.hint ? (
                        <span className="block text-xs font-normal text-foreground/55">
                          {r.hint}
                        </span>
                      ) : null}
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
            Coût estimé en chambre seule, mois de 30 jours. Pour une dépendance forte ou modérée (GIR 1 à 4),
            le bas de la fourchette suppose que l&apos;APA couvre la dépendance
            hors ticket modérateur. Les revenus et l&apos;aide au logement ne sont pas pris en compte ;
            la réduction d&apos;impôt est celle du maximum annuel, répartie sur 12 mois.
          </p>
        </>
      )}

      {ehpads.length === 0 && (
        <div className="max-w-xl rounded-3xl bg-teal-100 p-6 text-teal-700">
          <h2 className="text-xl font-semibold">Le plus simple : partir de la carte</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Lancez une recherche, puis cochez « Comparer » sur les établissements
            qui vous intéressent, directement dans les résultats. Vous pouvez en
            choisir trois.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-coral-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-700"
          >
            Rechercher et choisir
          </Link>
        </div>
      )}

      <CompareAdd ids={ids} />
    </div>
  );
}
