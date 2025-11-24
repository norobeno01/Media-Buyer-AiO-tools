import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400 });
    }
    const res = await fetch(url, { headers: { "User-Agent": "MBA-Tools/1.0" } });
    const html = await res.text();
    const hasFB = /fbq\s*\(/i.test(html) || /facebook\.com\/tr\//i.test(html);
    const hasGA = /gtag\s*\(/i.test(html) || /google-analytics\.com\//i.test(html) || /googletagmanager\.com/i.test(html);
    const hasTikTok = /ttq\s*\./i.test(html) || /analytics\.tiktok\.com/i.test(html);
    const hasPixel = {
      facebook: hasFB,
      google: hasGA,
      tiktok: hasTikTok,
    };
    return new Response(JSON.stringify({ ok: true, pixels: hasPixel }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Fetch failed" }), { status: 500 });
  }
}