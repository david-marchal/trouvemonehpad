import sql from "./db";

export type SiteStats = {
  total: number;
  evaluated: number;
  updatedAt: Date | null;
};

/** Chiffres réels de la base. Renvoie null si la base est injoignable (le site s'affiche quand même). */
export async function getSiteStats(): Promise<SiteStats | null> {
  try {
    const rows = await sql<
      { total: number; evaluated: number; updated_at: Date | null }[]
    >`
      SELECT
        COUNT(*)::int AS total,
        COUNT(has_quality_grade)::int AS evaluated,
        MAX(updated_at) AS updated_at
      FROM ehpad_establishments
    `;
    const row = rows[0];
    if (!row || !row.total) return null;
    return {
      total: row.total,
      evaluated: row.evaluated,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
  } catch {
    return null;
  }
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatDateFr(d: Date) {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
