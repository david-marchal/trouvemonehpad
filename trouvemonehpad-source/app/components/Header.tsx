"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/search", label: "Rechercher" },
  { href: "/about", label: "À propos" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl" role="img" aria-label="maison de retraite">
            🏡
          </span>
          <span className="text-xl font-bold text-teal-700 group-hover:text-teal-600 transition-colors">
            TrouveMonEHPAD
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 hover:text-teal-600 transition-colors inline-flex items-center min-h-[44px]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger button */}
        <button
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-sage-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <div className="relative w-6 h-5 flex flex-col justify-between">
            <span
              className={`block h-0.5 w-6 bg-foreground/70 rounded-full transition-all duration-300 origin-center ${
                menuOpen ? "translate-y-[9px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground/70 rounded-full transition-all duration-300 ${
                menuOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground/70 rounded-full transition-all duration-300 origin-center ${
                menuOpen ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-64 border-t border-sage-200" : "max-h-0"
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-white">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-base font-medium text-foreground/70 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors min-h-[44px] flex items-center"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
