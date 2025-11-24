"use client";

import { useMemo, useState } from "react";

type Platform = "Meta" | "TikTok" | "YouTube" | "Google";
type QAItem = { text: string; checked: boolean };

const PRESETS: Record<Platform, string[]> = {
  Meta: [
    "Aspect ratio correct (1:1, 4:5, 9:16)",
    "Text under 20% and readable",
    "No clickbait or misleading CTA",
    "Branding visible within first 3 seconds",
    "Captions/subtitles included",
    "Hook in first 2 seconds",
    "Complies with Meta ad policies",
  ],
  TikTok: [
    "9:16 vertical, safe area respected",
    "Native-style pacing and transitions",
    "On-screen captions or text callouts",
    "Strong hook in first 2–3 seconds",
    "Sound levels normalized, music licensed",
    "Includes clear CTA",
    "Complies with TikTok ad policies",
  ],
  YouTube: [
    "Resolution 1080p+, correct aspect",
    "Intro hook and retention plan",
    "Clear audio mix and VO",
    "End card or CTA present",
    "Thumbnail readable and compelling",
    "Branding consistent with guidelines",
    "Complies with YouTube ad policies",
  ],
  Google: [
    "Responsive image sizes prepared",
    "Headline/description limits respected",
    "No prohibited claims or pricing errors",
    "Landing page speed and relevancy",
    "UTM parameters included",
    "Ad copy matches destination",
    "Complies with Google Ads policies",
  ],
};

export default function CreativeQAPage() {
  const [platform, setPlatform] = useState<Platform>("Meta");
  const [items, setItems] = useState<QAItem[]>(() => PRESETS["Meta"].map((t) => ({ text: t, checked: false })));
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState("");

  // When platform changes via select, we update items in the handler to avoid setState inside effects.

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter((i) => i.text.toLowerCase().includes(s));
  }, [items, search]);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.checked).length;
    return { total, done, remaining: total - done };
  }, [items]);

  function toggleIndex(idx: number) {
    setItems((prev) => prev.map((i, n) => (n === idx ? { ...i, checked: !i.checked } : i)));
  }

  function addCustom() {
    const t = newItem.trim();
    if (!t) return;
    setItems((prev) => [...prev, { text: t, checked: false }]);
    setNewItem("");
  }

  function setAll(checked: boolean) {
    setItems((prev) => prev.map((i) => ({ ...i, checked })));
  }

  function copyChecklist() {
    const lines = items.map((i) => `${i.checked ? "[x]" : "[ ]"} ${i.text}`);
    const text = `Creative QA – ${platform}\n` + lines.join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function downloadCsv() {
    const header = ["platform", "item", "checked"];
    const data = items.map((i) => [platform, i.text, i.checked ? "yes" : "no"]);
    const csv = [header, ...data]
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `creative_qa_${platform.toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">Creative</span>
          <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full">Quality</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Creative QA Checklist</h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Use platform-specific presets to ensure your creative assets meet quality standards and platform requirements.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={platform}
            onChange={(e) => {
              const next = e.target.value as Platform;
              setPlatform(next);
              setItems(PRESETS[next].map((t) => ({ text: t, checked: false })));
            }}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {Object.keys(PRESETS).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            placeholder="Search checklist items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-64 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setAll(true)} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Check All</button>
            <button onClick={() => setAll(false)} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Uncheck All</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <input
                  placeholder="Add custom checklist item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button onClick={addCustom} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors">Add Item</button>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{platform} Checklist</h3>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{stats.done}/{stats.total} completed</span>
              </div>
              <ul className="space-y-2">
                {filteredItems.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={i.checked} 
                      onChange={() => toggleIndex(items.indexOf(i))} 
                      className="rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${i.checked ? 'line-through text-zinc-500 dark:text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {i.text}
                    </span>
                  </li>
                ))}
                {filteredItems.length === 0 && (
                  <li className="py-4 text-sm text-zinc-500 dark:text-zinc-400 text-center">No items match your search.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Progress Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-800 dark:text-green-200">Completed</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">{stats.done}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Remaining</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{stats.remaining}</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Export Options</h3>
              <div className="space-y-2">
                <button onClick={copyChecklist} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Checklist
                </button>
                <button onClick={downloadCsv} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}