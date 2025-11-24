"use client";

import { useMemo, useState } from "react";

function generateKeywords(topic: string) {
  const base = topic.trim().toLowerCase();
  if (!base) return [];
  const words = base.split(/\s+/);
  const phrases = [
    `${base} ideas`,
    `${base} tips`,
    `${base} best`,
    `${base} price`,
    `${base} buy`,
    `${base} review`,
    `${base} comparison`,
    `${base} near me`,
    `${base} tutorial`,
    `${base} checklist`,
  ];
  const modifiers = ["cheap", "premium", "top", "how to", "guide", "2025", "free", "download", "template", "examples"];
  const combos = modifiers.map((m) => `${m} ${base}`);
  return Array.from(new Set([...phrases, ...combos, ...words]));
}

type Intent = "Informational" | "Commercial" | "Transactional" | "Navigational";

function classifyIntent(k: string): Intent {
  const s = k.toLowerCase();
  if (/(buy|price|coupon|discount|deal|order|subscribe)/.test(s)) return "Transactional";
  if (/(best|review|comparison|vs|top|examples)/.test(s)) return "Commercial";
  if (/(near me|local|store|location|service)/.test(s)) return "Navigational";
  if (/(how to|guide|tutorial|checklist|tips|download|template)/.test(s)) return "Informational";
  return "Informational";
}

function downloadFile(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function KeywordFinderPage() {
  const [topic, setTopic] = useState<string>("media buying");
  const [extra, setExtra] = useState<string>("");
  const suggestions = useMemo(() => {
    const s1 = generateKeywords(topic);
    const s2 = generateKeywords(extra);
    return [...new Set([...s1, ...s2])];
  }, [topic, extra]);

  const groupedByIntent = useMemo(() => {
    const groups: Record<Intent, string[]> = {
      Informational: [],
      Commercial: [],
      Transactional: [],
      Navigational: [],
    };
    suggestions.forEach((k) => groups[classifyIntent(k)].push(k));
    return groups;
  }, [suggestions]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">Analysis</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Keyword Finder</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Generate relevant keywords from a topic or additional context. Copy results for planners.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" title="Primary topic for keyword generation.">Topic</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Example: &quot;running shoes&quot; or &quot;facebook ads&quot;.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2" title="Optional extra context, product specifics, or niche.">Extra Context</label>
            <input value={extra} onChange={(e) => setExtra(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Suggestions</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(suggestions.join(", "))}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title="Copy keywords to clipboard"
            >
              Copy All
            </button>
            <button
              onClick={() => {
                const rows = suggestions.map((k) => `${JSON.stringify(k)},${classifyIntent(k)}`);
                const csv = ["keyword,intent", ...rows].join("\n");
                downloadFile("keywords.csv", csv);
              }}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title="Export keywords with intent as CSV"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                const intents: Intent[] = ["Informational", "Commercial", "Transactional", "Navigational"];
                const sections = intents.map((i) => {
                  const rows = groupedByIntent[i].map((k) => `${JSON.stringify(k)},${i}`);
                  return [i, "keyword,intent", ...rows].join("\n");
                });
                const csv = sections.join("\n\n");
                downloadFile("keywords_by_intent.csv", csv);
              }}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title="Export grouped-by-intent CSV"
            >
              Export Grouped by Intent
            </button>
          </div>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Enter a topic to see suggestions.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map((s) => (
              <li key={s} className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
