import type { Metadata } from "next";
import DocsPage from "./docs-page";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Join the PFP Chain public testnet — observer, wallet, and operator instructions.",
};

export default function Page() {
  return <DocsPage />;
}
