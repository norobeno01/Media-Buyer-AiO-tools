import { lookup } from "node:dns";
import { lookup as lookupAll } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
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

/**
 * DNS lookup used by the actual connection. It resolves the name, rejects private results and hands the
 * validated address to the socket, so the address that was checked is the address that is connected to.
 */
function guardedLookup(hostname: string, options: any, cb: any) {
  lookup(hostname, { all: true }, (err, addresses) => {
    if (err) return cb(err);
    const list = addresses as { address: string; family: number }[];
    if (list.length === 0 || list.some((a) => isPrivateAddress(a.address))) {
      return cb(new Error("Private or local addresses are not allowed"));
    }
    if (options && options.all) return cb(null, list);
    return cb(null, list[0].address, list[0].family);
  });
}

type RawResponse = { status: number; statusText: string; location: string | null; body: Buffer };

function rawRequest(url: URL, headers: Record<string, string>, maxBytes: number): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === "https:" ? https : http;
    const req = mod.request(
      url,
      { method: "GET", headers, lookup: guardedLookup as any, timeout: TIMEOUT_MS },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (c: Buffer) => {
          size += c.length;
          if (size <= maxBytes) chunks.push(c);
          else if (size > maxBytes * 2) res.destroy();
        });
        const done = () =>
          resolve({
            status: res.statusCode ?? 0,
            statusText: res.statusMessage ?? "",
            location: (res.headers.location as string | undefined) ?? null,
            body: Buffer.concat(chunks).subarray(0, maxBytes),
          });
        res.on("end", done);
        res.on("close", done);
      }
    );
    req.on("timeout", () => req.destroy(new Error("Timed out")));
    req.on("error", reject);
    req.end();
  });
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
  const addresses = net.isIP(host) ? [{ address: host }] : await lookupAll(host, { all: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error("Private or local addresses are not allowed");
  }
  return url;
}

/**
 * Fetches a public web page. Each redirect hop is re-validated, the request has a
 * timeout and the body is capped, so the server cannot be pointed at internal hosts.
 * The connection itself uses a guarded DNS lookup, so the checked address is the one connected to
 * (no separate resolve-then-fetch gap). Proxies via environment variables are not used.
 */
export async function safeFetchText(
  raw: string,
  headers: Record<string, string> = {}
): Promise<{ status: number; ok: boolean; text: string; finalUrl: string }> {
  let current = await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await rawRequest(current, headers, MAX_BYTES);
    if (res.status >= 300 && res.status < 400 && res.location) {
      current = await assertPublicUrl(new URL(res.location, current).toString());
      continue;
    }
    return { status: res.status, ok: res.status >= 200 && res.status < 300, text: res.body.toString("utf8"), finalUrl: current.toString() };
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
    let res: RawResponse;
    try {
      res = await rawRequest(current, { "User-Agent": "MBA-Tools/1.0 (RedirectTester)" }, 1024);
    } catch {
      chain.push({ url: current.toString(), status: 0, statusText: "Connection failed or blocked" });
      errors.push("Connection failed, timed out or blocked");
      break;
    }
    chain.push({ url: current.toString(), status: res.status, statusText: res.statusText });
    const location = res.location;
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
