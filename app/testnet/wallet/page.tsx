import type { Metadata } from "next";
import WalletPage from "./wallet-page";

export const metadata: Metadata = {
  title: "Wallet",
  description:
    "Generate a testnet wallet in your browser, fund from the faucet, and send PFP.",
};

export default function Page() {
  return <WalletPage />;
}
