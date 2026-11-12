export type GirGroup = "12" | "34" | "56";

export const GIR_OPTIONS: { value: GirGroup; label: string; hint: string }[] = [
  { value: "12", label: "GIR 1-2", hint: "aide permanente" },
  { value: "34", label: "GIR 3-4", hint: "aide quotidienne" },
  { value: "56", label: "GIR 5-6", hint: "aide ponctuelle" },
];

export const DAYS_PER_MONTH = 30;

type Pricing = {
  accommodation_price_single: number | null;
  dependency_tariff_gir_12: number | null;
  dependency_tariff_gir_34: number | null;
  dependency_tariff_gir_56: number | null;
};

export type MonthlyEstimate = {
  hebergement: number;
  dependanceTotale: number;
  /** Ce que paie la personne si aucune aide ne couvre la dépendance. */
  sansApa: number;
  /** Ce que paie la personne si l'APA couvre tout sauf le ticket modérateur GIR 5-6
   *  (avant participation liée aux revenus). Null si le tarif GIR 5-6 manque. */
  avecApa: number | null;
  apaPossible: boolean;
};

export function estimateMonthly(
  p: Pricing,
  gir: GirGroup
): MonthlyEstimate | null {
  const heb = p.accommodation_price_single;
  const dep =
    gir === "12"
      ? p.dependency_tariff_gir_12
      : gir === "34"
        ? p.dependency_tariff_gir_34
        : p.dependency_tariff_gir_56;
  if (heb == null || dep == null) return null;
  const ticket = p.dependency_tariff_gir_56;
  const apaPossible = gir !== "56";
  return {
    hebergement: heb * DAYS_PER_MONTH,
    dependanceTotale: dep * DAYS_PER_MONTH,
    sansApa: (heb + dep) * DAYS_PER_MONTH,
    avecApa:
      !apaPossible
        ? (heb + dep) * DAYS_PER_MONTH
        : ticket != null
          ? (heb + ticket) * DAYS_PER_MONTH
          : null,
    apaPossible,
  };
}

export function euros(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export const PRICE_RANGES: { value: string; label: string; min: number; max: number }[] = [
  { value: "lt2000", label: "Moins de 2 000 €", min: 0, max: 2000 },
  { value: "2000-2500", label: "2 000 à 2 500 €", min: 2000, max: 2500 },
  { value: "2500-3000", label: "2 500 à 3 000 €", min: 2500, max: 3000 },
  { value: "3000-3500", label: "3 000 à 3 500 €", min: 3000, max: 3500 },
  { value: "gt3500", label: "Plus de 3 500 €", min: 3500, max: Infinity },
];

/** Prix mensuel de la chambre seule (mois de 30 jours) dans la plage choisie ?
 *  Un prix inconnu ne passe jamais le filtre. */
export function priceInRange(dailyPrice: number | null | undefined, rangeValue: string) {
  if (!rangeValue) return true;
  if (dailyPrice == null) return false;
  const range = PRICE_RANGES.find((r) => r.value === rangeValue);
  if (!range) return true;
  const monthly = dailyPrice * DAYS_PER_MONTH;
  return monthly >= range.min && monthly < range.max;
}
