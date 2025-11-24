"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

function toSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function cap(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trim() + "…";
}

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export default function SEOToolsPage() {
  const [primary, setPrimary] = useState("running shoes");
  const [secondary, setSecondary] = useState<string>("comfort, marathon, breathable");
  const [brand, setBrand] = useState<string>("StridePro");
  const [siteUrl, setSiteUrl] = useState<string>("https://example.com");

  const keywords = useMemo(() => {
    const parts = [primary, ...secondary.split(",")].map((s) => s.trim()).filter(Boolean);
    return unique(parts);
  }, [primary, secondary]);

  const titles = useMemo(() => {
    const base = [
      `${brand} ${primary} — ${keywords[1] ?? "shop now"}`,
      `${primary} | ${brand}: ${keywords[2] ?? "free shipping"}`,
      `${primary} for ${keywords[1] ?? "men & women"} | ${brand}`,
    ];
    return base.map((t) => cap(t, 60));
  }, [brand, primary, keywords]);

  const descriptions = useMemo(() => {
    const base = [
      `${brand} ${primary} deliver ${keywords[0] ?? "performance"}. ${keywords[1] ?? "comfort"} and ${keywords[2] ?? "breathability"} in every step. Shop online today.`,
      `Discover ${primary} by ${brand}. Designed for ${keywords[1] ?? "daily wear"} with ${keywords[2] ?? "support"}. Free returns and fast delivery.`,
      `Upgrade to ${primary} from ${brand}. Built for ${keywords[1] ?? "marathons"} — try risk-free.`,
    ];
    return base.map((d) => cap(d, 155));
  }, [brand, primary, keywords]);

  const h1s = useMemo(() => {
    return unique([
      `${primary} by ${brand}`,
      `Shop ${primary}`,
      `${brand} ${primary} for ${keywords[1] ?? "everyone"}`,
    ]);
  }, [brand, primary, keywords]);

  const slugs = useMemo(() => {
    return unique([
      toSlug(primary),
      toSlug(`${primary} ${keywords[1] ?? "best"}`),
      toSlug(`${primary} ${keywords[2] ?? "guide"}`),
    ]);
  }, [primary, keywords]);

  const altTexts = useMemo(() => {
    return keywords.map((k) => `${brand} ${primary} — ${k}`);
  }, [brand, primary, keywords]);

  const metaSnippet = useMemo(() => {
    const t = titles[0] ?? `${brand} ${primary}`;
    const d = descriptions[0] ?? `${brand} ${primary}`;
    return [
      `<title>${t}</title>`,
      `<meta name="description" content="${d}">`,
      `<link rel="canonical" href="${siteUrl}/${slugs[0] ?? toSlug(primary)}">`,
    ].join("\n");
  }, [titles, descriptions, siteUrl, slugs, primary, brand]);

  const robots = useMemo(() => {
    return [
      "User-agent: *",
      "Allow: /",
      "Sitemap: " + (siteUrl ? `${siteUrl}/sitemap.xml` : "https://example.com/sitemap.xml"),
    ].join("\n");
  }, [siteUrl]);

  const copy = (text: string) => navigator.clipboard.writeText(text);
  const buildShareText = () => {
    return [
      `Brand: ${brand}`,
      `Primary: ${primary}`,
      `Secondary: ${secondary}`,
      "",
      "Titles:",
      ...titles,
      "",
      "Meta Descriptions:",
      ...descriptions,
      "",
      "H1s:",
      ...h1s,
      "",
      "Slugs:",
      ...slugs,
      "",
      "Alt Texts:",
      ...altTexts,
      "",
      "Meta Snippet:",
      metaSnippet,
      "",
      "robots.txt:",
      robots,
    ].join("\n");
  };
  const copyAll = () => navigator.clipboard.writeText(buildShareText());
  const downloadTxt = () => {
    const blob = new Blob([buildShareText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-tools-${toSlug(primary || "untitled")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          Creative
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">SEO Tools</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Generate titles, meta descriptions, slugs, H1s, and alt text from your keywords. Copy ready-to-use meta/robots snippets.
        </p>
      </div>

      {/* AI Suggestions Section */}
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="font-semibold text-yellow-900 dark:text-yellow-200 text-lg">AI Suggestions</div>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">Load the latest AI Assistant output to compare or copy alongside generated SEO fields.</p>
          </div>
          <div className="flex items-center gap-2">
            <button id="load-ai-suggestions" className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Load from AI Assistant
            </button>
            <button id="copy-ai-suggestions" className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Copy
            </button>
            <button id="download-ai-suggestions" className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Download .txt
            </button>
          </div>
        </div>
        <pre id="ai-suggestions-box" className="text-sm whitespace-pre-wrap max-h-40 overflow-auto border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 bg-white dark:bg-zinc-900"></pre>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            function getText(){
              try { return localStorage.getItem('ai_assistant_last_output') || ''; } catch { return ''; }
            }
            var loadBtn = document.getElementById('load-ai-suggestions');
            var copyBtn = document.getElementById('copy-ai-suggestions');
            var dlBtn = document.getElementById('download-ai-suggestions');
            var box = document.getElementById('ai-suggestions-box');
            if (loadBtn && box) {
              loadBtn.addEventListener('click', function(){ box.textContent = getText() || '(no AI suggestions found)'; });
            }
            if (copyBtn && box) {
              copyBtn.addEventListener('click', function(){
                var t = box.textContent || '';
                if (!t) t = getText();
                if (!t) return;
                navigator.clipboard.writeText(t);
              });
            }
            if (dlBtn && box) {
              dlBtn.addEventListener('click', function(){
                var t = box.textContent || '';
                if (!t) t = getText();
                var blob = new Blob([t], { type: 'text/plain;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url; a.download = 'ai-suggestions.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
              });
            }
          })();
        ` }} />
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Keyword Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Primary Keyword</label>
              <input
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="running shoes"
              />
              {primary.trim() === "" && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Enter a primary keyword to generate outputs.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Secondary Keywords (comma-separated)</label>
              <input
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="comfort, marathon, breathable"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Brand Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Brand Name</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="StridePro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Site URL</label>
              <input
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={copyAll}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          📋 Copy All
        </button>
        <button
          onClick={downloadTxt}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold rounded-xl transition-colors"
        >
          📄 Download .txt
        </button>
        <div className="ml-auto flex items-center gap-2">
          <HelpTip title="SEO Tools Help">
            Enter primary and secondary keywords, brand, and site URL. Titles are capped at ~60 chars; descriptions at ~155. Copy snippet blocks to paste in your HTML head and robots.txt.
          </HelpTip>
          <a href="/docs/seo-tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Tutorial
          </a>
        </div>
      </div>

      {/* Generated Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Titles & Descriptions */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Page Titles</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copy(titles.join("\n"))}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([titles.join("\n")], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `titles-${toSlug(primary || "untitled")}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {titles.map((t) => (
                <li key={t} className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Meta Descriptions</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copy(descriptions.join("\n"))}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([descriptions.join("\n")], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `descriptions-${toSlug(primary || "untitled")}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {descriptions.map((d) => (
                <li key={d} className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Slugs, H1s & Alt Text */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">URL Slugs</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copy(slugs.join("\n"))}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([slugs.join("\n")], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `slugs-${toSlug(primary || "untitled")}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {slugs.map((s) => (
                <li key={s} className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">H1 Headings</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copy(h1s.join("\n"))}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([h1s.join("\n")], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `h1s-${toSlug(primary || "untitled")}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {h1s.map((h) => (
                <li key={h} className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm">
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Alt Text</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copy(altTexts.join("\n"))}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([altTexts.join("\n")], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `alt-text-${toSlug(primary || "untitled")}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {altTexts.map((a) => (
                <li key={a} className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Meta & Robots Snippets */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Meta & Robots Snippets</h2>
          <div className="flex gap-2">
            <button
              onClick={() => copy(metaSnippet)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Copy Meta
            </button>
            <button
              onClick={() => copy(robots)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Copy Robots
            </button>
            <button
              onClick={() => {
                const blob = new Blob([metaSnippet], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `meta-${toSlug(primary || "untitled")}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              Download Meta
            </button>
            <button
              onClick={() => {
                const blob = new Blob([robots], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `robots-${toSlug(primary || "untitled")}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              Download Robots
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Meta Tags</h3>
            <pre className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
              {metaSnippet}
            </pre>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Robots.txt</h3>
            <pre className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
              {robots}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}