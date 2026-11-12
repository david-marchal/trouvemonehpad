// Habilitation à l'aide sociale, d'après le « mode de fixation des tarifs » (MFT)
// de l'annuaire FINESS. Le code est stocké dans ehpad_establishments.mft_code.
// FINESS ne donne pas le nombre de places concernées, seulement l'habilitation.
const HABILITE = new Set(["40", "41", "44", "45", "50", "56"]);
const NON_HABILITE = new Set(["42", "43", "46", "47", "51", "55"]);

export type AideSociale = "oui" | "non" | "inconnu";

export function aideSociale(code: string | null | undefined): AideSociale {
  if (!code) return "inconnu";
  if (HABILITE.has(code)) return "oui";
  if (NON_HABILITE.has(code)) return "non";
  return "inconnu";
}

export const AIDE_SOCIALE_LABEL: Record<AideSociale, string> = {
  oui: "Habilité à l'aide sociale",
  non: "Non habilité à l'aide sociale",
  inconnu: "Aide sociale : non précisé",
};
