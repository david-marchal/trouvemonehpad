"use client";

import Link from "next/link";
import { useState } from "react";

type Hit = {
  finess_geo: string;
  name: string;
  city: string | null;
  has_quality_grade: string | null;
};

export default function CompareAdd({ ids }: { ids: string[] }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const full = ids.length >= 3;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/ehpads?q=${encodeURIComponent(term)}&radius=0`
      );
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Hit[];
      setHits(data.filter((h) => !ids.includes(h.finess_geo)).slice(0, 8));
    } catch {
      setError(true);
      setHits(null);
    } finally {
      setLoading(false);
    }
  }

  if (full) {
    return (
      <p className="mt-8 text-sm text-foreground/70">
        Vous comparez déjà trois établissements. Retirez-en un pour en ajouter
        un autre.
      </p>
    );
  }

  return (
    <section className="mt-10 max-w-xl">
      <h2 className="text-xl">
        {ids.length === 0 ? "Choisissez un premier établissement" : "Ajouter un établissement"}
      </h2>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <label className="sr-only" htmlFor="compare-q">
          Nom ou ville
        </label>
        <input
          id="compare-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nom de l'établissement ou ville"
          className="flex-1 rounded-lg border border-sage-300 bg-white px-4 py-3 min-h-[44px]"
        />
        <button
          type="submit"
          className="rounded-lg bg-teal-600 px-5 py-3 text-white font-medium min-h-[44px] hover:bg-teal-700 transition-colors"
        >
          Chercher
        </button>
      </form>

      <div aria-live="polite">
        {loading && <p className="mt-3 text-sm text-foreground/70">Recherche en cours…</p>}
        {error && (
          <p className="mt-3 text-sm text-rose-500">
            La recherche a échoué. Réessayez dans un instant.
          </p>
        )}
        {hits && hits.length === 0 && (
          <p className="mt-3 text-sm text-foreground/70">
            Aucun établissement trouvé. Essayez le nom d&apos;une ville.
          </p>
        )}
        {hits && hits.length > 0 && (
          <ul className="mt-3 divide-y divide-sage-200 rounded-lg border border-sage-200 bg-white">
            {hits.map((h) => (
              <li key={h.finess_geo} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{h.name}</p>
                  <p className="text-sm text-foreground/65">
                    {h.city}
                    {h.has_quality_grade ? `, note ${h.has_quality_grade}` : ""}
                  </p>
                </div>
                <Link
                  href={`/comparer?ids=${[...ids, h.finess_geo].join(",")}`}
                  className="shrink-0 rounded-md border border-teal-600 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 min-h-[44px] inline-flex items-center"
                >
                  Ajouter
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
