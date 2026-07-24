import type { Metadata } from "next";
import DocsPage from "./docs-page";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "PFP Chain protocol reference plus public testnet join steps for observers, wallets, and operators.",
};

export default function Page() {
  return <DocsPage />;
}
