import { NextRequest } from "next/server";

function extractMetaDescription(html: string): string | null {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title>([^<]{0,300})<\/title>/i);
  return m ? m[1].trim() : null;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countRegex(html: string, re: RegExp): number {
  const matches = html.match(re);
  return matches ? matches.length : 0;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400 });
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "MBA-Tools/1.0 (LandingAnalyzer)" },
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Fetch failed: ${res.status}` }), { status: 502 });
    }
    const html = await res.text();

    // Basic content and SEO
    const title = extractTitle(html);
    const metaDescription = extractMetaDescription(html);
    const text = stripTags(html);
    const wordCount = text ? text.split(" ").filter(Boolean).length : 0;
    const h1Count = countRegex(html, /<h1\b[^>]*>/gi);

    // CTA detection
    const ctaKeywords = [
      "buy","shop","start","get","subscribe","download","contact","request","trial","free","add to cart","book","order now","learn more","sign up","join"
    ];
    const htmlLower = html.toLowerCase();
    const ctaHits = ctaKeywords.filter(k => htmlLower.includes(k));
    const buttonCount = countRegex(html, /<button\b[^>]*>/gi) + countRegex(html, /<a\b[^>]*>/gi);

    // Trust & social proof
    const trustKeywords = ["review","testimonial","rating","stars","visa","mastercard","paypal","secure","ssl","trust","guarantee","warranty"];
    const trustHits = trustKeywords.filter(k => htmlLower.includes(k));

    // Accessibility
    const imgCount = countRegex(html, /<img\b[^>]*>/gi);
    const imgWithAltCount = countRegex(html, /<img\b[^>]*alt=["'][^"']+["'][^>]*>/gi);
    const altRatio = imgCount > 0 ? imgWithAltCount / imgCount : 1;

    // Forms / lead capture
    const formCount = countRegex(html, /<form\b[^>]*>/gi);
    const emailInputCount = countRegex(html, /<input\b[^>]*type=["']email["']/gi);

    // Tech weight / external scripts
    const scriptCount = countRegex(html, /<script\b[^>]*>/gi);
    const thirdPartyHosts = [
      "googletagmanager","google-analytics","facebook","tiktok","hotjar","stripe","paypal","shopify","doubleclick","twitter","linkedin","segment","intercom"
    ];
    const thirdPartyScripts = thirdPartyHosts.filter(h => htmlLower.includes(h));

    // Simple scoring heuristics (0-100 per category)
    const scoreContent = Math.min(100, (wordCount >= 300 ? 100 : Math.round((wordCount / 300) * 100)) + (h1Count > 0 ? 10 : 0));
    const scoreSEO = Math.min(100,
      (title ? Math.min(60, title.length) : 20) + (metaDescription ? Math.min(40, metaDescription.length / 2) : 10)
    );
    const scoreCTA = Math.min(100, ctaHits.length * 15 + Math.min(40, buttonCount * 5));
    const scoreTrust = Math.min(100, trustHits.length * 20);
    const scoreAccessibility = Math.round(altRatio * 100);
    const scoreTech = Math.max(20, 100 - Math.min(70, scriptCount * 5 + thirdPartyScripts.length * 10));

    const suggestions: string[] = [];
    if (!title || title.length < 20) suggestions.push("Improve page title length and clarity.");
    if (!metaDescription || metaDescription.length < 50) suggestions.push("Add or expand meta description (~140 chars ideal).");
    if (wordCount < 300) suggestions.push("Increase on-page copy to at least ~300 words.");
    if (h1Count === 0) suggestions.push("Add a clear H1 headline above the fold.");
    if (ctaHits.length === 0) suggestions.push("Add clear CTA buttons/links with action language.");
    if (formCount === 0 && emailInputCount === 0) suggestions.push("Add a lead capture form or email subscription.");
    if (altRatio < 0.8) suggestions.push("Ensure images include descriptive alt text for accessibility.");
    if (scriptCount > 20) suggestions.push("Reduce number of scripts to improve performance.");
    if (thirdPartyScripts.length > 5) suggestions.push("Audit third-party tags to reduce bloat.");

    const result = {
      title,
      metaDescription,
      wordCount,
      h1Count,
      ctaHits,
      buttonCount,
      trustHits,
      imgCount,
      imgWithAltCount,
      altRatio,
      formCount,
      emailInputCount,
      scriptCount,
      thirdPartyScripts,
      scores: {
        content: scoreContent,
        seo: scoreSEO,
        cta: scoreCTA,
        trust: scoreTrust,
        accessibility: scoreAccessibility,
        tech: scoreTech,
      },
      suggestions,
    };

    return new Response(JSON.stringify({ ok: true, analysis: result }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Analyze failed" }), { status: 500 });
  }
}