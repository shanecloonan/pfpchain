import Link from "next/link";
import type { ReactNode } from "react";

export default function HomePage() {
  return (
    <div className="space-y-20 pt-10 sm:space-y-28 sm:pt-14">
      {/* Hero */}
      <section className="space-y-8">
        <div className="space-y-5">
          <p className="pw-fade text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--pw-accent)]">
            Essential reference
          </p>
          <h1 className="pw-fade-delay font-[family-name:var(--font-pw-display)] text-[clamp(2rem,7vw,3.5rem)] font-semibold leading-[1.06] tracking-tight text-[var(--pw-ink)]">
            PFP Chain
          </h1>
          <p className="pw-fade-delay-2 max-w-2xl text-base leading-relaxed text-[var(--pw-muted)] sm:text-lg">
            Experimental pre-audit chain: Monero-grade privacy and
            Arweave-style permanence in one ledger.
          </p>
        </div>

        <div className="pw-fade-delay-2 flex flex-wrap gap-2">
          {[
            "Token: PFP",
            "8 decimals",
            "1 PFP = 100,000,000 base units",
            "Slot time ≈ 12s",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--pw-line)] bg-[var(--pw-surface)]/60 px-3 py-1 font-mono text-[11px] text-[var(--pw-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="pw-fade-delay-2 flex flex-wrap gap-3">
          <Link
            href="/testnet/explore"
            className="inline-flex items-center rounded-lg bg-[var(--pw-accent)] px-5 py-2.5 text-sm font-semibold text-[#0a1210] transition-opacity hover:opacity-90"
          >
            Explore testnet
          </Link>
          <Link
            href="/testnet/docs"
            className="inline-flex items-center rounded-lg border border-[var(--pw-line)] bg-[var(--pw-surface)]/60 px-5 py-2.5 text-sm font-semibold text-[var(--pw-ink)] transition-colors hover:border-[var(--pw-accent)]/40"
          >
            Join the mesh
          </Link>
        </div>
      </section>

      {/* 1. Privacy */}
      <Section
        id="privacy"
        num={1}
        title="Privacy"
        accent="var(--pw-privacy)"
        lead="RingCT / CLSAG stack — what hides on-chain and what stays visible."
      >
        <Grid>
          <Card title="What is hidden">
            <BulletList
              items={[
                "Sender — CLSAG ring signature over 16 decoys (uniform ring-16 is consensus law)",
                "Receiver — CryptoNote stealth one-time addresses (view key + spend key)",
                "Amounts — Pedersen commitments + Bulletproof range proofs",
                "Wallet linkability — no stable on-chain address; key images prevent double-spend without revealing which ring member spent",
              ]}
            />
          </Card>
          <Card title="What stays public">
            <BulletList
              items={[
                "That a tx happened, input count, output count (not amounts)",
                "Fee value (needed for balance equation: Σ inputs = Σ outputs + fee)",
                "Block timing / mempool ordering",
                "Optional authorship claims (separate Schnorr publishing identity — not ring-signed)",
              ]}
            />
          </Card>
        </Grid>

        <SubBlock title="Production policy">
          <p className="mb-3 text-sm text-[var(--pw-muted)]">
            Consensus-enforced under uniform-ring tier.
          </p>
          <BulletList
            items={[
              "min_ring_size = uniform_ring_size = 16 (Monero parity)",
              "min_output_count = 2 — reference wallets pad with zero-value Pedersen output if needed",
              "min_input_count = 2 — single-input txs rejected when a second UTXO exists (F7)",
              "Release binaries: CLSAG only (legacy LSAG gated off)",
            ]}
          />
        </SubBlock>

        <SubBlock title="Wallet / network privacy defaults">
          <BulletList
            items={[
              "Default transfer fee: 0.0001 PFP (wallet convention; consensus accepts any fee, mempool = highest-fee-first + RBF)",
              "Upload size buckets: payloads padded to next power-of-two before anchoring (consensus rejects non-bucket sizes)",
              "Output order shuffled (change position carries no signal)",
              "Age-band coin selection; decoys uniform within height bucket",
              "View tags (tx v2): 1-byte tag per output → ~256× faster wallet scan",
              "Dandelion++ stem relay optional (stem P2P tag 0x11; fluff on normal tx tag)",
              "Tor JSON-RPC optional for wallet ↔ node",
              "Authorship firewall: claiming key must not derive from wallet view/spend keys",
            ]}
          />
        </SubBlock>

        <Grid>
          <Card title="Crypto assumptions">
            <BulletList
              items={[
                "ed25519 discrete log, DDH, SHA-256, Bulletproof soundness, Fiat-Shamir",
                "Key images reject identity/torsion/small-order points",
              ]}
            />
          </Card>
          <Card title="Not provided by default">
            <BulletList
              items={[
                "Upload plaintext is not encrypted — encrypt locally if you need file confidentiality",
                "No on-chain deletion; permanence is irreversible",
              ]}
            />
          </Card>
        </Grid>
      </Section>

      {/* 2. Permanence */}
      <Section
        id="permanence"
        num={2}
        title="Permanence"
        accent="var(--pw-permanence)"
        lead="Off-chain bytes, on-chain anchors — SPoRA audits every block."
      >
        <SubBlock title="Model">
          <BulletList
            items={[
              "File bytes live off-chain; chain anchors a fixed-size StorageCommitment (Merkle data_root, size, replication, endowment Pedersen commit)",
              "Multiple independent storage operators hold replicas; SPoRA audits every block",
              "Privacy fees (90% → treasury) fund ongoing operator payouts; upfront endowment capitalizes the treasury",
            ]}
          />
        </SubBlock>

        <Grid>
          <Card title="Chunking & identity">
            <BulletList
              items={[
                "Chunk size: 256 KiB (DEFAULT_CHUNK_SIZE)",
                "num_chunks = ceil(size_bytes / chunk_size); empty file = 1 chunk of 0 bytes",
                "chunk_hash_i = dhash(MERKLE_LEAF, chunk_bytes_i)",
                "data_root = binary Merkle root over chunk hashes (content-addressed file ID)",
                "Upload size_bytes on-chain = power-of-two bucket (wallet pads raw payload)",
              ]}
            />
          </Card>
          <Card title="Replication">
            <p className="text-sm text-[var(--pw-muted)]">
              min_replication = 3, max_replication = 32 (consensus bounds)
            </p>
          </Card>
        </Grid>

        <SubBlock title="Endowment formula">
          <div className="space-y-3 font-mono text-[12px] leading-relaxed text-[var(--pw-code-ink)]">
            <FormulaBlock>
              C₀ = cost_per_byte_year × size_bytes × replication{" "}
              <span className="text-[var(--pw-faint)]">(first-year cost)</span>
            </FormulaBlock>
            <FormulaBlock>
              Yield-bearing (r &gt; 0): E₀ = C₀ · (1 + i) / (r − i){" "}
              <span className="text-[var(--pw-faint)]">where r &gt; i required</span>
            </FormulaBlock>
            <FormulaBlock>
              Deflation mode (default, r = 0): E₀ = C₀ · (1 + i) / d
            </FormulaBlock>
          </div>
          <p className="mt-3 text-sm text-[var(--pw-muted)]">
            inflation_ppb (2%) treated as conservative assumed deflation rate d
            (Kryder&apos;s law). No yield harvested from locked endowment
            principal; treasury + fees pay operators.
          </p>
        </SubBlock>

        <SubBlock title="Default endowment params">
          <ParamGrid
            params={[
              ["cost_per_byte_year_ppb", "200,000 → 2×10⁻⁴ base units / byte-year / replica"],
              ["inflation_ppb", "20,000,000 (2%/yr)"],
              ["real_yield_ppb", "0 (deflation-funded mode)"],
              ["slots_per_year", "2,629,800"],
              ["proof_reward_window_slots", "7,200 (~1 day anti-hoarding cap)"],
            ]}
          />
        </SubBlock>

        <Callout title="Worked example" accent="var(--pw-permanence)">
          <p className="text-sm text-[var(--pw-muted)]">
            Defaults, 1 GiB, 3× replication:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--pw-ink)]">
            <li>C₀ ≈ 0.006 PFP/year → E₀ ≈ 0.306 PFP upfront endowment (~51× first-year cost)</li>
            <li>Min upload fee = ceil(E₀ × 10,000 / 9,000) + 0.00001 PFP producer tip ≈ 0.34 PFP</li>
          </ul>
        </Callout>

        <Grid>
          <Card title="Upload fee gate">
            <FormulaBlock>
              fee × fee_to_treasury_bps / 10,000 ≥ Σ required_endowment(new anchors)
            </FormulaBlock>
            <p className="mt-2 text-sm text-[var(--pw-muted)]">
              Default fee_to_treasury_bps = 9000 → treasury must receive full
              endowment from fee share.
            </p>
          </Card>
          <Card title="Endowment binding">
            <BulletList
              items={[
                "PFEO: Pedersen opening must match required_endowment (require_endowment_opening: 1)",
                "PFER: Bulletproof range proof on endowment surplus (require_endowment_range_proof: 1)",
              ]}
            />
          </Card>
        </Grid>

        <SubBlock title="SPoRA — Succinct Proof of Random Access">
          <BulletList
            items={[
              "Each block: deterministic challenge picks one chunk index from (prev_block_id, slot, commit_hash)",
              "Operator submits ~256 KiB chunk + Merkle path → verified in microseconds (no ZK on hot path)",
              "Valid proof → treasury payout (accrual capped by proof_reward_window_slots)",
              "First valid proof to producer wins (latency-sensitive); operators must prove regularly or forfeit accrual",
            ]}
          />
        </SubBlock>

        <SubBlock title="Operator economics & slashing">
          <BulletList
            items={[
              "Operators paid from treasury (90% of all tx fees + emission backstop when treasury short)",
              "storage_proof_reward backstop cap: 0.1 PFP per proof from fresh emission if treasury empty",
              "per_slot_payout from endowment yield = 0 at default (r = 0)",
              "Operator registration + bond; consecutive missed operator-salted SPoRA audits → bond slash to treasury",
              "Roles separated: validators ≠ storage operators (consumer hardware viable for storage)",
            ]}
          />
        </SubBlock>

        <GuaranteeList
          yes="Merkle root anchored forever; economic incentive to retain bytes; random audits"
          no="No SLA on retrieval speed (gateway layer); no delete; no default file encryption"
        />
      </Section>

      {/* 3. Consensus */}
      <Section
        id="consensus"
        num={3}
        title="Consensus · Supply · Economics · Roles"
        accent="var(--pw-consensus)"
        lead="Three money flows, stake-weighted finality, intentionally separated roles."
      >
        <SubBlock title="Three money flows">
          <ol className="space-y-2 text-sm text-[var(--pw-muted)]">
            <li className="flex gap-3">
              <span className="font-mono text-[var(--pw-consensus)]">1.</span>
              Subsidy — fresh PFP minted per block (emission curve)
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--pw-consensus)]">2.</span>
              Fees — per-tx fee split 90% storage treasury / 10% block producer (fee_to_treasury_bps = 9000)
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--pw-consensus)]">3.</span>
              Storage yield — treasury pays SPoRA proofs; emission backstop if treasury short
            </li>
          </ol>
        </SubBlock>

        <SubBlock title="Emission">
          <p className="mb-3 text-sm text-[var(--pw-muted)]">
            Bitcoin halvings + Monero tail.
          </p>
          <BulletList
            items={[
              "emission(h): 50 PFP/block for blocks 1..8M, then halve every 8M blocks, 8 halvings, then permanent tail",
              "initial_reward = 50 PFP/block",
              "halving_period = 8,000,000 blocks (~3.04 years @ 12s slots)",
              "halving_count = 8 → pre-tail supply ≈ 796.875M PFP",
              "tail_emission = 50 >> 8 = 0.19531250 PFP/block forever (~513k PFP/year at tail start ≈ 0.064%/yr and declining)",
              "subsidy_to_treasury_bps = 0 default (approved for future fork: 10% of tail → treasury)",
              "storage_proof_reward = 0.1 PFP (emission backstop per accepted proof)",
            ]}
          />
        </SubBlock>

        <SubBlock title="Fee summary">
          <div className="overflow-x-auto rounded-xl border border-[var(--pw-line)]">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--pw-line)] bg-[var(--pw-surface)]/80">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--pw-faint)]">
                    Action
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--pw-faint)]">
                    Default cost
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--pw-faint)]">
                    Enforced by
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--pw-faint)]">
                    Split
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--pw-line)]">
                {[
                  ["Transfer / claim", "0.0001 PFP flat", "Wallet only", "90% treasury / 10% producer"],
                  ["Storage upload", "~ceil(E₀×10000/9000)+tip", "Consensus", "90% treasury / 10% producer"],
                  ["Validator bond", "full stake", "Consensus", "100% treasury"],
                  ["Slashing", "forfeited stake/bond", "Consensus", "100% treasury"],
                ].map(([action, cost, enforced, split]) => (
                  <tr key={action} className="bg-[var(--pw-surface)]/30">
                    <td className="px-4 py-3 font-medium text-[var(--pw-ink)]">{action}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[var(--pw-muted)]">{cost}</td>
                    <td className="px-4 py-3 text-[var(--pw-muted)]">{enforced}</td>
                    <td className="px-4 py-3 text-[var(--pw-muted)]">{split}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[var(--pw-faint)]">
            No fee burn. Flat fee ≠ % of amount sent.
          </p>
        </SubBlock>

        <SubBlock title="Treasury equilibrium">
          <BulletList
            items={[
              "Steady state: treasury_inflow (90% of fees) ≈ storage_reward_per_block",
              "High privacy-tx volume → treasury grows (buffer)",
              "Low volume → treasury drains → emission backstop mints up to 0.1 PFP/proof",
            ]}
          />
        </SubBlock>

        <SubBlock title="Consensus mechanism">
          <BulletList
            items={[
              "Single finalized chain; ~12s slots; stake-weighted VRF sortition (ECVRF over ed25519)",
              "Eligibility: vrf_output < (stake/total_stake) × 1.5 × u64::MAX (~1.5 expected proposers/slot)",
              "Tie-break: lowest VRF output wins",
              "Finality: BLS12-381 aggregated committee signatures; quorum = 66.67% stake (6667 bps)",
              "Slashing: equivocation (double-sign headers) + liveness; multiplicative stake reduction",
              "Fraud proofs (P2P): invalid blocks, coinbase fraud, invalid CLSAG/SPoRA, ring-membership UTXO witnesses",
              "Light clients: header verify + checkpoint logs; full nodes re-execute apply_block regardless of BLS quorum",
            ]}
          />
        </SubBlock>

        <SubBlock title="Network roles">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Validators", "Consensus, block production, bonded stake, always-on"],
              ["Storage operators", "Hold replicas, answer SPoRA, consumer-grade hardware OK"],
              ["Observers / light nodes", "Sync headers, verify, no stake"],
              ["Wallets", "CLSAG sign, upload, scan"],
            ].map(([role, desc]) => (
              <div
                key={role}
                className="rounded-xl border border-[var(--pw-line)] bg-[var(--pw-surface)]/40 px-4 py-3"
              >
                <p className="text-sm font-semibold text-[var(--pw-ink)]">{role}</p>
                <p className="mt-1 text-sm text-[var(--pw-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </SubBlock>

        <SubBlock title="Genesis constitution">
          <p className="mb-2 text-sm text-[var(--pw-muted)]">
            Fork legitimacy invariants:
          </p>
          <BulletList
            items={[
              "tail_emission > 0",
              "uniform ring size ≥ 16",
              "well-formed endowment pricing params",
            ]}
          />
        </SubBlock>
      </Section>

      {/* One-liner + footer CTA */}
      <section className="space-y-6 border-t border-[var(--pw-line)] pt-12">
        <blockquote className="rounded-2xl border border-[var(--pw-accent)]/30 bg-[var(--pw-accent-soft)] px-6 py-5 sm:px-8 sm:py-6">
          <p className="font-[family-name:var(--font-pw-display)] text-lg leading-relaxed text-[var(--pw-ink)] sm:text-xl">
            Privacy-tx fees fund a self-balancing storage treasury; users prepay
            an endowment sized for perpetual bytes; operators prove random chunk
            possession every block or lose pay (and eventually bond).
          </p>
        </blockquote>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--pw-faint)]">
            PFP Chain · Privacy-Funded Permanence
          </p>
          <Link
            href="/testnet/explore"
            className="text-sm font-semibold text-[var(--pw-accent)] underline-offset-4 hover:underline"
          >
            Open testnet →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Section({
  id,
  num,
  title,
  accent,
  lead,
  children,
}: {
  id: string;
  num: number;
  title: string;
  accent: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold"
            style={{
              color: accent,
              background: `color-mix(in srgb, ${accent} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
            }}
          >
            {num}
          </span>
          <div
            className="h-px flex-1"
            style={{
              background: `linear-gradient(to right, color-mix(in srgb, ${accent} 40%, transparent), transparent)`,
            }}
          />
        </div>
        <h2
          className="font-[family-name:var(--font-pw-display)] text-[clamp(1.5rem,4vw,2.25rem)] font-semibold tracking-tight"
          style={{ color: accent }}
        >
          {title}
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pw-muted)] sm:text-base">{lead}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function SubBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--pw-ink)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--pw-line)] bg-[var(--pw-surface)]/40 p-5">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pw-accent)]">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2.5 text-sm leading-relaxed text-[var(--pw-muted)]"
        >
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--pw-faint)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FormulaBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--pw-line)] bg-[var(--pw-code)] px-4 py-3 font-mono text-[12px] leading-relaxed text-[var(--pw-code-ink)]">
      {children}
    </div>
  );
}

function ParamGrid({ params }: { params: [string, string][] }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {params.map(([key, val]) => (
        <div
          key={key}
          className="rounded-lg border border-[var(--pw-line)] bg-[var(--pw-surface)]/30 px-4 py-3"
        >
          <dt className="font-mono text-[11px] text-[var(--pw-accent)]">{key}</dt>
          <dd className="mt-1 text-sm text-[var(--pw-muted)]">{val}</dd>
        </div>
      ))}
    </dl>
  );
}

function Callout({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-xl border px-5 py-4"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
        background: `color-mix(in srgb, ${accent} 8%, transparent)`,
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: accent }}
      >
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function GuaranteeList({ yes, no }: { yes: string; no: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 text-sm text-[var(--pw-muted)]">
        <span className="text-emerald-400/90">✓</span>
        {yes}
      </div>
      <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-950/15 px-4 py-3 text-sm text-[var(--pw-muted)]">
        <span className="text-red-400/80">✗</span>
        {no}
      </div>
    </div>
  );
}
