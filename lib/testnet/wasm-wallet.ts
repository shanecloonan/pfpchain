/**
 * Lazy-load mfn-wasm (wasm-full) from /testnet/pkg for browser wallet ops.
 */

export type OwnedOutput = {
  one_time_addr_hex: string;
  commit_hex: string;
  value: number;
  blinding_hex: string;
  one_time_spend_hex: string;
  key_image_hex: string;
  tx_id_hex: string;
  output_idx: number;
  height: number;
};

export type WalletSyncState = {
  lastScannedHeight: number;
  ownedKeyImages: string[];
  inputs: OwnedOutput[];
};

type WasmApi = {
  default: (opts?: { module_or_path?: string }) => Promise<unknown>;
  scanBlockTxsHex: (
    seedHex: string,
    height: number,
    txHexes: string[],
    ownedKeyImages: string[],
  ) => string;
  buildTransferJson: (planJson: string) => string;
  /** Smallest fee that clears the mempool's storage-upload underfunded gate (JSON number). */
  uploadMinFee: (
    dataLen: number,
    replication: number,
    feeToTreasuryBps: number,
  ) => string;
  /** Build + sign a storage-anchored upload tx; returns JSON tx_hex/tx_id/data_root/... */
  buildStorageUpload: (
    seedHex: string,
    data: Uint8Array,
    planJson: string,
  ) => string;
  /** MFCL claiming public key (64 hex chars) from wallet seed. */
  claimPubkeyFromSeedHex: (seedHex: string) => string;
};

let wasmPromise: Promise<WasmApi> | null = null;

export async function loadMfnWasm(): Promise<WasmApi> {
  if (!wasmPromise) {
    wasmPromise = (async () => {
      if (typeof window === "undefined") {
        throw new Error("mfn-wasm is browser-only");
      }
      const jsUrl = new URL("/testnet/pkg/mfn_wasm.js", window.location.origin)
        .href;
      const wasmUrl = new URL(
        "/testnet/pkg/mfn_wasm_bg.wasm",
        window.location.origin,
      ).href;
      const mod = (await import(/* webpackIgnore: true */ jsUrl)) as WasmApi;
      await mod.default({ module_or_path: wasmUrl });
      return mod;
    })();
  }
  return wasmPromise;
}

const SYNC_PREFIX = "pw-testnet-wallet-sync:";
const SESSION_KEY = "pw-testnet-wallet-session";
const HISTORY_PREFIX = "pw-testnet-wallet-history:";

/** Parallel per-height fetches when range RPC is unavailable. */
const SCAN_FETCH_CONCURRENCY = 24;
/** Heights per get_block_txs_range call (observer proxy max is 32). */
const SCAN_RANGE_SIZE = 32;
/** Persist sync state every N heights so a stalled tab doesn't lose progress. */
const SCAN_SAVE_EVERY = 32;

export type HistoryEntry = {
  id: string;
  kind: "received" | "sent" | "faucet" | "upload";
  amount: number;
  height?: number;
  txId?: string;
  counterparty?: string;
  at: number;
  note?: string;
};

export function emptySync(): WalletSyncState {
  return { lastScannedHeight: 0, ownedKeyImages: [], inputs: [] };
}

export function loadSync(seedHex: string): WalletSyncState {
  try {
    const raw = localStorage.getItem(SYNC_PREFIX + seedHex);
    if (!raw) return emptySync();
    const p = JSON.parse(raw) as WalletSyncState;
    return {
      lastScannedHeight: Number(p.lastScannedHeight) || 0,
      ownedKeyImages: Array.isArray(p.ownedKeyImages) ? p.ownedKeyImages : [],
      inputs: Array.isArray(p.inputs) ? p.inputs : [],
    };
  } catch {
    return emptySync();
  }
}

export function saveSync(seedHex: string, state: WalletSyncState) {
  localStorage.setItem(SYNC_PREFIX + seedHex, JSON.stringify(state));
}

/**
 * A persisted scan cursor taller than the live chain tip can only happen
 * after the operator wiped and restarted the devnet (its whole history,
 * including this wallet's cached UTXOs, no longer exists). Without this,
 * every later call sees `lastScannedHeight > tipHeight`, decides there is
 * nothing new to scan, and reports the stale pre-reset balance forever.
 */
function dropIfChainReset(
  seedHex: string,
  state: WalletSyncState,
  tipHeight: number,
): WalletSyncState {
  if (state.lastScannedHeight <= tipHeight) return state;
  const fresh = emptySync();
  saveSync(seedHex, fresh);
  return fresh;
}

/**
 * Brand-new wallets have never received funds. Mark them synced through tip
 * so "Refresh balance" only scans blocks after generation (not 1..tip).
 */
export function markSyncedThrough(
  seedHex: string,
  tipHeight: number,
): WalletSyncState {
  const state = dropIfChainReset(seedHex, loadSync(seedHex), tipHeight);
  if (tipHeight > state.lastScannedHeight) {
    state.lastScannedHeight = tipHeight;
    saveSync(seedHex, state);
  }
  return state;
}

/** Load sync state, discarding it first if it predates a devnet chain reset. */
export function loadSyncReconciled(
  seedHex: string,
  tipHeight: number,
): WalletSyncState {
  return dropIfChainReset(seedHex, loadSync(seedHex), tipHeight);
}

export function totalBalance(state: WalletSyncState): number {
  return state.inputs.reduce((s, o) => s + Number(o.value || 0), 0);
}

