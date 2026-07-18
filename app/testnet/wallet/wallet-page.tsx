"use client";

import WalletGenerator from "../wallet-generator";
import { useTestnet } from "../testnet-provider";

export default function WalletPage() {
  const { config } = useTestnet();

  return (
    <div className="space-y-8 pt-8 sm:pt-10">
      <WalletGenerator rpcProxyUrl={config.rpc_proxy_url} />
    </div>
  );
}
