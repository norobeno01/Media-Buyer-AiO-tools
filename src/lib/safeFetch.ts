import { lookup } from "node:dns/promises";
import net from "node:net";

const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 2_000_000;

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  if (v.startsWith("::ffff:")) {
    const mapped = v.slice(7);
    return net.isIPv4(mapped) ? isPrivateIPv4(mapped) : true;
  }
  return v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb");
}

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true;
}

/** Throws if the URL is not a public http(s) address. */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }
  if (url.username || url.password) {
    throw new Error("URLs with credentials are not allowed");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
    throw new Error("Local addresses are not allowed");
  }
  const addresses = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error("Private or local addresses are not allowed");
  }
  return url;
}

/**
 * Fetches a public web page. Each redirect hop is re-validated, the request has a
 * timeout and the body is capped, so the server cannot be pointed at internal hosts.
 * Note: DNS is resolved once for validation and again by fetch, so a hostile DNS server
 * could still race the check. For stronger isolation run the app without access to internal networks.
 */
export async function safeFetchText(
  raw: string,
  headers: Record<string, string> = {}
): Promise<{ status: number; ok: boolean; text: string; finalUrl: string }> {
  let current = await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current, {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      current = await assertPublicUrl(new URL(res.headers.get("location")!, current).toString());
      continue;
    }
    const buf = await res.arrayBuffer();
    const text = new TextDecoder().decode(buf.slice(0, MAX_BYTES));
    return { status: res.status, ok: res.ok, text, finalUrl: current.toString() };
  }
  throw new Error("Too many redirects");
}

export type RedirectHop = { url: string; status: number; statusText: string };

/** Follows redirects one hop at a time and returns the chain. Every hop must be a public http(s) URL. */
export async function traceRedirects(raw: string): Promise<{
  originalUrl: string;
  finalUrl: string;
  redirectChain: RedirectHop[];
  totalRedirects: number;
  errors: string[];
}> {
  const errors: string[] = [];
  const chain: RedirectHop[] = [];
  let current = await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let res: Response;
    try {
      res = await fetch(current, {
        method: "GET",
        headers: { "User-Agent": "MBA-Tools/1.0 (RedirectTester)" },
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      chain.push({ url: current.toString(), status: 0, statusText: "Connection failed" });
      errors.push("Connection failed or timed out");
      break;
    }
    chain.push({ url: current.toString(), status: res.status, statusText: res.statusText });
    await res.body?.cancel();
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      if (hop === MAX_REDIRECTS) {
        errors.push(`More than ${MAX_REDIRECTS} redirects, stopped following`);
        break;
      }
      current = await assertPublicUrl(new URL(location, current).toString());
      continue;
    }
    if (res.status >= 400) errors.push(`Final destination returned HTTP ${res.status}`);
    break;
  }
  return {
    originalUrl: raw,
    finalUrl: chain[chain.length - 1]?.url ?? raw,
    redirectChain: chain,
    totalRedirects: Math.max(chain.length - 1, 0),
    errors,
  };
}
