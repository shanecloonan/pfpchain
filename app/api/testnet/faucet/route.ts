import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin HTTPS bridge → VPS faucet-http.mjs (async jobs).
 *
 * POST starts a claim and returns { job_id } quickly.
 * GET ?job=<id> polls status. GET without job = upstream /health.
 */
const DEFAULT_BASE = "http://5.161.201.73:8788";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Short — claims run async on the VPS; this route only proxies. */
export const maxDuration = 30;

function baseUrl(): string {
  const raw =
    process.env.MFND_FAUCET_UPSTREAM?.trim() ||
    process.env.NEXT_PUBLIC_MFND_FAUCET_URL?.trim() ||
    `${DEFAULT_BASE}/faucet`;
  return raw.replace(/\/faucet\/?$/, "");
}

function faucetUrl(): string {
  return `${baseUrl()}/faucet`;
}

function jobUrl(id: string): string {
  return `${baseUrl()}/faucet/job?id=${encodeURIComponent(id)}`;
}

function healthUrl(): string {
  return `${baseUrl()}/health`;
}

function looksInternal(text: string): boolean {
  return /\/(?:root|home|opt|usr|var|tmp)\b|mfn-cli|exited \d|target\/release/i.test(
    text,
  );
}

/** Browser-facing copy. Raw upstream text is logged, never returned. */
function friendlyFaucetError(raw: string): string {
  if (/owned UTXO count|privacy floor/i.test(raw)) {
    return "The faucet is short a second spendable coin and is refilling. Try again in a minute.";
  }
  if (/timeout/i.test(raw)) {
    return "The faucet took too long. Try again in a minute.";
  }
  if (/cooldown/i.test(raw)) return raw;
  if (/busy/i.test(raw)) return "The faucet is busy. Try again in a minute.";
  if (looksInternal(raw)) {
    return "The faucet could not complete the transfer. Try again in a minute.";
  }
  return raw;
}

function sanitizeFaucetBody(text: string): string {
  try {
    const data = JSON.parse(text) as Record<string, unknown>;
    let changed = false;
    if (typeof data.error === "string") {
      const next = friendlyFaucetError(data.error);
      if (next !== data.error) {
        console.error("faucet upstream error:", data.error);
        data.error = next;
        changed = true;
      }
    }
    if (typeof data.hint === "string" && looksInternal(data.hint)) {
      console.error("faucet upstream hint:", data.hint);
      delete data.hint;
      changed = true;
    }
    return changed ? JSON.stringify(data) : text;
  } catch {
    if (looksInternal(text)) {
      console.error("faucet upstream body:", text.slice(0, 500));
      return JSON.stringify({
        ok: false,
        error: "The faucet could not complete the transfer. Try again in a minute.",
      });
    }
    return text;
  }
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("job");
  const upstream = jobId ? jobUrl(jobId) : healthUrl();
  try {
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const text = sanitizeFaucetBody(await res.text());
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("faucet upstream unreachable:", msg);
    return NextResponse.json(
      {
        ok: false,
        error: "The faucet is unreachable. Try again in a minute.",
      },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  try {
    // Start job only — must return fast so Vercel never hits platform limits.
    const res = await fetch(faucetUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const text = sanitizeFaucetBody(await res.text());
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("faucet upstream unreachable:", msg);
    return NextResponse.json(
      {
        ok: false,
        error: "The faucet is unreachable. Try again in a minute.",
      },
      { status: 502 },
    );
  }
}
