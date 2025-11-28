"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type ChannelRow = {
  name: string;
  spend: string;
  revenue: string;
  marginPct: string;
  maxBudget: string;
  elasticity: string;
};

export default function BudgetOptimizer() {
  const [rows, setRows] = useState<ChannelRow[]>([
    { name: "Meta", spend: "5000", revenue: "15000", marginPct: "60", maxBudget: "10000", elasticity: "0.001" },
    { name: "Google", spend: "4000", revenue: "12000", marginPct: "60", maxBudget: "10000", elasticity: "0.001" },
    { name: "TikTok", spend: "2000", revenue: "5000", marginPct: "60", maxBudget: "8000", elasticity: "0.0015" },
  ]);
  const [totalBudget, setTotalBudget] = useState<string>("20000");
  const [stepSize, setStepSize] = useState<string>("100");
  const [proMode, setProMode] = useState<boolean>(false);

  const allocation = useMemo(() => {
    const step = Math.max(10, parseFloat(stepSize) || 100);
    const channels = rows.map(r => {
      const s = Math.max(0, parseFloat(r.spend) || 0);
      const rev = Math.max(0, parseFloat(r.revenue) || 0);
      const m = ((parseFloat(r.marginPct) || 0) / 100);
      const b = Math.max(0, parseFloat(r.maxBudget) || 0);
      const e = Math.max(0.0001, parseFloat(r.elasticity) || 0.001);
      const a = rev > 0 && s > 0 ? rev / Math.log(1 + e * s) : 0;
      return { name: r.name, currentSpend: s, a, e, m, max: b, alloc: 0 };
    });
    let remaining = Math.max(0, parseFloat(totalBudget) || 0);
    const safeLimit = 10000;
    let loops = 0;
    while (remaining >= step && loops < safeLimit) {
      loops += 1;
      let bestIndex = -1;
      let bestMarginal = -Infinity;
      for (let i = 0; i < channels.length; i++) {
        const c = channels[i];
        const s = c.currentSpend + c.alloc;
        const dRev = c.a * c.e / (1 + c.e * s);
        const dProfit = dRev * c.m - 1;
        const remainingCapacity = Math.max(0, c.max - c.alloc);
        const effectiveMarginal = remainingCapacity <= 0 ? -Infinity : dProfit;
        if (effectiveMarginal > bestMarginal) {
          bestMarginal = effectiveMarginal;
          bestIndex = i;
        }
      }
      if (bestIndex === -1 || bestMarginal <= 0) break;
      const allocAmount = Math.min(step, channels[bestIndex].max - channels[bestIndex].alloc);
      if (allocAmount <= 0) break;
      channels[bestIndex].alloc += allocAmount;
      remaining -= allocAmount;
    }
    return { channels, remaining };
  }, [rows, totalBudget, stepSize]);

  const addRow = () => setRows([...rows, { name: "Channel", spend: "0", revenue: "0", marginPct: "60", maxBudget: "0", elasticity: "0.001" }]);
  const updateRow = (i: number, patch: Partial<ChannelRow>) => setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const downloadCsv = () => {
    const header = ["Channel", "Historical Spend", "Revenue", "Gross Margin %", "Max Budget", "Elasticity", "Recommended Spend"];
    const data = allocation.channels.map(c => {
      const src = rows.find(r => r.name === c.name) as ChannelRow;
      return [
        c.name,
        src.spend,
        src.revenue,
        src.marginPct,
        src.maxBudget,
        src.elasticity,
        (c.alloc).toFixed(2)
      ];
    });
    const csv = [header, ...data].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-optimizer-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Planning</div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Cross-Channel Budget Optimizer</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Allocate budgets using profit-aware diminishing returns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Controls</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Total Budget ($)</label>
                <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={proMode} onChange={(e) => setProMode(e.target.checked)} />
                  Pro Mode
                </label>
                <HelpTip title="Logic">Calibrates log curves to historicals and allocates by highest marginal profit.</HelpTip>
              </div>
              {proMode && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Step Size ($)</label>
                  <input type="number" value={stepSize} onChange={(e) => setStepSize(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <button onClick={addRow} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl">+ Add Channel</button>
              <button onClick={downloadCsv} className="w-full bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-xl">Export CSV</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Channel</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Spend ($)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Revenue ($)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Gross Margin %</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Max Budget ($)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Elasticity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recommended ($)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {rows.map((r, i) => {
                  const alloc = allocation.channels.find(c => c.name === r.name)?.alloc || 0;
                  return (
                    <tr key={i}>
                      <td className="py-3 px-4">
                        <input value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} className="w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" value={r.spend} onChange={(e) => updateRow(i, { spend: e.target.value })} className="w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" value={r.revenue} onChange={(e) => updateRow(i, { revenue: e.target.value })} className="w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" value={r.marginPct} onChange={(e) => updateRow(i, { marginPct: e.target.value })} className="w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" value={r.maxBudget} onChange={(e) => updateRow(i, { maxBudget: e.target.value })} className="w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" step="0.0001" value={r.elasticity} onChange={(e) => updateRow(i, { elasticity: e.target.value })} className="w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                      </td>
                      <td className="py-3 px-4 text-blue-700 dark:text-blue-300 font-semibold">${alloc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => removeRow(i)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Unallocated: ${allocation.remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <HelpTip title="Diminishing Returns">Higher elasticity increases decay; allocations stop when marginal profit ≤ 0.</HelpTip>
          </div>
        </div>
      </div>
    </div>
  );
}

