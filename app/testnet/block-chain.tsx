"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BlockHeaderSummary } from "@/lib/testnet/types";
import {
  formatDateTime,
  formatTime,
  resolveBlockTimeMs,
  truncateId,
} from "./ui";

export type ChainBlockView = {
  height: number;
  id: string;
  slot?: number;
  whenMs: number | null;
  txCount?: number;
  userTxCount?: number;
};

type Props = {
  headers: BlockHeaderSummary[];
  tipHeight: number | null;
  tipSeenAtMs: number | null;
  slotMs: number;
  /** Median wall-clock gap between tip advances (produce + gossip + poll). */
  observedBlockIntervalMs?: number | null;
  loading?: boolean;
  /** Stretch into remaining hero viewport (mobile + desktop). */
  fill?: boolean;
  /** Hide selected-block detail panel (hero stays tight). */
  compact?: boolean;
};

export default function BlockChainGraphic({
  headers,
  tipHeight,
  tipSeenAtMs,
  slotMs,
  observedBlockIntervalMs = null,
  loading,
  fill = false,
  compact = false,
}: Props) {
  const blocks = useMemo(() => {
    const rows: ChainBlockView[] = [];
    for (const h of headers) {
      const height = h.height;
      if (height == null) continue;
      rows.push({
        height,
        id: h.id ?? h.block_id ?? "",
        slot: h.slot,
        whenMs: resolveBlockTimeMs({
          protocolTsSec: h.timestamp,
          height,
          tipHeight,
          tipSeenAtMs,
          slotMs,
        }),
        txCount: h.tx_count,
        userTxCount: h.user_tx_count,
      });
    }
    rows.sort((a, b) => a.height - b.height);

    const byH = new Map<number, ChainBlockView>();
    for (const b of rows) byH.set(b.height, b);
    return [...byH.values()].sort((a, b) => a.height - b.height);
  }, [headers, tipHeight, tipSeenAtMs, slotMs]);

  const [selected, setSelected] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const scrollerRef = useRef<HTMLOListElement | null>(null);
  // Keep last non-empty block list so a brief empty poll never blanks the box.
  const stableBlocksRef = useRef<ChainBlockView[]>([]);
  if (blocks.length > 0) {
    stableBlocksRef.current = blocks;
  }
  const displayBlocks =
    blocks.length > 0 ? blocks : stableBlocksRef.current;
  const heightKey = displayBlocks.map((b) => b.height).join(",");
  // Prefer measured tip cadence when we have samples; else configured 30s slot.
  const cadenceMs =
    observedBlockIntervalMs != null && observedBlockIntervalMs > 0
      ? observedBlockIntervalMs
      : slotMs;

  // Highlight the newest tip when it advances (no hide/reveal flicker).
  useEffect(() => {
    if (displayBlocks.length === 0) return;
    const tipBlock = displayBlocks[displayBlocks.length - 1];
    if (tipBlock) setSelected(tipBlock.height);
  }, [heightKey]); // eslint-disable-line react-hooks/exhaustive-deps -- only on tip chain change

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Scroll the horizontal chain strip to the tip (does not jump the page).
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const id = requestAnimationFrame(() => {
      scroller.scrollLeft = Math.max(
        0,
        scroller.scrollWidth - scroller.clientWidth,
      );
    });
    return () => cancelAnimationFrame(id);
  }, [tipHeight, heightKey]);

  const tip =
    tipHeight ?? displayBlocks[displayBlocks.length - 1]?.height ?? null;
  const elapsedMs =
    tipSeenAtMs != null ? Math.max(0, now - tipSeenAtMs) : null;
  const remainingMs =
    elapsedMs != null && cadenceMs > 0 ? cadenceMs - elapsedMs : null;
  const overdueMs =
    remainingMs != null && remainingMs < 0 ? -remainingMs : 0;
  const inSlotWindow = remainingMs != null && remainingMs > 0;
  // Progress fills across observed/configured cadence; holds at 100% while awaiting tip.
  const buildingProgress =
    elapsedMs != null && cadenceMs > 0
      ? Math.min(1, elapsedMs / cadenceMs)
      : 0;

  const etaLabel =
    remainingMs == null
      ? "…"
      : inSlotWindow
        ? `~${Math.max(1, Math.ceil(remainingMs / 1000))}s`
        : overdueMs < 1500
          ? "sealing…"
          : `+${Math.floor(overdueMs / 1000)}s awaiting tip`;

  const selectedBlock =
    selected != null
      ? displayBlocks.find((b) => b.height === selected)
      : null;

  const empty = displayBlocks.length === 0;

  return (
    <div
      className={`pw-chain flex flex-col ${
        fill ? "sm:h-full sm:min-h-0 sm:flex-1" : "space-y-3"
      }`}
    >
      <div
        className={`flex shrink-0 items-end justify-between gap-3 ${fill ? "mb-1.5 sm:mb-3" : "mb-3"}`}
      >
        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pw-muted)]">
            Live chain
          </h3>
        </div>
        {tip != null && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--pw-faint)]">
              Tip
            </p>
            <p className="font-mono text-sm text-[var(--pw-accent)]">#{tip}</p>
          </div>
        )}
      </div>

      <div
        className={`relative min-h-0 overflow-hidden rounded-xl border border-[var(--pw-line)] bg-gradient-to-br from-[rgba(16,28,24,0.95)] via-[rgba(10,18,16,0.92)] to-[rgba(8,14,12,0.98)] ${
          fill
            ? "px-1.5 py-2 sm:flex sm:flex-1 sm:flex-col sm:justify-center sm:px-2.5 sm:py-3"
            : "px-2 py-3 sm:px-3 sm:py-4"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 55% 80% at 85% 40%, rgba(255,255,255,0.06), transparent 65%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(255,255,255,0.04), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,239,230,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,239,230,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)",
          }}
        />

        <div className="relative z-[1] w-full">
          {empty ? (
            <div
              className={`flex items-center justify-center text-sm text-[var(--pw-muted)] ${
                fill ? "min-h-[11rem]" : "py-8"
              }`}
            >
              {loading ? "Syncing chain…" : "Waiting for chain headers…"}
            </div>
          ) : (
          <ol
            ref={scrollerRef}
            className="flex items-center gap-0 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {displayBlocks.map((b, i) => {
              const isTip = tip != null && b.height === tip;
              const intervalSec =
                i > 0 &&
                b.whenMs != null &&
                displayBlocks[i - 1]!.whenMs != null
                  ? Math.max(
                      0,
                      Math.round((b.whenMs - displayBlocks[i - 1]!.whenMs!) / 1000),
                    )
                  : null;

              return (
                <li
                  key={b.height}
                  className="flex shrink-0 items-center snap-center"
                >
                  {i > 0 && (
                    <div
                      className="relative mx-0.5 h-px w-5 shrink-0 sm:mx-1 sm:w-8 md:w-10"
                      aria-hidden
                    >
                      <span className="absolute inset-0 origin-left scale-x-100 bg-gradient-to-r from-[var(--pw-accent)]/70 to-[var(--pw-accent)]/25" />
                      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--pw-accent)] opacity-100" />
                      {intervalSec != null && (
                        <span className="absolute left-1/2 top-2.5 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium tabular-nums text-[var(--pw-accent)]/90">
                          {intervalSec}s
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setSelected(selected === b.height ? null : b.height)
                    }
                    className="group relative w-[9.25rem] text-left sm:w-[11rem] md:w-[12rem]"
                    aria-pressed={selected === b.height}
                  >
                    <div
                      className={`relative overflow-hidden rounded-xl border px-3.5 py-3.5 backdrop-blur-sm transition-colors sm:px-4 sm:py-4 ${
                        isTip
                          ? "border-[var(--pw-accent)]/55 bg-[var(--pw-accent-soft)] shadow-[0_0_28px_rgba(255,255,255,0.08)]"
                          : selected === b.height
                            ? "border-[var(--pw-accent)]/35 bg-[var(--pw-surface)]"
                            : "border-[var(--pw-line)] bg-[var(--pw-surface)] hover:border-[var(--pw-accent)]/30"
                      }`}
                    >
                      {isTip && (
                        <span
                          aria-hidden
                          className="pw-tip-sheen absolute -inset-px rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 45%)",
                          }}
                        />
                      )}
                      <div className="relative flex items-start justify-between gap-1">
                        <span
                          className={`font-mono text-xl font-semibold tracking-tight sm:text-2xl ${
                            isTip
                              ? "text-[var(--pw-accent)]"
                              : "text-[var(--pw-ink)]"
                          }`}
                        >
                          #{b.height}
                        </span>
                        {isTip && (
                          <span className="mt-0.5 rounded-full border border-[var(--pw-accent)]/40 bg-[var(--pw-bg)]/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--pw-accent)]">
                            Tip
                          </span>
                        )}
                      </div>
                      <p className="relative mt-2 text-[11px] tabular-nums text-[var(--pw-muted)] sm:text-[12px]">
                        {formatDateTime(b.whenMs)}
                      </p>
                      <p className="relative mt-0.5 text-[11px] tabular-nums text-[var(--pw-muted)] sm:text-[12px]">
                        {b.userTxCount != null
                          ? `${b.userTxCount} transaction${b.userTxCount === 1 ? "" : "s"}`
                          : b.txCount != null
                            ? `${b.txCount} transaction${b.txCount === 1 ? "" : "s"}`
                            : "… transactions"}
                      </p>
                      <p
                        className="relative mt-1.5 truncate font-mono text-[11px] text-[var(--pw-faint)]"
                        title={b.id}
                      >
                        {truncateId(b.id, 6, 4)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}

            <li className="flex shrink-0 items-center">
              <div
                className="relative mx-0.5 h-px w-5 shrink-0 sm:mx-1 sm:w-8 md:w-10"
                aria-hidden
              >
                <span
                  className="absolute inset-0 origin-left bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.35)_0_4px,transparent_4px_8px)]"
                  style={{
                    transform: `scaleX(${0.25 + buildingProgress * 0.75})`,
                    transformOrigin: "left center",
                    transition: "transform 0.25s linear",
                  }}
                />
              </div>
              <div className="relative w-[9.25rem] sm:w-[11rem] md:w-[12rem]">
                <div
                  className={`rounded-xl border border-dashed px-3.5 py-3.5 sm:px-4 sm:py-4 ${
                    inSlotWindow
                      ? "border-[var(--pw-accent)]/30 bg-[var(--pw-surface)]"
                      : "border-[var(--pw-accent)]/50 bg-[var(--pw-accent-soft)]/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xl font-semibold tracking-tight text-[var(--pw-faint)] sm:text-2xl">
                      #{tip != null ? tip + 1 : "…"}
                    </span>
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[var(--pw-accent)]"
                      style={{ animation: "pwPulse 1.4s ease-in-out infinite" }}
                    />
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--pw-faint)]">
                    {inSlotWindow ? "Building…" : "Awaiting tip…"}
                  </p>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--pw-line)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--pw-accent)]/40 to-[var(--pw-accent)]"
                      style={{
                        width: `${Math.round(buildingProgress * 100)}%`,
                        transition: "width 0.25s linear",
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] tabular-nums text-[var(--pw-faint)]">
                    {etaLabel}
                  </p>
                </div>
              </div>
            </li>
          </ol>
          )}
        </div>
      </div>

      {!compact && selectedBlock && (
        <div className="mt-3 shrink-0 rounded-xl border border-[var(--pw-line)] bg-[var(--pw-surface)]/50 px-4 py-3 text-[12px] text-[var(--pw-muted)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-sm text-[var(--pw-ink)]">
              Block #{selectedBlock.height}
            </p>
            <p className="tabular-nums text-[var(--pw-faint)]">
              {formatDateTime(selectedBlock.whenMs)}
              {selectedBlock.whenMs != null
                ? ` · ${formatTime(selectedBlock.whenMs)}`
                : ""}
            </p>
          </div>
          <p className="mt-1.5 break-all font-mono text-[11px] text-[var(--pw-ink)]">
            {selectedBlock.id || "—"}
          </p>
          {selectedBlock.slot != null && (
            <p className="mt-1 text-[11px] text-[var(--pw-faint)]">
              Slot {selectedBlock.slot}
            </p>
          )}
          {selectedBlock.userTxCount != null && (
            <p className="mt-1 text-[11px] text-[var(--pw-faint)]">
              {selectedBlock.userTxCount} user transaction
              {selectedBlock.userTxCount === 1 ? "" : "s"}
              {selectedBlock.txCount != null
                ? ` · ${selectedBlock.txCount} total incl. coinbase`
                : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
