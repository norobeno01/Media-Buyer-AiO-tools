"use client";

import { useEffect, useMemo, useState } from "react";

type Tone = "Neutral" | "Friendly" | "Direct" | "Playful" | "Urgent";
type Platform = "Meta" | "TikTok" | "YouTube" | "Google";
type LengthVariant = "Short" | "Long";
type IndustryPreset = "Custom" | "E-commerce" | "SaaS" | "Healthcare" | "Education" | "Finance" | "Real Estate" | "Travel" | "Gaming" | "Non-profit";

type Scored = { text: string; score: number; reasons: string[] };

const LEXICONS: Record<IndustryPreset, string[]> = {
  "Custom": [],
  "E-commerce": ["eco-friendly","sustainable","discount","free shipping","bundle","limited","new","shop","deal"],
  "SaaS": ["automate","workflow","dashboard","integration","ROI","scale","secure","trial","report"],
  "Healthcare": ["telehealth","licensed","clinic","care","secure","HIPAA","appointment","doctor","remote"],
  "Education": ["course","lessons","certificate","curriculum","learn","practice","coach","mentor","module"],
  "Finance": ["budget","savings","APR","fees","statement","track","plan","forecast","cashflow"],
  "Real Estate": ["listings","mortgage","offer","closing","inventory","neighborhood","tour","agent","contract"],
  "Travel": ["itinerary","getaway","booking","deals","weekend","guide","stay","flight","adventure"],
  "Gaming": ["guild","raid","loot","strategy","build","rank","quest","match","win"],
  "Non-profit": ["donate","impact","community","volunteer","support","fund","local","change","cause"],
};

