"use client";

import { useMemo, useState } from "react";

type Row = {
  channel: string;
  budget: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  notes?: string;
};

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  if (e < s) return 0;
  const diff = e.getTime() - s.getTime();
  return Math.floor(diff / 86400000) + 1; // inclusive
}

export default function MediaPlanPage() {
  const [rows, setRows] = useState<Row[]>([
    { channel: "Meta", budget: 5000, startDate: "2025-01-01", endDate: "2025-01-31", notes: "Always-on prospecting" },
    { channel: "Google Search", budget: 3000, startDate: "2025-01-10", endDate: "2025-01-31", notes: "Brand + generic" },
  ]);

  const totals = useMemo(() => {
    const totalBudget = rows.reduce((sum, r) => sum + (Number.isFinite(r.budget) ? r.budget : 0), 0);
    return { totalBudget };
  }, [rows]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }
  function addRow() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const d = `${yyyy}-${mm}-${dd}`;
    setRows(prev => [...prev, { channel: "TikTok", budget: 2000, startDate: d, endDate: d, notes: "Test creatives" }]);
  }
  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  function downloadCsv() {
    const header = ["channel","budget","start_date","end_date","days","daily_budget","notes"];
    const rowsCsv = rows.map(r => {
      const d = daysBetween(r.startDate, r.endDate);
      const daily = d > 0 ? r.budget / d : 0;
      return [r.channel, r.budget.toFixed(2), r.startDate, r.endDate, String(d), daily.toFixed(2), r.notes || ""];
    });
    const csv = [header, ...rowsCsv]
      .map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "media_plan.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          Planning
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Media Plan Template</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Plan channels, budgets, and dates. Auto-calculates daily pacing and exports CSV.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Plan Controls</h2>
            
            <div className="space-y-3">
              <button
                onClick={addRow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                + Add Channel Row
              </button>
              
              <button
                onClick={downloadCsv}
                className="w-full bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                📊 Export CSV
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                ${totals.totalBudget.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Planning Tips</h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Start with your highest priority channels</li>
              <li>• Consider seasonal trends and peak periods</li>
              <li>• Leave budget for testing new channels</li>
              <li>• Review and adjust weekly based on performance</li>
            </ul>
          </div>
        </div>

        {/* Media Plan Table */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Channel</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Budget ($)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Start Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">End Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Days</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Daily ($)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notes</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {rows.map((r, i) => {
                    const d = daysBetween(r.startDate, r.endDate);
                    const daily = d > 0 ? r.budget / d : 0;
                    return (
                      <tr key={i} className="align-top">
                        <td className="py-4 px-4">
                          <input
                            value={r.channel}
                            onChange={(e) => updateRow(i, { channel: e.target.value })}
                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Channel name"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="number"
                            min={0}
                            value={r.budget}
                            onChange={(e) => updateRow(i, { budget: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="date"
                            value={r.startDate}
                            onChange={(e) => updateRow(i, { startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="date"
                            value={r.endDate}
                            onChange={(e) => updateRow(i, { endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            readOnly
                            value={d}
                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            readOnly
                            value={daily.toFixed(2)}
                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            value={r.notes || ""}
                            onChange={(e) => updateRow(i, { notes: e.target.value })}
                            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Notes..."
                          />
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => removeRow(i)}
                            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}