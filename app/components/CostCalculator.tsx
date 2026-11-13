"use client";

import { useId, useState, type ReactNode } from "react";
import {
  GIR_OPTIONS,
  estimateMonthly,
  euros,
  monthlyAfterTaxReduction,
  type GirGroup,
} from "../lib/cost";
import type { AideSociale } from "../lib/aide-sociale";

type Pricing = Parameters<typeof estimateMonthly>[0];

const SUMMARY_CLASS =
  "flex min-h-[44px] cursor-pointer items-center text-sm font-semibold text-teal-700 hover:text-teal-800";

export default function CostCalculator({
  pricing,
  aideSociale = "inconnu",
  children,
}: {
  pricing: Pricing;
  aideSociale?: AideSociale;
  /** Détail des tarifs (par jour), affiché replié sous le calcul. */
  children?: ReactNode;
}) {
  const [gir, setGir] = useState<GirGroup>("34");
  const [incomeText, setIncomeText] = useState("");
  const [housingText, setHousingText] = useState("");
  const name = useId();
  const incomeId = useId();
  const housingId = useId();
  const est = estimateMonthly(pricing, gir);

  const income = Number.parseFloat(incomeText.replace(",", "."));
  const hasIncome = Number.isFinite(income) && income > 0;

  // Aide au logement (APL ou ALS) saisie par l'utilisateur : elle réduit ce qu'il reste à payer.
  const housingParsed = Number.parseFloat(housingText.replace(",", "."));
  const housingAid = Number.isFinite(housingParsed) && housingParsed > 0 ? housingParsed : 0;
  const rawLow = est && est.apaPossible && est.avecApa != null ? est.avecApa : null;
  const rawHigh = est ? est.sansApa : null;
  const low = rawLow != null ? Math.max(0, rawLow - housingAid) : null;
  const high = rawHigh != null ? Math.max(0, rawHigh - housingAid) : null;

  return (
    <section className="rounded-3xl border border-sage-200 bg-white p-6">
      <h2 className="text-xl">Tarif et reste à payer</h2>
      <p className="mt-1 text-sm text-foreground/70">
        Chambre seule, par mois. Quel est le niveau de dépendance de votre proche ?
      </p>

      <fieldset className="mt-3">
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
              <span className="block text-xs text-foreground/60">{o.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {est && high != null ? (
        <div className="mt-5" aria-live="polite">
          <p className="text-sm text-foreground/70">Vous paierez environ</p>
          <p className="mt-0.5 font-serif text-3xl font-semibold text-warm-700">
            {low != null ? `${euros(low)} à ${euros(high)}` : euros(high)}
            <span className="text-base font-normal text-foreground/60"> par mois</span>
          </p>
          <p className="mt-1 text-sm text-foreground/70">
            Après réduction d&apos;impôt :{" "}
            <strong className="text-sun-700">
              {low != null
                ? `${euros(monthlyAfterTaxReduction(low))} à ${euros(monthlyAfterTaxReduction(high))}`
                : euros(monthlyAfterTaxReduction(high))}
            </strong>{" "}
            par mois
          </p>

          <details className="mt-3 border-t border-sage-100">
            <summary className={SUMMARY_CLASS}>Détail, aides et revenus</summary>
            <div className="pb-2">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-sage-50 p-3">
                  <dt className="text-foreground/65">Hébergement</dt>
                  <dd className="mt-0.5 font-semibold">{euros(est.hebergement)}</dd>
                </div>
                <div className="rounded-2xl bg-sage-50 p-3">
                  <dt className="text-foreground/65">Dépendance, sans aide</dt>
                  <dd className="mt-0.5 font-semibold">{euros(est.dependanceTotale)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {est.apaPossible
                  ? "Le bas de la fourchette suppose que l'APA couvre la dépendance, sauf le ticket modérateur (tarif GIR 5-6). Le haut ne compte aucune aide. Votre montant réel dépend de vos revenus et de votre département."
                  : "Pour les GIR 5 et 6, la dépendance reste à la charge du résident : l'APA ne s'applique pas."}
              </p>

              <div className="mt-4 rounded-2xl bg-sun-100/50 p-4">
                <h3 className="text-base font-semibold">La réduction d&apos;impôt</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                  L&apos;État vous rend une partie de ce que vous payez à l&apos;EHPAD :
                  <strong> jusqu&apos;à 2 500 € par an</strong>, soit environ 208 € par
                  mois. Cette somme est déduite de votre impôt sur le revenu, l&apos;année
                  suivante, quand vous remplissez votre déclaration. Elle dépend de la
                  situation fiscale de celui qui paie : consultez impots.gouv.fr.
                </p>
              </div>

              <div className="mt-4">
                <label htmlFor={housingId} className="block text-sm font-medium">
                  Aide au logement versée par la CAF (facultatif)
                </label>
                <p className="text-xs text-foreground/60">
                  APL ou ALS. Le montant dépend des ressources et de l&apos;établissement :
                  seule la CAF peut le calculer (simulateur sur caf.fr).
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id={housingId}
                    inputMode="decimal"
                    value={housingText}
                    onChange={(e) => setHousingText(e.target.value)}
                    placeholder="150"
                    className="min-h-[44px] w-40 rounded-full border border-sage-200 px-4 text-base focus:border-coral-500 focus:outline-none"
                  />
                  <span className="text-sm text-foreground/60">€ par mois</span>
                </div>
                {housingAid > 0 ? (
                  <p className="mt-2 text-sm text-foreground/75">
                    Ce montant est déjà retiré des estimations.
                  </p>
                ) : null}
              </div>

              <div className="mt-4">
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
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                  <strong>Si les revenus ne suffisent pas :</strong> cet établissement
                  est habilité à l&apos;aide sociale. Le département peut prendre en
                  charge une partie des frais. Les enfants peuvent alors être sollicités
                  (obligation alimentaire), et le département peut récupérer les sommes
                  avancées sur la succession. Renseignez-vous auprès du CCAS de la
                  commune ou du conseil départemental.
                </p>
              ) : null}
              {aideSociale === "non" ? (
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                  Cet établissement n&apos;est pas habilité à l&apos;aide sociale : si les
                  ressources s&apos;épuisent, un transfert vers un autre établissement peut
                  être nécessaire. Posez la question avant de signer.
                </p>
              ) : null}
              <p className="mt-4 text-xs text-foreground/55">
                Estimation indicative. Sans montant saisi, les aides au logement ne sont
                pas déduites.
              </p>
            </div>
          </details>
        </div>
      ) : (
        <p className="mt-5 text-sm text-foreground/70">
          Les tarifs nécessaires à ce calcul ne sont pas publiés pour cet
          établissement et ce niveau de dépendance.
        </p>
      )}

      {children ? (
        <details className="mt-1 border-t border-sage-100">
          <summary className={SUMMARY_CLASS}>Tous les tarifs, par jour</summary>
          <div className="pb-2">{children}</div>
        </details>
      ) : null}
    </section>
  );
}
