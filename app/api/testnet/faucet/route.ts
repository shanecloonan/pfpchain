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

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("job");
  const upstream = jobId ? jobUrl(jobId) : healthUrl();
  try {
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: `faucet upstream unreachable: ${msg}` },
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
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        error: `faucet upstream unreachable: ${msg}`,
        hint: "VPS faucet may be down — check http://5.161.201.73:8788/health",
      },
      { status: 502 },
    );
  }
}
