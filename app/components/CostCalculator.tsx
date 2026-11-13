"use client";

import { useId, useState } from "react";
import {
  GIR_OPTIONS,
  estimateMonthly,
  euros,
  monthlyAfterTaxReduction,
  type GirGroup,
} from "../lib/cost";
import type { AideSociale } from "../lib/aide-sociale";

type Pricing = Parameters<typeof estimateMonthly>[0];

export default function CostCalculator({
  pricing,
  aideSociale = "inconnu",
}: {
  pricing: Pricing;
  aideSociale?: AideSociale;
}) {
  const [gir, setGir] = useState<GirGroup>("34");
  const [incomeText, setIncomeText] = useState("");
  const name = useId();
  const incomeId = useId();
  const est = estimateMonthly(pricing, gir);

  const income = Number.parseFloat(incomeText.replace(",", "."));
  const hasIncome = Number.isFinite(income) && income > 0;

  const low = est && est.apaPossible && est.avecApa != null ? est.avecApa : null;
  const high = est ? est.sansApa : null;

  return (
    <section className="bg-white rounded-3xl border border-sage-200 p-6">
      <h2 className="text-xl">Estimer ce qu&apos;il reste à payer</h2>
      <p className="mt-1 text-sm text-foreground/70">
        Chambre seule, mois de 30 jours. Choisissez le niveau de dépendance
        de votre proche (son groupe GIR est indiqué dessous).
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

      {est && high != null ? (
        <div className="mt-5" aria-live="polite">
          <p className="text-sm text-foreground/70">Vous paierez environ</p>
          <p className="font-serif text-3xl font-semibold text-teal-700 mt-0.5">
            {low != null ? `${euros(low)} à ${euros(high)}` : euros(high)}
            <span className="text-base font-normal text-foreground/60">
              {" "}
              par mois
            </span>
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-sage-50 rounded-2xl p-3">
              <dt className="text-foreground/65">Hébergement</dt>
              <dd className="font-semibold mt-0.5">{euros(est.hebergement)}</dd>
            </div>
            <div className="bg-sage-50 rounded-2xl p-3">
              <dt className="text-foreground/65">Dépendance, sans aide</dt>
              <dd className="font-semibold mt-0.5">
                {euros(est.dependanceTotale)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-foreground/70 leading-relaxed">
            {est.apaPossible
              ? "Le bas de la fourchette suppose que l'APA couvre la dépendance, sauf le ticket modérateur (tarif GIR 5-6). Le haut ne compte aucune aide. Votre montant réel dépend de vos revenus et de votre département."
              : "Pour les GIR 5 et 6, la dépendance reste à la charge du résident : l'APA ne s'applique pas."}
          </p>

          <div className="mt-5 rounded-2xl bg-sun-100/50 p-4">
            <h3 className="text-base font-semibold">Et avec la réduction d&apos;impôt ?</h3>
            <p className="mt-1 font-serif text-2xl font-semibold text-sun-700">
              {low != null
                ? `${euros(monthlyAfterTaxReduction(low))} à ${euros(monthlyAfterTaxReduction(high))}`
                : euros(monthlyAfterTaxReduction(high))}
              <span className="text-base font-normal text-foreground/60">
                {" "}
                par mois
              </span>
            </p>
            <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
              L&apos;État vous rend une partie de ce que vous payez à l&apos;EHPAD :
              <strong> jusqu&apos;à 2 500 € par an</strong>, soit environ 208 € par
              mois. Cette somme est déduite de votre impôt sur le revenu, l&apos;année
              suivante, quand vous remplissez votre déclaration.
            </p>
            <p className="mt-2 text-sm text-foreground/75 leading-relaxed">
              Elle dépend de la situation fiscale de celui qui paie : pour savoir ce
              que vous pouvez en attendre, consultez impots.gouv.fr.
            </p>
          </div>

          <div className="mt-5">
            <label htmlFor={incomeId} className="block text-sm font-medium">
              Revenus mensuels de votre proche (facultatif)
            </label>
            <p className="text-xs text-foreground/60">
              Retraites et pensions. Ce chiffre reste dans votre navigateur.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                id={incomeId}
                inputMode="decimal"
                value={incomeText}
                onChange={(e) => setIncomeText(e.target.value)}
                placeholder="1 800"
                className="min-h-[44px] w-40 rounded-full border border-sage-200 px-4 text-base focus:border-coral-500 focus:outline-none"
              />
              <span className="text-sm text-foreground/60">€ par mois</span>
            </div>
            {hasIncome ? (
              <p className="mt-3 text-sm leading-relaxed text-foreground/80" aria-live="polite">
                {(() => {
                  const shortHigh = Math.max(0, high - income);
                  const shortLow = low != null ? Math.max(0, low - income) : shortHigh;
                  if (shortHigh === 0) {
                    return "Ces revenus couvrent le coût estimé, même sans aucune aide.";
                  }
                  if (shortLow === 0) {
                    return `Ces revenus couvrent le coût si l'APA est accordée. Sans aide, il manquerait environ ${euros(shortHigh)} par mois.`;
                  }
                  return shortLow === shortHigh
                    ? `Il manquerait environ ${euros(shortHigh)} par mois.`
                    : `Il manquerait entre ${euros(shortLow)} et ${euros(shortHigh)} par mois, avant la réduction d'impôt.`;
                })()}
              </p>
            ) : null}
          </div>

          {aideSociale === "oui" ? (
            <p className="mt-5 text-sm leading-relaxed text-foreground/80">
              <strong>Si les revenus ne suffisent pas :</strong> cet établissement
              est habilité à l&apos;aide sociale. Le département peut prendre en
              charge une partie des frais. Les enfants peuvent alors être sollicités
              (obligation alimentaire), et le département peut récupérer les sommes
              avancées sur la succession. Renseignez-vous auprès du CCAS de la
              commune ou du conseil départemental.
            </p>
          ) : null}
          {aideSociale === "non" ? (
            <p className="mt-5 text-sm leading-relaxed text-foreground/80">
              Cet établissement n&apos;est pas habilité à l&apos;aide sociale : si les
              ressources s&apos;épuisent, un transfert vers un autre établissement peut
              être nécessaire. Posez la question avant de signer.
            </p>
          ) : null}
          <p className="mt-4 text-xs text-foreground/55">
            Estimation indicative. Les aides au logement ne sont pas déduites.
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
