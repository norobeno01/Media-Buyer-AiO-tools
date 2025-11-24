"use client";

import { useMemo, useState } from "react";

type Row = {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
};

function buildUtmUrl(base: string, params: Record<string, string>) {
  try {
    const url = new URL(base);
    Object.entries(params).forEach(([k, v]) => {
      if (v && v.trim().length > 0) url.searchParams.set(k, v.trim());
    });
    return url.toString();
  } catch {
    return "";
  }
}

export default function BulkUTMPage() {
  const [rows, setRows] = useState<Row[]>([
    { baseUrl: "https://example.com/product-a", source: "facebook", medium: "cpc", campaign: "spring_sale", content: "video_a", term: "" },
    { baseUrl: "https://example.com/product-b", source: "tiktok", medium: "cpc", campaign: "spring_sale", content: "ugc_b", term: "" },
  ]);

  const urls = useMemo(() => rows.map(r => buildUtmUrl(r.baseUrl, {
    utm_source: r.source,
    utm_medium: r.medium,
    utm_campaign: r.campaign,
    utm_content: r.content,
    utm_term: r.term,
  })), [rows]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }
  function addRow() {
    setRows(prev => [...prev, { baseUrl: "https://example.com/landing", source: "google", medium: "cpc", campaign: "campaign", content: "ad", term: "" }]);
  }
  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  function downloadCsv() {
    const header = ["base_url","source","medium","campaign","content","term","utm_url"];
    const rowsCsv = rows.map((r, i) => [r.baseUrl, r.source, r.medium, r.campaign, r.content, r.term, urls[i]]);
    const csv = [header, ...rowsCsv]
      .map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_utm.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">Tracking</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Bulk UTM Generator</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Create multiple tagged URLs at once. Add rows, edit fields, copy results or download CSV.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">UTM Parameters</h2>
          <div className="flex items-center gap-3">
            <button onClick={addRow} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Add Row</button>
            <button onClick={downloadCsv} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Download CSV</button>
            <button onClick={() => navigator.clipboard.writeText(urls.join("\n"))} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors">Copy All URLs</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-3 pr-4 font-medium">Base URL</th>
                <th className="py-3 pr-4 font-medium">Source</th>
                <th className="py-3 pr-4 font-medium">Medium</th>
                <th className="py-3 pr-4 font-medium">Campaign</th>
                <th className="py-3 pr-4 font-medium">Content</th>
                <th className="py-3 pr-4 font-medium">Term</th>
                <th className="py-3 pr-4 font-medium">UTM URL</th>
                <th className="py-3 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 pr-4">
                    <input value={r.baseUrl} onChange={(e) => updateRow(i, { baseUrl: e.target.value })} className="w-64 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </td>
                  <td className="py-3 pr-4">
                    <input value={r.source} onChange={(e) => updateRow(i, { source: e.target.value })} className="w-32 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </td>
                  <td className="py-3 pr-4">
                    <input value={r.medium} onChange={(e) => updateRow(i, { medium: e.target.value })} className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </td>
                  <td className="py-3 pr-4">
                    <input value={r.campaign} onChange={(e) => updateRow(i, { campaign: e.target.value })} className="w-32 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </td>
                  <td className="py-3 pr-4">
                    <input value={r.content} onChange={(e) => updateRow(i, { content: e.target.value })} className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </td>
                  <td className="py-3 pr-4">
                    <input value={r.term} onChange={(e) => updateRow(i, { term: e.target.value })} className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </td>
                  <td className="py-3 pr-4">
                    <input readOnly value={urls[i]} className="w-96 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400" />
                  </td>
                  <td className="py-3 pr-4">
                    <button onClick={() => removeRow(i)} className="rounded-lg border border-red-300 dark:border-red-700 px-3 py-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}