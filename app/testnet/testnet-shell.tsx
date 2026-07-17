"use client";

import { Literata, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";
import SiteHeader from "../site-nav";
import { TestnetProvider } from "./testnet-provider";

const display = Literata({
  subsets: ["latin"],
  variable: "--font-pw-display",
  weight: ["400", "600", "700"],
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-pw-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-pw-mono",
  weight: ["400", "500"],
});

export default function TestnetShell({ children }: { children: ReactNode }) {
  return (
    <TestnetProvider>
      <div
        className={`${display.variable} ${sans.variable} ${mono.variable} pw-theme relative min-h-screen`}
      >
        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 sm:px-8 sm:pb-24">
          <SiteHeader />
          {children}
        </div>
      </div>
    </TestnetProvider>
  );
}
