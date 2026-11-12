"use client";

import { useId, useState } from "react";
import {
  GIR_OPTIONS,
  estimateMonthly,
  euros,
  type GirGroup,
} from "../lib/cost";

type Pricing = Parameters<typeof estimateMonthly>[0];

export default function CostCalculator({ pricing }: { pricing: Pricing }) {
  const [gir, setGir] = useState<GirGroup>("34");
  const name = useId();
  const est = estimateMonthly(pricing, gir);

  return (
    <section className="bg-white rounded-xl border border-sage-200 p-6">
      <h2 className="text-xl">Estimer le coût mensuel</h2>
      <p className="mt-1 text-sm text-foreground/70">
        Chambre seule, mois de 30 jours. Choisissez le niveau d&apos;autonomie
        de votre proche.
      </p>

      <fieldset className="mt-4">
        <legend className="sr-only">Niveau de dépendance (GIR)</legend>
        <div className="grid grid-cols-3 gap-2">
          {GIR_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal-500 ${
                gir === o.value
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-sage-200 hover:border-teal-300"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={gir === o.value}
                onChange={() => setGir(o.value)}
                className="sr-only"
              />
              <span className="block font-semibold">{o.label}</span>
              <span className="block text-xs text-foreground/60">
                {o.hint}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {est ? (
        <div className="mt-5" aria-live="polite">
          <p className="text-sm text-foreground/70">Vous paierez environ</p>
          <p className="font-serif text-3xl font-semibold text-teal-700 mt-0.5">
            {est.apaPossible && est.avecApa != null
              ? `${euros(est.avecApa)} à ${euros(est.sansApa)}`
              : euros(est.sansApa)}
            <span className="text-base font-normal text-foreground/60">
              {" "}
              par mois
            </span>
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-sage-50 rounded-lg p-3">
              <dt className="text-foreground/65">Hébergement</dt>
              <dd className="font-semibold mt-0.5">{euros(est.hebergement)}</dd>
            </div>
            <div className="bg-sage-50 rounded-lg p-3">
              <dt className="text-foreground/65">Dépendance, sans aide</dt>
              <dd className="font-semibold mt-0.5">
                {euros(est.dependanceTotale)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-foreground/70 leading-relaxed">
            {est.apaPossible
              ? "Le bas de la fourchette suppose que l'APA couvre la dépendance, sauf le ticket modérateur (tarif GIR 5-6). Le haut ne compte aucune aide. Votre montant réel dépend de vos revenus et de votre département."
              : "Pour les GIR 5 et 6, la dépendance reste à la charge du résident : l'APA ne s'applique pas."}{" "}
            Les aides au logement et la réduction d&apos;impôt ne sont pas
            déduites.
          </p>
        </div>
      ) : (
        <p className="mt-5 text-sm text-foreground/70">
          Les tarifs nécessaires à ce calcul ne sont pas publiés pour cet
          établissement et ce niveau de dépendance.
        </p>
      )}
    </section>
  );
}
