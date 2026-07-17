import type { Metadata } from "next";
import HomePage from "./home-page";
import HomeShell from "./home-shell";

export const metadata: Metadata = {
  title: "PFP Chain — Privacy-Funded Permanence",
  description:
    "Experimental pre-audit chain: Monero-grade privacy and Arweave-style permanence in one ledger. Token PFP, essential protocol reference.",
};

export default function Home() {
  return (
    <HomeShell>
      <HomePage />
    </HomeShell>
  );
}
