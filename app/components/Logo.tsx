/** Maison en contour avec un cœur : symbole du logo. */
export function LogoMark({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.5 15 16 4l12.5 11"
        fill="none"
        stroke="var(--color-coral-600)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 13.5V27h18V13.5"
        fill="none"
        stroke="var(--color-coral-600)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 23.4c-3.6-2.3-4.8-3.9-4.8-5.5a2.6 2.6 0 0 1 4.8-1.3 2.6 2.6 0 0 1 4.8 1.3c0 1.6-1.2 3.2-4.8 5.5Z"
        fill="var(--color-warm-500)"
      />
    </svg>
  );
}

export default function Logo() {
  return (
    <span
      className="inline-flex items-center gap-2.5"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <LogoMark />
      <span className="flex flex-col leading-[0.92]">
        <span className="text-[13px] font-extrabold text-warm-600 sm:text-[15px]">
          TrouveMon
        </span>
        <span className="text-[26px] font-black tracking-tight text-coral-600 sm:text-[30px]">
          EHPAD
        </span>
      </span>
    </span>
  );
}
