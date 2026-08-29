'use client';

/**
 * FloatingBee — Nahla brand identity mascot
 * A small, elegant bee that gently flies across the page in the background.
 * Completely cosmetic — no interaction, no impact on layout.
 */
export default function FloatingBee() {
  return (
    <div
      className="pointer-events-none absolute top-6 right-8 z-0 opacity-0 sm:opacity-100"
      aria-hidden="true"
    >
      <div className="animate-bee-flight">
        {/* Bee SVG — minimalist, elegant */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Left wing */}
          <ellipse
            cx="10"
            cy="11"
            rx="7"
            ry="4"
            fill="rgba(186, 230, 253, 0.75)"
            stroke="rgba(186, 230, 253, 0.9)"
            strokeWidth="0.5"
            className="animate-bee-wings"
            style={{ transformOrigin: '16px 16px' }}
          />
          {/* Right wing */}
          <ellipse
            cx="22"
            cy="11"
            rx="7"
            ry="4"
            fill="rgba(186, 230, 253, 0.75)"
            stroke="rgba(186, 230, 253, 0.9)"
            strokeWidth="0.5"
            className="animate-bee-wings"
            style={{ transformOrigin: '16px 16px' }}
          />
          {/* Body */}
          <ellipse cx="16" cy="19" rx="5" ry="7" fill="#F59E0B" />
          {/* Stripes */}
          <rect x="11.5" y="16" width="9" height="2" rx="1" fill="#1e293b" opacity="0.7" />
          <rect x="11.5" y="20" width="9" height="2" rx="1" fill="#1e293b" opacity="0.7" />
          {/* Head */}
          <circle cx="16" cy="11.5" r="3.5" fill="#F59E0B" />
          {/* Eyes */}
          <circle cx="14.5" cy="11" r="0.9" fill="#0f172a" />
          <circle cx="17.5" cy="11" r="0.9" fill="#0f172a" />
          {/* Stinger */}
          <path d="M16 26 L15 29 L16 28 L17 29 Z" fill="#92400e" />
          {/* Antennae */}
          <line x1="14" y1="8.5" x2="12" y2="5" stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="18" y1="8.5" x2="20" y2="5" stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="12" cy="4.5" r="1" fill="#f59e0b" />
          <circle cx="20" cy="4.5" r="1" fill="#f59e0b" />
        </svg>
      </div>

      {/* Subtle honey drip trail */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-30"
        style={{ animation: 'beeFlight 18s ease-in-out infinite', animationDelay: '0.5s' }}
      >
        <div className="h-1 w-1 rounded-full bg-amber-400" />
      </div>
    </div>
  );
}
