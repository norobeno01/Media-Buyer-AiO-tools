"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type Row = { name: string; frequency: string; ctrDay1: string; ctrDay7: string; impressions: string };

export default function CreativeHeatmap() {
  const [rows, setRows] = useState<Row[]>([
    { name: "AdSet A", frequency: "3.2", ctrDay1: "1.8", ctrDay7: "1.1", impressions: "500000" },
    { name: "AdSet B", frequency: "5.4", ctrDay1: "1.5", ctrDay7: "0.8", impressions: "800000" },
  ]);
  const risks = useMemo(() => rows.map(r => {
    const freq = parseFloat(r.frequency) || 0;
    const d1 = parseFloat(r.ctrDay1) || 0;
    const d7 = parseFloat(r.ctrDay7) || 0;
    const decay = d1 > 0 ? (d1 - d7) / d1 : 0;
    const score = freq * 0.5 + decay * 100 * 0.5;
    const level = score < 20 ? "Low" : score < 40 ? "Medium" : "High";
    return { name: r.name, level, score };
  }), [rows]);
  const updateRow = (i: number, patch: Partial<Row>) => setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addRow = () => setRows([...rows, { name: "AdSet", frequency: "0", ctrDay1: "0", ctrDay7: "0", impressions: "0" }]);
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Creative</div>
        <h1 className="text-3xl font-bold">Creative Saturation Heatmap</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Visualize fatigue via frequency and CTR decay</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3">Frequency</th>
                <th className="text-left py-2 px-3">CTR Day1</th>
                <th className="text-left py-2 px-3">CTR Day7</th>
                <th className="text-left py-2 px-3">Impressions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="py-2 px-3"><input value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} className="w-32 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3"><input type="number" value={r.frequency} onChange={(e) => updateRow(i, { frequency: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3"><input type="number" value={r.ctrDay1} onChange={(e) => updateRow(i, { ctrDay1: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3"><input type="number" value={r.ctrDay7} onChange={(e) => updateRow(i, { ctrDay7: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3"><input type="number" value={r.impressions} onChange={(e) => updateRow(i, { impressions: e.target.value })} className="w-28 px-2 py-1 border rounded" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between"><button onClick={addRow} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">+ Add Row</button><HelpTip title="Risk">High frequency and CTR decay indicate fatigue; refresh creatives.</HelpTip></div>
        </div>
        <div className="space-y-3">
          {risks.map((r, i) => (
            <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{r.name}</div>
              <div className="text-xl font-semibold">{r.level} risk (score {r.score.toFixed(1)})</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

