"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type Row = { channel: string; budget: string; marginPct: string; recentRoas: string };

export default function ProfitLedPacing() {
  const [rows, setRows] = useState<Row[]>([
    { channel: "Meta", budget: "8000", marginPct: "60", recentRoas: "2.8" },
    { channel: "Google", budget: "6000", marginPct: "60", recentRoas: "2.1" },
  ]);
  const [thresholdRoas, setThresholdRoas] = useState("2.4");
  const [adjustPct, setAdjustPct] = useState("10");

  const pacing = useMemo(() => {
    const thr = parseFloat(thresholdRoas) || 0;
    const adj = (parseFloat(adjustPct) || 0) / 100;
    return rows.map(r => {
      const b = parseFloat(r.budget) || 0;
      const roas = parseFloat(r.recentRoas) || 0;
      const up = roas > thr ? adj : 0;
      const down = roas < thr ? adj : 0;
      const rec = Math.max(0, b * (1 + up - down));
      return { channel: r.channel, recommended: rec };
    });
  }, [rows, thresholdRoas, adjustPct]);

  const downloadCsv = () => {
    const header = ["Channel","CurrentBudget","RecentROAS","RecommendedBudget"];
    const data = rows.map((r, i) => [r.channel, r.budget, r.recentRoas, pacing[i].recommended.toFixed(2)]);
    const csv = [header, ...data].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-led-pacing-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateRow = (i: number, patch: Partial<Row>) => setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addRow = () => setRows([...rows, { channel: "Channel", budget: "0", marginPct: "60", recentRoas: "0" }]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Planning</div>
        <h1 className="text-3xl font-bold">Profit-Led Pacing Engine</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Adjust spend based on margin-aware ROAS thresholds</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <h2 className="text-xl font-semibold">Controls</h2>
          <label className="block text-sm mb-1">Threshold ROAS</label>
          <input type="number" value={thresholdRoas} onChange={(e) => setThresholdRoas(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Adjustment %</label>
          <input type="number" value={adjustPct} onChange={(e) => setAdjustPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <button onClick={downloadCsv} className="w-full bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl py-3">Export CSV</button>
          <HelpTip title="Logic">Increase budgets when ROAS ≥ threshold; decrease when below.</HelpTip>
        </div>
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Channel</th>
                <th className="text-left py-2 px-3">Budget ($)</th>
                <th className="text-left py-2 px-3">Recent ROAS</th>
                <th className="text-left py-2 px-3">Recommended ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="py-2 px-3"><input value={r.channel} onChange={(e) => updateRow(i, { channel: e.target.value })} className="w-32 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3"><input type="number" value={r.budget} onChange={(e) => updateRow(i, { budget: e.target.value })} className="w-24 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3"><input type="number" value={r.recentRoas} onChange={(e) => updateRow(i, { recentRoas: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3 text-blue-700 font-semibold">${pacing[i].recommended.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4"><button onClick={addRow} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">+ Add Row</button></div>
        </div>
      </div>
    </div>
  );
}

