"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { FALLBACK_CONFIG } from "@/lib/testnet/config";
import type { TestnetConfig } from "@/lib/testnet/types";
import { useLiveSnapshot, type LiveSnapshotState } from "./use-live-snapshot";

type TestnetContextValue = {
  config: TestnetConfig;
  live: LiveSnapshotState;
};

const TestnetContext = createContext<TestnetContextValue | null>(null);

export function TestnetProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TestnetConfig>(FALLBACK_CONFIG);
  const live = useLiveSnapshot(config);

  useEffect(() => {
    let cancelled = false;
    fetch("/testnet/config.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data === "object" && data.genesis_id) {
          setConfig({
            ...FALLBACK_CONFIG,
            ...data,
            links: { ...FALLBACK_CONFIG.links, ...data.links },
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TestnetContext.Provider value={{ config, live }}>
      {children}
    </TestnetContext.Provider>
  );
}

export function useTestnet() {
  const ctx = useContext(TestnetContext);
  if (!ctx) {
    throw new Error("useTestnet must be used within TestnetProvider");
  }
  return ctx;
}
