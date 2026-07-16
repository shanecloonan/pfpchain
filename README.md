# pfpchain

Public homepage for the **Permawrite** experimental testnet (ported from the Cloonan Group `/testnet` page).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What is included

- Homepage: full Permawrite public testnet UI (wallet, live stats, join guides)
- `/testnet` route: same page
- `/api/testnet/rpc` — HTTPS bridge to the observer JSON-RPC proxy
- `/api/testnet/faucet` — faucet HTTP bridge
- `/testnet/config.json` + `mfn-wasm` package for browser wallet ops

Optional env overrides:

- `MFND_RPC_PROXY_UPSTREAM` / `MFND_OBSERVER_RPC_URL`
- `MFND_FAUCET_UPSTREAM` / `NEXT_PUBLIC_MFND_FAUCET_URL`
- `NEXT_PUBLIC_MFND_RPC_PROXY_URL`