export function applyBlockScan(
  state: WalletSyncState,
  scan: {
    height?: number;
    txs?: Array<{
      spent_key_images?: string[];
      recovered?: OwnedOutput[];
    }>;
  },
): OwnedOutput[] {
  const byAddr = new Map(
    state.inputs.map((o) => [o.one_time_addr_hex.toLowerCase(), o]),
  );
  const kiSet = new Set(state.ownedKeyImages.map((k) => k.toLowerCase()));
  const newlyReceived: OwnedOutput[] = [];

  for (const tx of scan.txs || []) {
    for (const ki of tx.spent_key_images || []) {
      const k = ki.toLowerCase();
      kiSet.add(k);
      state.inputs = state.inputs.filter(
        (o) => o.key_image_hex.toLowerCase() !== k,
      );
    }
    for (const o of tx.recovered || []) {
      const addr = o.one_time_addr_hex.toLowerCase();
      if (!byAddr.has(addr)) {
        state.inputs.push(o);
        byAddr.set(addr, o);
        newlyReceived.push(o);
      }
      kiSet.add(o.key_image_hex.toLowerCase());
    }
  }

  state.ownedKeyImages = [...kiSet];
  if (scan.height != null) {
    state.lastScannedHeight = Math.max(
      state.lastScannedHeight,
      Number(scan.height),
    );
  }
  return newlyReceived;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        results[i] = await fn(items[i]!);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

/** Trust-the-observer scan (no BLS light-client gate) for public testnet UI. */
export async function syncWalletLite(opts: {
  seedHex: string;
  fromHeight: number;
  toHeight: number;
  state: WalletSyncState;
  rpc: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
  onProgress?: (done: number, total: number, height: number) => void;
}): Promise<{ recovered: number; balance: number }> {
  const { seedHex, toHeight, state, rpc, onProgress } = opts;
  let fromHeight = opts.fromHeight;
  if (fromHeight < 1) fromHeight = 1;
  if (toHeight < fromHeight) {
    return { recovered: 0, balance: totalBalance(state) };
  }

  const wasm = await loadMfnWasm();
  let recovered = 0;
  const total = toHeight - fromHeight + 1;
  let done = 0;
  let useRange = true;

  async function fetchHeights(
    batch: number[],
  ): Promise<Array<{ h: number; txHexes: string[] }>> {
    if (useRange && batch.length > 0) {
      try {
        const from = batch[0]!;
        const to = batch[batch.length - 1]!;
        const page = await rpc<{
          blocks?: Array<{
            height?: number;
            txs?: Array<{ tx_hex?: string }>;
          }>;
        }>("get_block_txs_range", { from_height: from, to_height: to });
        const byH = new Map<number, string[]>();
        for (const b of page.blocks || []) {
          const h = Number(b.height);
          if (!Number.isFinite(h)) continue;
          byH.set(
            h,
            (b.txs || [])
              .map((t) => t.tx_hex)
              .filter(Boolean) as string[],
          );
        }
        return batch.map((h) => ({ h, txHexes: byH.get(h) || [] }));
      } catch {
        useRange = false;
      }
    }
    return mapPool(batch, SCAN_FETCH_CONCURRENCY, async (h) => {
      const body = await rpc<{
        txs?: Array<{ tx_hex?: string }>;
      }>("get_block_txs", { height: h });
      const txHexes = (body.txs || [])
        .map((t) => t.tx_hex)
        .filter(Boolean) as string[];
      return { h, txHexes };
    });
  }

  // Prefer batched range RPC (one Vercel hop / N heights); wasm stays sequential.
  for (let h0 = fromHeight; h0 <= toHeight; h0 += SCAN_RANGE_SIZE) {
    const h1 = Math.min(toHeight, h0 + SCAN_RANGE_SIZE - 1);
    const batch: number[] = [];
    for (let h = h0; h <= h1; h++) batch.push(h);
    const fetched = await fetchHeights(batch);
    fetched.sort((a, b) => a.h - b.h);
    for (const { h, txHexes } of fetched) {
      const scan = JSON.parse(
        wasm.scanBlockTxsHex(seedHex, h, txHexes, state.ownedKeyImages),
      ) as {
        height?: number;
        txs?: Array<{
          spent_key_images?: string[];
          recovered?: OwnedOutput[];
        }>;
      };
      const neu = applyBlockScan(state, { ...scan, height: h });
      recovered += neu.length;
      for (const o of neu) {
        pushHistory(seedHex, {
          id: `${o.tx_id_hex}:${o.output_idx}`,
          kind: "received",
          amount: o.value,
          height: o.height,
          txId: o.tx_id_hex,
          at: Date.now(),
        });
      }
      done += 1;
      onProgress?.(done, total, h);
    }

    if (done % SCAN_SAVE_EVERY === 0 || h1 >= toHeight) {
      saveSync(seedHex, state);
    }
  }

  saveSync(seedHex, state);
  return { recovered, balance: totalBalance(state) };
}

export function loadHistory(seedHex: string): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_PREFIX + seedHex);
    if (!raw) return [];
    const arr = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function pushHistory(seedHex: string, entry: HistoryEntry) {
  const cur = loadHistory(seedHex);
  if (cur.some((e) => e.id === entry.id)) return;
  cur.unshift(entry);
  localStorage.setItem(
    HISTORY_PREFIX + seedHex,
    JSON.stringify(cur.slice(0, 80)),
  );
}

export type SessionWallet = {
  seedHex: string;
  address: string;
  viewPubHex: string;
  spendPubHex: string;
};

export function loadSession(): SessionWallet | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SessionWallet;
    if (!p?.seedHex || !p?.address) return null;
    return p;
  } catch {
    return null;
  }
}

export function saveSession(w: SessionWallet) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(w));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
