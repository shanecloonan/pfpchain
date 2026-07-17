"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

const TESTNET_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/testnet/explore", label: "Explore" },
  { href: "/testnet/wallet", label: "Wallet" },
  { href: "/testnet/docs", label: "Docs" },
] as const;

const HOME_ITEMS = [
  { href: "/#privacy", label: "Privacy" },
  { href: "/#permanence", label: "Permanence" },
  { href: "/#consensus", label: "Consensus" },
  { href: "/testnet/explore", label: "Testnet" },
] as const;

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href;
}

function NavLink({
  href,
  label,
  active,
  onNavigate,
  compact,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`block rounded-md font-medium transition-colors ${
        compact ? "px-3 py-2.5 text-sm" : "px-3 py-1.5 text-sm"
      } ${
        active
          ? "bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]"
          : "text-[var(--pw-muted)] hover:bg-[var(--pw-surface)]/60 hover:text-[var(--pw-ink)]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader({
  variant = "testnet",
}: {
  variant?: "home" | "testnet";
}) {
  const pathname = usePathname();
  const items: NavItem[] =
    variant === "home" ? [...HOME_ITEMS] : [...TESTNET_ITEMS];
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-[var(--pw-line)] bg-[var(--pw-bg)]/90 backdrop-blur-md sm:-mx-8">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link
          href="/"
          className="min-w-0 font-[family-name:var(--font-pw-display)] text-base font-semibold tracking-tight text-[var(--pw-ink)] transition-colors hover:text-[var(--pw-accent)] sm:text-lg"
        >
          PFP Chain
        </Link>

        {/* Desktop — pill group integrated into the bar */}
        <nav aria-label="Main" className="hidden sm:block">
          <ul className="flex items-center gap-0.5 rounded-lg border border-[var(--pw-line)] bg-[var(--pw-surface)]/40 p-0.5">
            {items.map(({ href, label }) => (
              <li key={href}>
                <NavLink
                  href={href}
                  label={label}
                  active={isActive(pathname, href)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer sm:hidden ${
            open
              ? "border-[var(--pw-accent)]/50 bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]"
              : "border-[var(--pw-line)] bg-[var(--pw-surface)]/50 text-[var(--pw-muted)] hover:border-[var(--pw-accent)]/30 hover:text-[var(--pw-ink)]"
          }`}
        >
          Menu
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile drawer — full-width row under the bar, not a floating popup */}
      <div
        id={panelId}
        className={`grid border-[var(--pw-line)] transition-[grid-template-rows,opacity,border-color] duration-200 ease-out sm:hidden ${
          open
            ? "grid-rows-[1fr] border-t opacity-100"
            : "grid-rows-[0fr] border-t-transparent opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav
            aria-label="Main"
            className="bg-[var(--pw-surface)]/25 px-4 pb-3 pt-2 sm:px-8"
          >
            <ul className="grid grid-cols-2 gap-0.5">
              {items.map(({ href, label }) => (
                <li key={href}>
                  <NavLink
                    href={href}
                    label={label}
                    active={isActive(pathname, href)}
                    onNavigate={close}
                    compact
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
