"use client";

export default function PrintButton({ label = "Imprimer" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-full bg-coral-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-700"
    >
      {label}
    </button>
  );
}
