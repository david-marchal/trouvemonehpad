import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import Header from "./components/Header";
import {
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "./lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏡</span>
              <div className="flex flex-col">
                <span className="font-bold text-teal-700 leading-none">
                  {SITE_NAME}
                </span>
                <span className="mt-1 text-xs sm:text-sm text-foreground/50 leading-relaxed">
                  {SITE_TAGLINE}
                </span>
              </div>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Comparez les maisons de retraite en France grâce aux données
              publiques officielles.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground/80">
              Navigation
            </h3>
            <ul className="space-y-1 text-sm text-foreground/60">
              <li>
                <Link href="/" className="hover:text-teal-600 transition-colors inline-flex items-center min-h-[44px]">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="hover:text-teal-600 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Rechercher
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-teal-600 transition-colors inline-flex items-center min-h-[44px]"
                >
                  À propos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground/80">
              Données
            </h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Les évaluations proviennent de la Haute Autorité de Santé (HAS),
              organisme public indépendant.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-sage-200 text-center text-xs text-foreground/40">
          © {new Date().getFullYear()} {SITE_NAME}. Données publiques — HAS.
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
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
