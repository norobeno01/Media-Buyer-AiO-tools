import { NextRequest } from "next/server";
import { safeFetchText } from "@/lib/safeFetch";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400 });
    }
    const { text: html } = await safeFetchText(url, { "User-Agent": "MBA-Tools/1.0" });
    const hasFB = /fbq\s*\(/i.test(html) || /facebook\.com\/tr\//i.test(html);
    const hasGA = /gtag\s*\(/i.test(html) || /google-analytics\.com\//i.test(html) || /googletagmanager\.com/i.test(html);
    const hasTikTok = /ttq\s*\./i.test(html) || /analytics\.tiktok\.com/i.test(html);
    const hasPixel = {
      facebook: hasFB,
      google: hasGA,
      tiktok: hasTikTok,
    };
    return new Response(JSON.stringify({ ok: true, pixels: hasPixel }), { status: 200 });
  } catch (e) {
    const blocked = e instanceof Error && /allowed|Invalid URL/.test(e.message);
    return new Response(JSON.stringify({ error: blocked && e instanceof Error ? e.message : "Fetch failed" }), { status: blocked ? 400 : 500 });
  }
}