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
