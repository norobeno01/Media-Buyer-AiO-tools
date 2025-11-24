"use client";

import { useMemo, useState } from "react";

type Tone = "Neutral" | "Friendly" | "Direct" | "Playful" | "Urgent";
type Platform = "Meta" | "TikTok" | "YouTube" | "Google";
type LengthVariant = "Short" | "Long";
type IndustryPreset = "Custom" | "E-commerce" | "SaaS" | "Healthcare" | "Education" | "Finance" | "Real Estate" | "Travel" | "Gaming" | "Non-profit";

function makeHeadlines(product: string, benefit: string, audience: string, tone: Tone, variant: LengthVariant) {
  const p = product.trim() || "your product";
  const b = benefit.trim() || "a key benefit";
  const a = audience.trim() || "your audience";
  const base = variant === "Short"
    ? [
        `${p}: ${b}`,
        `${b}, made easy with ${p}`,
        `${a} choose ${p}`,
        `Get ${b} fast`,
      ]
    : [
        `${p}: ${b} for ${a}`,
        `${b} — without the hassle. Try ${p}.`,
        `Stop overpaying. ${p} gives you ${b}.`,
        `${a} love ${p} for ${b}.`,
        `Upgrade to ${p}: get ${b} fast.`,
        `Finally, ${b} — thanks to ${p}.`,
      ];
  if (tone === "Urgent") base.push(`Last chance: get ${b} with ${p}.`);
  if (tone === "Playful") base.push(`${p} does ${b}. It’s kind of magic.`);
  return base;
}

function makePrimary(product: string, benefit: string, audience: string, tone: Tone, platform: Platform, variant: LengthVariant) {
  const p = product.trim() || "our product";
  const b = benefit.trim() || "the benefit you want";
  const a = audience.trim() || "people like you";
  const lines = variant === "Short"
    ? [
        `${p} helps ${a} get ${b}. Try it.`,
        `Get ${b} faster with ${p}.`,
      ]
    : [
        `If you're ${a}, ${p} helps you get ${b} without the usual headaches. Tap to see how it works.`,
        `We built ${p} so ${a} can achieve ${b} in days, not weeks. Try it risk-free today.`,
        `${p} is the simple way to get ${b}. No fluff, just results. See what it looks like in action.`,
      ];
  if (platform === "TikTok") lines.push(`POV: You’re ${a} trying to get ${b}. ${p} makes it way easier.`);
  if (tone === "Direct") lines.push(`Get ${b} now with ${p}.`);
  return lines;
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

  const headlines = useMemo(() => makeHeadlines(product, benefit, audience, tone, variant), [product, benefit, audience, tone, variant]);
  const primary = useMemo(() => makePrimary(product, benefit, audience, tone, platform, variant), [product, benefit, audience, tone, platform, variant]);
  const ctas = useMemo(() => makeCtas(platform), [platform]);

  const copyAll = () => {
    const text = [
      `Platform: ${platform} | Tone: ${tone} | Variant: ${variant}`,
      `Product: ${product} | Audience: ${audience} | Benefit: ${benefit}`,
      "\nHeadlines:",
      ...headlines,
      "\nPrimary Text:",
      ...primary,
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Headlines</h2>
            <button onClick={() => navigator.clipboard.writeText(headlines.join('\n'))} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Copy</button>
          </div>
          <ul className="space-y-3">
            {headlines.map((h) => (
              <li key={h} className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(h)}>{h}</li>
            ))}
          </ul>
        </div>
        
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Primary Text</h2>
            <button onClick={() => navigator.clipboard.writeText(primary.join('\n'))} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Copy All</button>
          </div>
          <ul className="space-y-3">
            {primary.map((p) => (
              <li key={p} className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(p)}>{p}</li>
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