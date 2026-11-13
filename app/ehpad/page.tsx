import type { Metadata } from "next";
import Link from "next/link";
import { departmentSlug, getDepartmentList } from "@/app/lib/directory";
import { formatNumber } from "@/app/lib/site-stats";
import { SITE_NAME, buildPageMetadata } from "@/app/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = buildPageMetadata({
  title: `EHPAD par département : annuaire, tarifs et évaluations | ${SITE_NAME}`,
  description:
    "Parcourez les EHPAD de France département par département : nombre d'établissements, tarifs d'hébergement et évaluations de la Haute Autorité de santé.",
  path: "/ehpad",
});

export default async function DirectoryPage() {
  let departments: Awaited<ReturnType<typeof getDepartmentList>> = [];
  try {
    departments = await getDepartmentList();
  } catch {
    departments = [];
  }

  return (
    <>
      <section className="bg-gradient-to-b from-warm-100 to-coral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl sm:text-4xl">Les EHPAD par département</h1>
          <p className="mt-3 max-w-prose text-foreground/75">
            Choisissez un département pour voir les villes et les établissements,
            avec leur tarif et leur évaluation officielle.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {departments.length === 0 ? (
          <p className="text-foreground/70">
            L&apos;annuaire n&apos;est pas disponible pour le moment.{" "}
            <Link href="/search" className="text-teal-600 underline underline-offset-2">
              Utilisez la recherche
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <li key={department.department_code}>
                <Link
                  href={`/ehpad/${departmentSlug(department.department_code, department.department_name)}`}
                  className="flex min-h-[44px] items-center justify-between gap-3 rounded-2xl border border-sage-200 bg-white px-4 py-3 text-sm transition-colors hover:border-coral-500"
                >
                  <span className="font-medium text-foreground">
                    {department.department_name ?? "Département"}{" "}
                    <span className="text-foreground/50">({department.department_code})</span>
                  </span>
                  <span className="text-foreground/55">{formatNumber(department.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
