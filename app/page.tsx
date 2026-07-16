import type { Metadata } from "next";
import TestnetApp from "./testnet/testnet-app";

export const metadata: Metadata = {
  title: {
    absolute: "PFP chain",
  },
  description:
    "PFP chain experimental public testnet — join steps, boot peers, and live tip from the public mesh.",
  robots: { index: true, follow: true },
};

export default function Home() {
  return <TestnetApp />;
}
