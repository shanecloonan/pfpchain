"use client";

import Link from "next/link";
import { Literata, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";

const display = Literata({
  subsets: ["latin"],
  variable: "--font-pw-display",
  weight: ["400", "600", "700"],
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-pw-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-pw-mono",
  weight: ["400", "500"],
});

const NAV_ITEMS = [
  { href: "/#privacy", label: "Privacy" },
  { href: "/#permanence", label: "Permanence" },
  { href: "/#consensus", label: "Consensus" },
  { href: "/testnet/explore", label: "Testnet" },
] as const;

export default function HomeShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${display.variable} ${sans.variable} ${mono.variable} pw-home relative min-h-screen overflow-hidden`}
    >
      <style jsx global>{`
        .pw-home {
          --pw-bg: #0a1210;
          --pw-ink: #e8efe6;
          --pw-muted: #9aada3;
          --pw-faint: #6d8076;
          --pw-accent: #c4a35a;
          --pw-accent-soft: rgba(196, 163, 90, 0.14);
          --pw-line: rgba(232, 239, 230, 0.1);
          --pw-surface: rgba(16, 28, 24, 0.72);
          --pw-code: #07100d;
          --pw-code-ink: #c5d4cb;
          --pw-privacy: #7eb8a4;
          --pw-permanence: #c4a35a;
          --pw-consensus: #8fa8c8;
          font-family: var(--font-pw-sans), ui-sans-serif, system-ui, sans-serif;
          color: var(--pw-ink);
          background: var(--pw-bg);
        }
        @keyframes pwRise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pwDrift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(1.5%, -1%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .pw-fade {
          animation: pwRise 0.7s ease-out both;
        }
        .pw-fade-delay {
          animation: pwRise 0.8s ease-out 0.12s both;
        }
        .pw-fade-delay-2 {
          animation: pwRise 0.85s ease-out 0.22s both;
        }
      `}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% -10%, #1a332a 0%, #0a1210 55%, #060b09 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 70% 20%, rgba(196,163,90,0.12), transparent 70%)",
          animation: "pwDrift 18s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
          mixBlendMode: "overlay",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl overflow-x-clip px-4 sm:px-8 pb-20 sm:pb-24">
        <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-4 border-b border-[var(--pw-line)] bg-[#0a1210]/85 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
          <Link
            href="/"
            className="min-w-0 font-[family-name:var(--font-pw-display)] text-base font-semibold tracking-tight text-[var(--pw-ink)] transition-colors hover:text-[var(--pw-accent)] sm:text-lg"
          >
            PFP Chain
          </Link>
          <nav aria-label="Main" className="hidden sm:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--pw-muted)] transition-colors hover:text-[var(--pw-ink)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            href="/testnet/explore"
            className="sm:hidden rounded-lg border border-[var(--pw-accent)]/50 bg-[var(--pw-accent-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--pw-accent)] transition-colors hover:border-[var(--pw-accent)]"
          >
            Testnet
          </Link>
        </header>

        {children}
      </div>
    </div>
  );
}
