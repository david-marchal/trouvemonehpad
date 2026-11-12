import type { EhpadDetail } from "./ehpad";
import { aideSociale } from "./aide-sociale";

function formatAge(from: Date, now: Date) {
  const months =
    (now.getFullYear() - from.getFullYear()) * 12 +
    (now.getMonth() - from.getMonth());
  if (months < 1) return "moins d'un mois";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} an${y > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} mois`);
  return parts.join(" et ");
}

const euro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);

/** Phrases en langage clair, construites uniquement à partir des données présentes. */
export function plainSummary(e: EhpadDetail, now = new Date()): string[] {
  const out: string[] = [];

  const place = e.city ? ` à ${e.city}` : "";
  out.push(
    e.capacity_total
      ? `Cet EHPAD${place} compte ${e.capacity_total} places.`
      : `Cet établissement${place} n'indique pas sa capacité.`
  );

  if (e.has_quality_grade) {
    const score =
      e.has_score_100 != null
        ? ` (${e.has_score_100.toFixed(1).replace(".", ",")} sur 100)`
        : "";
    let s = `La HAS lui attribue la note ${e.has_quality_grade}${score}, sur une échelle de A à D.`;
    if (e.has_eval_date) {
      const d = new Date(e.has_eval_date);
      if (!Number.isNaN(d.getTime())) {
        s += ` L'évaluation date de ${formatAge(d, now)}.`;
      }
    }
    out.push(s);
  } else {
    out.push("La HAS n'a pas publié d'évaluation pour cet établissement.");
  }

  const heb = e.accommodation_price_single;
  if (heb != null) {
    out.push(
      `Une chambre seule coûte ${euro(heb)} € par jour, soit environ ${euro(heb * 30)} € par mois, avant le tarif de dépendance et les aides.`
    );
  } else {
    out.push("Le prix de la chambre n'est pas publié dans nos sources.");
  }

  const as = aideSociale(e.mft_code);
  if (as === "oui") {
    out.push(
      "Il est habilité à l'aide sociale : une personne aux revenus modestes peut y demander l'aide sociale à l'hébergement. Le nombre de places concernées n'est pas public, demandez-le à l'établissement."
    );
  } else if (as === "non") {
    out.push(
      "Il n'est pas habilité à l'aide sociale : l'aide sociale à l'hébergement n'y est en général pas accordée. Renseignez-vous auprès du conseil départemental avant de signer."
    );
  }

  return out;
}
