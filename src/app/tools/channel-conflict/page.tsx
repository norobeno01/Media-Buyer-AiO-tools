"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type Row = { channelA: string; channelB: string; convA: string; convB: string; overlapPct: string; windowDays: string };

export default function ChannelConflict() {
  const [rows, setRows] = useState<Row[]>([
    { channelA: "Meta", channelB: "Email", convA: "1200", convB: "800", overlapPct: "30", windowDays: "7" },
  ]);
  const metrics = useMemo(() => rows.map(r => {
    const a = parseFloat(r.convA) || 0;
    const b = parseFloat(r.convB) || 0;
    const overlap = (parseFloat(r.overlapPct) || 0) / 100;
    const cannibal = Math.min(a, b) * overlap;
    const netA = a - cannibal;
    const netB = b - cannibal;
    return { label: `${r.channelA} vs ${r.channelB}`, cannibal, netA, netB };
  }), [rows]);
  const downloadCsv = () => {
    const header = ["Pair","Cannibalized","NetA","NetB"];
    const data = metrics.map(m => [m.label, m.cannibal.toFixed(0), m.netA.toFixed(0), m.netB.toFixed(0)]);
    const csv = [header, ...data].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `channel-conflict-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const updateRow = (i: number, patch: Partial<Row>) => setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addRow = () => setRows([...rows, { channelA: "A", channelB: "B", convA: "0", convB: "0", overlapPct: "0", windowDays: "7" }]);
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Analysis</div>
        <h1 className="text-3xl font-bold">Channel Conflict Detector</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Estimate cross-channel cannibalization with attribution windows</p>
      </div>
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Channel A</th>
              <th className="text-left py-2 px-3">Channel B</th>
              <th className="text-left py-2 px-3">Conv A</th>
              <th className="text-left py-2 px-3">Conv B</th>
              <th className="text-left py-2 px-3">Overlap %</th>
              <th className="text-left py-2 px-3">Window (days)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="py-2 px-3"><input value={r.channelA} onChange={(e) => updateRow(i, { channelA: e.target.value })} className="w-32 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-3"><input value={r.channelB} onChange={(e) => updateRow(i, { channelB: e.target.value })} className="w-32 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-3"><input type="number" value={r.convA} onChange={(e) => updateRow(i, { convA: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-3"><input type="number" value={r.convB} onChange={(e) => updateRow(i, { convB: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-3"><input type="number" value={r.overlapPct} onChange={(e) => updateRow(i, { overlapPct: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-3"><input type="number" value={r.windowDays} onChange={(e) => updateRow(i, { windowDays: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={addRow} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">+ Add Row</button>
          <div className="flex items-center gap-2"><button onClick={downloadCsv} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded">Export CSV</button><HelpTip title="Interpretation">High overlap implies cannibalization risk; adjust budgets or windows.</HelpTip></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">{m.label}</div>
            <div className="text-zinc-900 dark:text-zinc-100">Cannibalized {m.cannibal.toFixed(0)} • Net A {m.netA.toFixed(0)} • Net B {m.netB.toFixed(0)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

