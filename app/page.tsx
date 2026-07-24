import type { Metadata } from "next";
import ExplorePage from "./testnet/explore/explore-page";
import TestnetShell from "./testnet/testnet-shell";

export const metadata: Metadata = {
  title: "PFP Chain — Privacy-Funded Permanence",
  description:
    "Live tip, recent blocks, and mesh pulse from the PFP Chain public testnet.",
};

export default function Home() {
  return (
    <TestnetShell>
      <ExplorePage />
    </TestnetShell>
  );
}
