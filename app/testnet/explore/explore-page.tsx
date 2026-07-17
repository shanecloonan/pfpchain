"use client";

import LiveStats from "../live-stats";
import { CopyButton, useCopyFeedback } from "../ui";
import { useTestnet } from "../testnet-provider";

export default function ExplorePage() {
  const { config, live } = useTestnet();
  const { copiedKey, copy } = useCopyFeedback();

  return (
    <>
      <header className="flex flex-col pt-8 pb-6 sm:min-h-[70dvh] sm:pt-10 sm:pb-8">
        <div className="shrink-0">
          <p className="pw-fade text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--pw-accent)]">
            Experimental public testnet
          </p>
          <h1 className="pw-fade-delay mt-3 font-[family-name:var(--font-pw-display)] text-[clamp(1.85rem,7.5vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-[var(--pw-ink)]">
            Explore the network
          </h1>
          <p className="pw-fade-delay-2 mt-4 text-sm text-[var(--pw-muted)] max-w-2xl">
            Live tip, recent blocks, and mesh pulse from the public observer
            proxy.
          </p>
          <p className="pw-fade-delay-2 mt-3 text-[11px] tracking-wide text-[var(--pw-faint)]">
            {config.network_id} · committee {config.validator_committee_size} ·
            slot {config.slot_duration_ms / 1000}s
          </p>
        </div>

        <div className="pw-fade-delay-2 mt-6 flex flex-col sm:mt-8 sm:min-h-0 sm:flex-1 sm:justify-end">
          <LiveStats config={config} live={live} variant="hero" />
        </div>
      </header>

      <div className="space-y-16 sm:space-y-20">
        <LiveStats config={config} live={live} variant="section" />

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-pw-display)] text-2xl sm:text-3xl tracking-tight">
            Network identity
          </h2>
          <p className="text-sm text-[var(--pw-muted)] max-w-2xl">
            Pin these values. Genesis JSON must be byte-identical to upstream{" "}
            <code className="text-[12px] text-[var(--pw-accent)]">
              {config.genesis_path}
            </code>
            .
          </p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Pin
              label="network_id"
              value={config.network_id}
              copyKey="nid"
              copiedKey={copiedKey}
              onCopy={copy}
            />
            <Pin
              label="genesis_id"
              value={config.genesis_id}
              copyKey="gid"
              copiedKey={copiedKey}
              onCopy={copy}
              mono
            />
          </dl>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-pw-display)] text-2xl sm:text-3xl tracking-tight">
            Public boot peers
          </h2>
          <p className="text-sm text-[var(--pw-muted)] max-w-2xl">
            Validator mesh P2P listen addresses only. Do not open HTTP to these
            ports. There is no published community read-RPC by default.
          </p>
          <ul className="space-y-2">
            {config.boot_peers.map((peer) => (
              <li
                key={peer}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--pw-line)] bg-[var(--pw-surface)]/50 px-4 py-3"
              >
                <code className="font-mono text-sm text-[var(--pw-ink)]">
                  {peer}
                </code>
                <CopyButton
                  text={peer}
                  copyKey={`peer-${peer}`}
                  copiedKey={copiedKey}
                  onCopy={copy}
                />
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t border-[var(--pw-line)] pt-8 text-[11px] leading-relaxed text-[var(--pw-faint)]">
          Live stats require a dedicated observer + hardened HTTP→TCP proxy — not
          the P2P mesh ports. Posture: public P2P, private RPC by default.
        </footer>
      </div>
    </>
  );
}

function Pin({
  label,
  value,
  copyKey,
  copiedKey,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--pw-line)] bg-[var(--pw-surface)]/50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--pw-faint)]">
          {label}
        </dt>
        <CopyButton
          text={value}
          copyKey={copyKey}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      </div>
      <dd
        className={`mt-2 break-all text-sm text-[var(--pw-ink)] ${mono ? "font-mono text-[12px] leading-relaxed" : "font-medium"}`}
      >
        {value}
      </dd>
    </div>
  );
}
