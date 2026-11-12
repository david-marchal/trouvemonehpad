export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 2C9.4 2 4 7.3 4 13.8 4 22 16 30 16 30s12-8 12-16.2C28 7.3 22.6 2 16 2Z"
        fill="currentColor"
      />
      <path
        d="M11.5 20v-5.2a4.5 4.5 0 0 1 9 0V20Z"
        fill="var(--color-background)"
      />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-teal-700">
      <LogoMark />
      <span className="font-serif text-xl font-semibold tracking-tight">
        TrouveMonEHPAD
      </span>
    </span>
  );
}
