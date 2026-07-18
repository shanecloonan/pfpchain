"use client";

import WalletGenerator from "../wallet-generator";
import { useTestnet } from "../testnet-provider";

export default function WalletPage() {
  const { config } = useTestnet();

  return (
    <div className="space-y-8 pt-8 sm:pt-10">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--pw-accent)]">
          Browser wallet
        </p>
        <h1 className="font-[family-name:var(--font-pw-display)] text-[clamp(1.75rem,6vw,2.75rem)] font-semibold tracking-tight">
          Testnet wallet
        </h1>
      </div>
      <WalletGenerator rpcProxyUrl={config.rpc_proxy_url} />
    </div>
  );
}