function rank(lines: string[], opts: { platform: Platform; tone: Tone; variant: LengthVariant; product: string; benefit: string; audience: string; type: "headline" | "primary"; lexicon: string[] }): Scored[] {
  const verbs = ["Get","Learn","Discover","Shop","Try","See","Start","Unlock","Boost","Save","Build","Grow","Join","Explore","Upgrade"];
  const power = ["fast","simple","easy","proven","new","smart","best","free","today","now","instant","risk-free","limited","last chance"];
  const ideal = (() => {
    if (opts.type === "headline") {
      if (opts.platform === "TikTok") return opts.variant === "Short" ? 35 : 45;
      if (opts.platform === "Google") return opts.variant === "Short" ? 30 : 40;
      return opts.variant === "Short" ? 40 : 55;
    }
    if (opts.platform === "TikTok") return opts.variant === "Short" ? 80 : 140;
    if (opts.platform === "Google") return opts.variant === "Short" ? 70 : 130;
    return opts.variant === "Short" ? 90 : 180;
  })();
  const dedup = new Set<string>();
  const scored = lines.map((t) => {
    const text = t.trim().replace(/\s+/g, " ");
    const key = text.toLowerCase();
    if (dedup.has(key)) return { text, score: -1, reasons: [] };
    dedup.add(key);
    let s = 0;
    const reasons: string[] = [];
    const len = text.length;
    const within = Math.max(0, 1 - Math.abs(len - ideal) / Math.max(ideal, 1));
    s += within * 4;
    reasons.push(`length ${len} vs target ${ideal}`);
    if (text.toLowerCase().includes(opts.product.trim().toLowerCase())) { s += 2; reasons.push("mentions product"); }
    if (text.toLowerCase().includes(opts.benefit.trim().toLowerCase())) { s += 3; reasons.push("mentions benefit"); }
    if (text.toLowerCase().includes(opts.audience.trim().toLowerCase())) { s += 1; reasons.push("mentions audience"); }
    const first = text.split(/\W+/)[0]?.toLowerCase() || "";
    if (verbs.map((v) => v.toLowerCase()).includes(first)) { s += 2; reasons.push("starts with action verb"); }
    if (/[0-9%]/.test(text)) { s += 2; reasons.push("uses numbers"); }
    const hasPower = power.some((w) => text.toLowerCase().includes(w));
    if (hasPower) { s += 1.5; reasons.push("power words"); }
    if (opts.tone === "Urgent" && /(now|today|last chance)/i.test(text)) { s += 1.5; reasons.push("urgent cue"); }
    if (opts.platform === "Google" && /(clickbait|magic)/i.test(text)) { s -= 1.5; reasons.push("google penalty"); }
    const hasLex = opts.lexicon.some((w) => text.toLowerCase().includes(w.toLowerCase()));
    if (hasLex) { s += 1.5; reasons.push("industry terms"); }
    if (len > ideal + 40) { s -= 2; reasons.push("too long"); }
    return { text, score: Number(s.toFixed(2)), reasons };
  }).filter((x) => x.score >= 0);
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function makeHeadlines(product: string, benefit: string, audience: string, tone: Tone, variant: LengthVariant, lexicon: string[]) {
  const p = product.trim() || "your product";
  const b = benefit.trim() || "a key benefit";
  const a = audience.trim() || "your audience";
  const base = variant === "Short"
    ? [
      `${p}: ${b}`,
      `${b}, made easy with ${p}`,
      `${a} choose ${p}`,
      `Get ${b} fast`,
      `Discover ${b} with ${p}`,
      `New: ${p} for ${a}`,
    ]
    : [
      `${p}: ${b} for ${a}`,
      `${b} — without the hassle. Try ${p}.`,
      `Stop overpaying. ${p} gives you ${b}.`,
      `${a} love ${p} for ${b}.`,
      `Upgrade to ${p}: get ${b} fast.`,
      `Finally, ${b} — thanks to ${p}.`,
      `Get ${b} in days, not weeks, with ${p}.`,
    ];
  if (tone === "Urgent") base.push(`Last chance: get ${b} with ${p}.`);
  if (tone === "Playful") base.push(`${p} does ${b}. It’s kind of magic.`);
  const extra = lexicon.slice(0, 5).map((w) => `${w} ${b} with ${p}`);
  return [...base, ...extra];
}

function makePrimary(product: string, benefit: string, audience: string, tone: Tone, platform: Platform, variant: LengthVariant, lexicon: string[]) {
  const p = product.trim() || "our product";
  const b = benefit.trim() || "the benefit you want";
  const a = audience.trim() || "people like you";
  const lines = variant === "Short"
    ? [
      `${p} helps ${a} get ${b}. Try it.`,
      `Get ${b} faster with ${p}.`,
      `Discover how ${p} gives ${a} ${b}.`,
    ]
    : [
      `If you're ${a}, ${p} helps you get ${b} without the usual headaches. Tap to see how it works.`,
      `We built ${p} so ${a} can achieve ${b} in days, not weeks. Try it risk-free today.`,
      `${p} is the simple way to get ${b}. No fluff, just results. See what it looks like in action.`,
      `${a} use ${p} to get ${b} quickly. See the difference today.`,
    ];
  if (platform === "TikTok") lines.push(`POV: You’re ${a} trying to get ${b}. ${p} makes it way easier.`);
  if (tone === "Direct") lines.push(`Get ${b} now with ${p}.`);
  const extra = lexicon.slice(0, 5).map((w) => `${p} brings ${w} to ${a} so you get ${b}.`);
  return [...lines, ...extra];
}

function makeCtas(platform: Platform) {
  const common = ["Learn More", "Shop Now", "Get Started", "Try It", "See Demo"];
  if (platform === "Google") return ["Learn More", "Visit Site", "Get Quote"];
  if (platform === "TikTok") return ["Watch How", "Try It", "Shop Now"];
  return common;
}

export default function CopywritingToolPage() {
  const [platform, setPlatform] = useState<Platform>("Meta");
  const [tone, setTone] = useState<Tone>("Neutral");
  const [product, setProduct] = useState<string>("Running Shoes");
  const [audience, setAudience] = useState<string>("busy parents");
  const [benefit, setBenefit] = useState<string>("comfort all day");
  const [variant, setVariant] = useState<LengthVariant>("Short");
  const [preset, setPreset] = useState<IndustryPreset>("Custom");
  const [showRationale, setShowRationale] = useState<boolean>(false);
  const [useAI, setUseAI] = useState<boolean>(false);
  const [aiHeadlines, setAiHeadlines] = useState<string[]>([]);
  const [aiPrimary, setAiPrimary] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const applyPreset = (p: IndustryPreset) => {
    setPreset(p);
    switch (p) {
      case "E-commerce":
        setProduct("Eco-friendly water bottle");
        setAudience("health-conscious Millennials");
        setBenefit("stay hydrated sustainably");
        setTone("Friendly");
        break;
      case "SaaS":
        setProduct("Workflow automation platform");
        setAudience("Ops managers");
        setBenefit("save 10+ hours/week");
        setTone("Direct");
        break;
      case "Healthcare":
        setProduct("Telehealth app");
        setAudience("busy professionals");
        setBenefit("see a doctor from anywhere");
        setTone("Neutral");
        break;
      case "Education":
        setProduct("Language learning course");
        setAudience("adult learners");
        setBenefit("speak confidently in 30 days");
        setTone("Friendly");
        break;
      case "Finance":
        setProduct("Budgeting app");
        setAudience("new parents");
        setBenefit("cut monthly spend by 15%");
        setTone("Direct");
        break;
      case "Real Estate":
        setProduct("Home finder service");
        setAudience("first-time buyers");
        setBenefit("discover homes under budget");
        setTone("Neutral");
        break;
      case "Travel":
        setProduct("Weekend trip planner");
        setAudience("couples");
        setBenefit("plan perfect getaways");
        setTone("Playful");
        break;
      case "Gaming":
        setProduct("MMO guild assistant");
        setAudience("raid leaders");
        setBenefit("organize events effortlessly");
        setTone("Urgent");
        break;
      case "Non-profit":
        setProduct("Donation platform");
        setAudience("local supporters");
        setBenefit("fund community projects");
        setTone("Friendly");
        break;
      case "Custom":
      default:
        // Leave current inputs as-is
        break;
    }
  };

  const lexicon = LEXICONS[preset] || [];
  const baseHeadlines = useMemo(() => makeHeadlines(product, benefit, audience, tone, variant, lexicon), [product, benefit, audience, tone, variant, preset]);
  const basePrimary = useMemo(() => makePrimary(product, benefit, audience, tone, platform, variant, lexicon), [product, benefit, audience, tone, platform, variant, preset]);
  const headlines = useMemo(() => rank(useAI && aiHeadlines.length ? aiHeadlines : baseHeadlines, { platform, tone, variant, product, benefit, audience, type: "headline", lexicon }), [useAI, aiHeadlines, baseHeadlines, platform, tone, variant, product, benefit, audience]);
  const primary = useMemo(() => rank(useAI && aiPrimary.length ? aiPrimary : basePrimary, { platform, tone, variant, product, benefit, audience, type: "primary", lexicon }), [useAI, aiPrimary, basePrimary, platform, tone, variant, product, benefit, audience]);
  const ctas = useMemo(() => makeCtas(platform), [platform]);

  useEffect(() => {
    if (!useAI) { setAiHeadlines([]); setAiPrimary([]); return; }
    const makePrompt = (kind: "headline" | "primary") => (
      `Platform: ${platform}\nTone: ${tone}\nLength: ${variant}\nProduct: ${product}\nAudience: ${audience}\nBenefit: ${benefit}\nLexicon: ${lexicon.join(", ")}\nReturn ${kind}s only, one per line, no numbering, 10 lines.`
    );
    const run = async () => {
      try {
        setAiLoading(true);
        const hRes = await fetch("/api/openrouter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: makePrompt("headline") }) });
        const hJson = await hRes.json();
        const hText = String(hJson?.text || "");
        const hLines = hText.split(/\r?\n/).map((x: string) => x.trim()).filter(Boolean);
        const pRes = await fetch("/api/openrouter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: makePrompt("primary") }) });
        const pJson = await pRes.json();
        const pText = String(pJson?.text || "");
        const pLines = pText.split(/\r?\n/).map((x: string) => x.trim()).filter(Boolean);
        setAiHeadlines(hLines);
        setAiPrimary(pLines);
      } catch {
        setAiHeadlines([]);
        setAiPrimary([]);
      } finally {
        setAiLoading(false);
      }
    };
    run();
  }, [useAI, platform, tone, variant, product, audience, benefit, preset]);

  const copyAll = () => {
    const text = [
      `Platform: ${platform} | Tone: ${tone} | Variant: ${variant}`,
      `Product: ${product} | Audience: ${audience} | Benefit: ${benefit}`,
      "\nHeadlines:",
      ...headlines.map((h) => h.text),
      "\nPrimary Text:",
      ...primary.map((p) => p.text),
      "\nCTAs:",
      ctas.join(", "),
    ].join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-full">Creative</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Copywriting Helper</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Generate headlines, primary text, and CTAs tailored by platform, tone, and audience. Start with defaults and tweak quickly.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Campaign Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Industry Preset</label>
            <select value={preset} onChange={(e) => applyPreset(e.target.value as IndustryPreset)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Custom</option>
              <option>E-commerce</option>
              <option>SaaS</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>Finance</option>
              <option>Real Estate</option>
              <option>Travel</option>
              <option>Gaming</option>
              <option>Non-profit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Meta</option>
              <option>TikTok</option>
              <option>YouTube</option>
              <option>Google</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Neutral</option>
              <option>Friendly</option>
              <option>Direct</option>
              <option>Playful</option>
              <option>Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Copy Length</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as LengthVariant)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Short</option>
              <option>Long</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Audience</label>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Product</label>
            <input value={product} onChange={(e) => setProduct(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Primary Benefit</label>
            <input value={benefit} onChange={(e) => setBenefit(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={showRationale} onChange={(e) => setShowRationale(e.target.checked)} />
            Show rationale
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={useAI} onChange={(e) => setUseAI(e.target.checked)} />
            Use AI (fallback if unavailable)
          </label>
          {useAI && aiLoading && (
            <span className="text-xs text-blue-600 dark:text-blue-400">Generating…</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Headlines</h2>
            <button onClick={() => navigator.clipboard.writeText(headlines.map((h) => h.text).join('\n'))} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Copy</button>
          </div>
          <ul className="space-y-3">
            {headlines.map((h) => (
              <li key={h.text} className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <div className="flex items-center justify-between">
                  <button className="text-left flex-1" onClick={() => navigator.clipboard.writeText(h.text)}>{h.text}</button>
                  <span className="ml-3 text-xs px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">{h.score.toFixed(2)}</span>
                </div>
                {showRationale && (
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{h.reasons.join(" • ")}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Primary Text</h2>
            <button onClick={() => navigator.clipboard.writeText(primary.map((p) => p.text).join('\n'))} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Copy All</button>
          </div>
          <ul className="space-y-3">
            {primary.map((p) => (
              <li key={p.text} className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <div className="flex items-center justify-between">
                  <button className="text-left flex-1" onClick={() => navigator.clipboard.writeText(p.text)}>{p.text}</button>
                  <span className="ml-3 text-xs px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">{p.score.toFixed(2)}</span>
                </div>
                {showRationale && (
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{p.reasons.join(" • ")}</div>
                )}
              </li>
            ))}
          </ul>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">CTAs</h3>
              <button onClick={() => navigator.clipboard.writeText(ctas.join(', '))} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Copy All</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ctas.map((cta) => (
                <button key={cta} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => navigator.clipboard.writeText(cta)}>
                  {cta}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
