import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Literata } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import Header from "./components/Header";
import Logo from "./components/Logo";
import {
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "./lib/seo";
import { CONTACT_EMAIL } from "./lib/site-config";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  verification: {
    google: "YUT4WJQKXjn4mD_-boD6O8SlrwGDjm9y0jE8d4vyu0g",
  },
  keywords: [
    "maison de retraite",
    "EHPAD",
    "comparateur",
    "évaluation HAS",
    "France",
    "retirement home",
    "compare",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: HOME_TITLE,
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
};

function Footer() {
  return (
    <footer className="border-t border-sage-200 bg-sage-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-foreground/70 leading-relaxed max-w-xs">
              Un annuaire des EHPAD de France qui rassemble trois bases
              publiques : l&apos;annuaire FINESS, les évaluations de la HAS et
              les tarifs de la CNSA.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2 text-foreground/80">
              Pages
            </h3>
            <ul className="text-sm text-foreground/70">
              {[
                ["/search", "Rechercher un EHPAD"],
                ["/ehpad", "EHPAD par département"],
                ["/comparer", "Comparer des EHPAD"],
                ["/guides", "Guides pour les familles"],
                ["/about", "À propos"],
                ...(CONTACT_EMAIL ? [["/contact", "Contact"]] : []),
                ["/mentions-legales", "Mentions légales"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-teal-600 transition-colors inline-flex items-center min-h-[44px]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2 text-foreground/80">
              Sources
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Les évaluations viennent de la Haute Autorité de santé, les
              tarifs de la CNSA. Pour décider, appuyez-vous aussi sur une
              visite et sur le rapport d&apos;évaluation complet.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-sage-200 text-xs text-foreground/60">
          © {new Date().getFullYear()} {SITE_NAME}. Site indépendant, sans
          publicité.
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${atkinson.variable} ${literata.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
