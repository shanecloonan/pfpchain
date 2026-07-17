"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { observerCommands, walletCommands } from "@/lib/testnet/commands";
import { CodeBlock, useCopyFeedback } from "../ui";
import { useTestnet } from "../testnet-provider";

export default function DocsPage() {
  const { config } = useTestnet();
  const { copiedKey, copy } = useCopyFeedback();
  const obs = observerCommands(config);
  const wallet = walletCommands();

  return (
    <div className="space-y-16 sm:space-y-20 pt-8 sm:pt-10">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--pw-accent)]">
            Join the mesh
          </p>
          <h1 className="font-[family-name:var(--font-pw-display)] text-[clamp(1.75rem,6vw,2.75rem)] font-semibold tracking-tight">
            Documentation
          </h1>
          <p className="text-sm text-[var(--pw-muted)] max-w-2xl">
            Static join path — works with zero backend.{" "}
            <code className="text-[12px]">mfnd</code> JSON-RPC is
            newline-delimited TCP; browsers need an HTTP proxy for live stats
            only.
          </p>
        </div>

        <a
          href={config.upstream_repo}
          target="_blank"
          rel="noreferrer"
          className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--pw-accent)]/50 bg-[var(--pw-accent-soft)] px-5 py-4 text-left transition-colors hover:border-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/20 sm:px-6 sm:py-5"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--pw-accent)]">
              Upstream source
            </span>
            <span className="mt-1 block font-[family-name:var(--font-pw-display)] text-lg font-semibold text-[var(--pw-ink)] sm:text-xl">
              pfpchain on GitHub
            </span>
            <span className="mt-1 block truncate font-mono text-[12px] text-[var(--pw-muted)]">
              {config.upstream_repo.replace("https://", "")}
            </span>
          </span>
          <span
            aria-hidden
            className="shrink-0 text-2xl text-[var(--pw-accent)] transition-transform group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </a>
      </div>

      <section className="space-y-10">
        <Role title="Role 1 — Observer" subtitle="Minimum join">
          <p className="text-sm text-[var(--pw-muted)] mb-3">
            Build and sync an observer. Seed nodes auto-dial from the manifest
            beside genesis; optional explicit dials below.
          </p>
          <CodeBlock
            code={obs.build}
            copyKey="obs-build"
            copiedKey={copiedKey}
            onCopy={copy}
          />
          <div className="mt-3">
            <CodeBlock
              code={obs.serve}
              copyKey="obs-serve"
              copiedKey={copiedKey}
              onCopy={copy}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--pw-faint)] whitespace-pre-wrap font-mono">
            {obs.dialHint}
          </p>
          <div className="mt-3">
            <CodeBlock
              code={obs.verify}
              copyKey="obs-verify"
              copiedKey={copiedKey}
              onCopy={copy}
            />
          </div>
          <p className="mt-3 text-sm text-[var(--pw-muted)]">
            Expect matching <code className="text-[12px]">genesis_id</code> and
            rising <code className="text-[12px]">tip_height</code>.
          </p>
        </Role>

        <Role title="Role 2 — Wallet user" subtitle="Browser or CLI">
          <p className="text-sm text-[var(--pw-muted)] mb-3">
            Prefer the{" "}
            <Link
              href="/testnet/wallet"
              className="text-[var(--pw-accent)] underline-offset-2 hover:underline"
            >
              testnet wallet
            </Link>{" "}
            for faucet / balance / send. Or use the CLI against a local observer
            — keep the seed / wallet JSON private forever.
          </p>
          <CodeBlock
            code={wallet.newWallet}
            copyKey="wal-new"
            copiedKey={copiedKey}
            onCopy={copy}
          />
          <div className="mt-3 space-y-3">
            <CodeBlock
              code={wallet.balance}
              copyKey="wal-bal"
              copiedKey={copiedKey}
              onCopy={copy}
            />
            <CodeBlock
              code={wallet.upload}
              copyKey="wal-up"
              copiedKey={copiedKey}
              onCopy={copy}
            />
          </div>
        </Role>

        <Role title="Role 3 — Storage operator" subtitle="Optional">
          <p className="text-sm text-[var(--pw-muted)]">
            Build <code className="text-[12px]">mfn-storage-operator</code>;
            point it at a synced local observer RPC. No validator keys
            required. Details in upstream{" "}
            <a
              href={config.links.operators}
              className="text-[var(--pw-accent)] underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              OPERATORS.md
            </a>
            .
          </p>
        </Role>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-pw-display)] text-2xl sm:text-3xl tracking-tight">
          Never share
        </h2>
        <ul className="space-y-2 text-sm text-[var(--pw-muted)]">
          {[
            "Validator VRF/BLS seeds",
            "Wallet JSON / restore seeds",
            "Public RPC URLs on validators",
            "Operator API keys",
          ].map((item) => (
            <li
              key={item}
              className="flex gap-3 border-b border-[var(--pw-line)] py-2.5 last:border-0"
            >
              <span className="text-red-400/80" aria-hidden>
                ×
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-pw-display)] text-2xl sm:text-3xl tracking-tight">
          Docs & help
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["Invite / operator packet", config.links.invite],
              ["Join guide", config.links.join],
              ["Checkpoint log", config.links.checkpoints],
              ["Faucet help (issues)", config.links.issues],
              ["Upstream repo", config.upstream_repo],
              ["RPC proxy reference", config.links.rpc_proxy],
            ] as const
          ).map(([label, href]) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-[var(--pw-line)] bg-[var(--pw-surface)]/40 px-4 py-3 text-sm text-[var(--pw-ink)] transition-colors hover:border-[var(--pw-accent)]/35"
              >
                {label}
                <span className="ml-2 text-[var(--pw-faint)]">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Role({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-[var(--pw-ink)]">{title}</h3>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--pw-accent)]">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}
