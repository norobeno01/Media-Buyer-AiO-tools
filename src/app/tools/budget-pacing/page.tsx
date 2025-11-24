"use client";

import { useMemo, useState } from "react";

type Row = {
  channel: string;
  budget: number; // total
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
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

function enumerateDates(start: string, end: string): string[] {
  const d = daysBetween(start, end);
  if (d === 0) return [];
  const dates: string[] = [];
  const s = new Date(start + "T00:00:00");
  for (let i = 0; i < d; i++) {
    const cur = new Date(s.getTime() + i * 86400000);
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, "0");
    const dd = String(cur.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

export default function BudgetPacingPage() {
  const [rows, setRows] = useState<Row[]>([
    { channel: "Meta", budget: 5000, startDate: "2025-01-01", endDate: "2025-01-07" },
    { channel: "Google Search", budget: 3000, startDate: "2025-01-03", endDate: "2025-01-10" },
  ]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }
  function addRow() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const d = `${yyyy}-${mm}-${dd}`;
    setRows(prev => [...prev, { channel: "TikTok", budget: 2000, startDate: d, endDate: d }]);
  }
  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  const channels = useMemo(() => Array.from(new Set(rows.map(r => r.channel))).sort(), [rows]);

  const dateRange = useMemo(() => {
    const starts = rows.map(r => r.startDate).filter(Boolean).sort();
    const ends = rows.map(r => r.endDate).filter(Boolean).sort();
    const start = starts[0];
    const end = ends[ends.length - 1];
    if (!start || !end) return [];
    return enumerateDates(start, end);
  }, [rows]);

  const schedule = useMemo(() => {
    // date -> channel -> amount
    const map: Record<string, Record<string, number>> = {};
    for (const r of rows) {
      const d = daysBetween(r.startDate, r.endDate);
      const daily = d > 0 ? r.budget / d : 0;
      const dates = enumerateDates(r.startDate, r.endDate);
      for (const date of dates) {
        map[date] ||= {};
        map[date][r.channel] ||= 0;
        map[date][r.channel] += daily;
      }
    }
    return map;
  }, [rows]);

  function downloadCsv() {
    const header = ["date", ...channels, "total"];
    const data: string[][] = [];
    for (const date of dateRange) {
      const row = schedule[date] || {};
      const amounts = channels.map(ch => (row[ch] || 0).toFixed(2));
      const total = amounts.reduce((sum, v) => sum + parseFloat(v), 0).toFixed(2);
      data.push([date, ...amounts, total]);
    }
    const csv = [header, ...data]
      .map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budget_pacing_schedule.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">Planning</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Budget Pacing Calendar</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Generate a day-by-day spend schedule per channel and export CSV.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Campaign Budgets</h2>
          <div className="flex items-center gap-3">
            <button onClick={addRow} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Add Row</button>
            <button onClick={downloadCsv} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors">Download CSV</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-3 pr-4 font-medium">Channel</th>
                <th className="py-3 pr-4 font-medium">Budget ($)</th>
                <th className="py-3 pr-4 font-medium">Start</th>
                <th className="py-3 pr-4 font-medium">End</th>
                <th className="py-3 pr-4 font-medium">Days</th>
                <th className="py-3 pr-4 font-medium">Daily ($)</th>
                <th className="py-3 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const d = daysBetween(r.startDate, r.endDate);
                const daily = d > 0 ? r.budget / d : 0;
                return (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-3 pr-4">
                      <input value={r.channel} onChange={(e) => updateRow(i, { channel: e.target.value })} className="w-40 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </td>
                    <td className="py-3 pr-4">
                      <input type="number" min={0} value={r.budget} onChange={(e) => updateRow(i, { budget: parseFloat(e.target.value) || 0 })} className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </td>
                    <td className="py-3 pr-4">
                      <input type="date" value={r.startDate} onChange={(e) => updateRow(i, { startDate: e.target.value })} className="w-36 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </td>
                    <td className="py-3 pr-4">
                      <input type="date" value={r.endDate} onChange={(e) => updateRow(i, { endDate: e.target.value })} className="w-36 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </td>
                    <td className="py-3 pr-4">
                      <input readOnly value={d} className="w-16 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400" />
                    </td>
                    <td className="py-3 pr-4">
                      <input readOnly value={daily.toFixed(2)} className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400" />
                    </td>
                    <td className="py-3 pr-4">
                      <button onClick={() => removeRow(i)} className="rounded-lg border border-red-300 dark:border-red-700 px-3 py-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Daily Schedule</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-3 pr-4 font-medium">Date</th>
                {channels.map((ch) => (
                  <th key={ch} className="py-3 pr-4 font-medium">{ch}</th>
                ))}
                <th className="py-3 pr-4 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {dateRange.map((date) => {
                const row = schedule[date] || {};
                const amounts = channels.map(ch => row[ch] || 0);
                const total = amounts.reduce((sum, v) => sum + v, 0);
                return (
                  <tr key={date} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">{date}</td>
                    {amounts.map((amt, i) => (
                      <td key={i} className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">${amt.toFixed(2)}</td>
                    ))}
                    <td className="py-3 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">${total.toFixed(2)}</td>
                  </tr>
                );
              })}
              {dateRange.length === 0 && (
                <tr>
                  <td colSpan={channels.length + 2} className="py-8 text-center text-zinc-500 dark:text-zinc-400">Add rows with valid dates to see the schedule.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}