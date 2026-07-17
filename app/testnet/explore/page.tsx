import type { Metadata } from "next";
import ExplorePage from "./explore-page";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Live tip, recent blocks, and mesh pulse from the PFP Chain public testnet.",
};

export default function Page() {
  return <ExplorePage />;
}
