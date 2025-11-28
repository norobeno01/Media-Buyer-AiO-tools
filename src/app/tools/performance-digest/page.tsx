"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type Row = { name: string; spend: string; revenue: string; roas: string; cpa: string };

export default function PerformanceDigest() {
  const [rows, setRows] = useState<Row[]>([
    { name: "Meta - Prospecting", spend: "5000", revenue: "12000", roas: "2.4", cpa: "45" },
    { name: "Google - Search", spend: "4000", revenue: "16000", roas: "4.0", cpa: "30" },
  ]);
  const [proMode, setProMode] = useState<boolean>(false);
  const [minROAS, setMinROAS] = useState<string>("2.0");
  const [maxCPA, setMaxCPA] = useState<string>("50");

  const totals = useMemo(() => {
    const spend = rows.reduce((acc, r) => acc + (parseFloat(r.spend) || 0), 0);
    const revenue = rows.reduce((acc, r) => acc + (parseFloat(r.revenue) || 0), 0);
    const roas = spend > 0 ? revenue / spend : 0;
    return { spend, revenue, roas };
  }, [rows]);

  const insights = useMemo(() => {
    const topByROAS = [...rows].sort((a, b) => (parseFloat(b.roas) || 0) - (parseFloat(a.roas) || 0)).slice(0, 3);
    const underByCPA = [...rows].sort((a, b) => (parseFloat(b.cpa) || 0) - (parseFloat(a.cpa) || 0)).slice(0, 3);
    const min = parseFloat(minROAS) || 0;
    const max = parseFloat(maxCPA) || Infinity;
    const actionItems: string[] = [];
    rows.forEach(r => {
      const roas = parseFloat(r.roas) || 0;
      const cpa = parseFloat(r.cpa) || 0;
      if (roas < min) actionItems.push(`${r.name}: ROAS below ${min}x — optimize bids/creatives`);
      if (cpa > max) actionItems.push(`${r.name}: CPA above $${max} — tighten targeting or improve funnel`);
    });
    return { topByROAS, underByCPA, actionItems };
  }, [rows, minROAS, maxCPA]);

  const addRow = () => setRows([...rows, { name: "Campaign", spend: "0", revenue: "0", roas: "0", cpa: "0" }]);
  const updateRow = (i: number, patch: Partial<Row>) => setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const md = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# Performance Digest`);
    lines.push(`Total Spend: $${totals.spend.toFixed(2)} | Revenue: $${totals.revenue.toFixed(2)} | ROAS: ${totals.roas.toFixed(2)}x`);
    lines.push("");
    lines.push(`## Top Performers (ROAS)`);
    insights.topByROAS.forEach(r => lines.push(`- ${r.name}: ROAS ${r.roas}x, CPA $${r.cpa}`));
    lines.push("");
    lines.push(`## Underperformers (CPA)`);
    insights.underByCPA.forEach(r => lines.push(`- ${r.name}: CPA $${r.cpa}, ROAS ${r.roas}x`));
    lines.push("");
    lines.push(`## Action Items`);
    insights.actionItems.forEach(a => lines.push(`- ${a}`));
    return lines.join("\n");
  }, [totals, insights]);

  const downloadMarkdown = () => {
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-digest-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const header = ["Campaign Name", "Spend", "Revenue", "ROAS", "CPA"];
    const data = rows.map(r => [r.name, r.spend, r.revenue, r.roas, r.cpa]);
    const csv = [header, ...data].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-digest-data-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Operations</div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Automated Performance Digest Generator</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Generate an executive summary with insights and actions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Controls</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={proMode} onChange={(e) => setProMode(e.target.checked)} />
                  Pro Mode
                </label>
                <HelpTip title="Logic">Summarizes campaigns, flags underperformance, and exports Markdown or CSV.</HelpTip>
              </div>
              {proMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Min ROAS</label>
                    <input type="number" step="0.1" value={minROAS} onChange={(e) => setMinROAS(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Max CPA ($)</label>
                    <input type="number" value={maxCPA} onChange={(e) => setMaxCPA(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800" />
                  </div>
                </div>
              )}
              <button onClick={addRow} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl">+ Add Campaign</button>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={downloadMarkdown} className="px-4 py-3 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold rounded-xl">Download Markdown</button>
                <button onClick={downloadCsv} className="px-4 py-3 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold rounded-xl">Export CSV</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Campaign Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Spend ($)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Revenue ($)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">ROAS</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">CPA ($)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4"><input value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} className="w-48 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" /></td>
                    <td className="py-3 px-4"><input type="number" value={r.spend} onChange={(e) => updateRow(i, { spend: e.target.value })} className="w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" /></td>
                    <td className="py-3 px-4"><input type="number" value={r.revenue} onChange={(e) => updateRow(i, { revenue: e.target.value })} className="w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" /></td>
                    <td className="py-3 px-4"><input type="number" step="0.1" value={r.roas} onChange={(e) => updateRow(i, { roas: e.target.value })} className="w-20 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" /></td>
                    <td className="py-3 px-4"><input type="number" value={r.cpa} onChange={(e) => updateRow(i, { cpa: e.target.value })} className="w-20 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" /></td>
                    <td className="py-3 px-4"><button onClick={() => removeRow(i)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-between">
              <div className="text-sm text-blue-700 dark:text-blue-300">Totals</div>
              <div className="text-zinc-900 dark:text-zinc-100 font-semibold">Spend ${totals.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • Revenue ${totals.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • ROAS {totals.roas.toFixed(2)}x</div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Executive Summary</h3>
              <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{md}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

