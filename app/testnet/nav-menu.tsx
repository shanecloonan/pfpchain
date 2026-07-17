"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/testnet/explore", label: "Explore" },
  { href: "/testnet/wallet", label: "Wallet" },
  { href: "/testnet/docs", label: "Docs" },
] as const;

export default function NavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current?.contains(t) ||
        buttonRef.current?.contains(t)
      ) {
        return;
      }
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open, close]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--pw-line)] bg-[var(--pw-surface)]/80 text-[var(--pw-ink)] transition-colors hover:border-[var(--pw-accent)]/40 cursor-pointer"
      >
        <span className="sr-only">Menu</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className="text-current"
        >
          {open ? (
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M3 5.5h14M3 10h14M3 14.5h14"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          />
          <div
            ref={panelRef}
            id={menuId}
            role="dialog"
            aria-label="Site navigation"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] overflow-hidden rounded-xl border border-[var(--pw-line)] bg-[#0d1613]/95 shadow-xl shadow-black/40 backdrop-blur-md"
          >
            <nav aria-label="Main">
              <ul className="py-1.5">
                {NAV_ITEMS.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]"
                            : "text-[var(--pw-ink)] hover:bg-[var(--pw-surface)]/80"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
