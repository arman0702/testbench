import * as React from "react";

/**
 * Оригинальный абстрактный значок в духе "маски героя":
 * скошенные глаза-прорези на геометричном щите. Не воспроизводит
 * дизайн какого-либо конкретного персонажа — сделан с нуля.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ntsqa-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--accent-2, var(--primary))" />
        </linearGradient>
      </defs>
      {/* щит-маска */}
      <path
        d="M20 2.5 C29 2.5 36.5 6 36.5 6 C36.5 20 33 32 20 37.5 C7 32 3.5 20 3.5 6 C3.5 6 11 2.5 20 2.5 Z"
        fill="url(#ntsqa-grad)"
      />
      {/* тонкая паутинная сетка фоном (генерик-паттерн, не логотип персонажа) */}
      <g stroke="rgba(255,255,255,0.16)" strokeWidth="0.6">
        <path d="M20 6 L20 34" />
        <path d="M9 11 L31 29" />
        <path d="M31 11 L9 29" />
        <path d="M6.5 19 C12 15 28 15 33.5 19" fill="none" />
        <path d="M6.5 24 C12 22 28 22 33.5 24" fill="none" />
      </g>
      {/* глаза-прорези */}
      <path
        d="M9.5 16.5 C13 14 16.5 14 18.5 16.2 C16.5 18.4 12.5 19 9.5 16.5 Z"
        fill="var(--background)"
      />
      <path
        d="M30.5 16.5 C27 14 23.5 14 21.5 16.2 C23.5 18.4 27.5 19 30.5 16.5 Z"
        fill="var(--background)"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <div className="leading-none">
        <div className="text-[15px] font-bold tracking-tight text-foreground">
          NTS <span className="text-primary">QA</span>
        </div>
        <div className="text-[10px] font-medium tracking-wide text-muted-foreground">
          TESTBENCH
        </div>
      </div>
    </div>
  );
}
