"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type Row = {
  channel: string;
  budget: number;
  startDate: string;
  endDate: string;
  notes?: string;
  histSpend: number;
  histRevenue: number;
  grossMarginPct: number;
  minBudget: number;
  maxBudget: number;
  elasticity: number;
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
    { channel: "Meta", budget: 5000, startDate: "2025-01-01", endDate: "2025-01-31", notes: "Always-on prospecting", histSpend: 5000, histRevenue: 15000, grossMarginPct: 60, minBudget: 0, maxBudget: 10000, elasticity: 0.001 },
    { channel: "Google Search", budget: 3000, startDate: "2025-01-10", endDate: "2025-01-31", notes: "Brand + generic", histSpend: 4000, histRevenue: 12000, grossMarginPct: 60, minBudget: 0, maxBudget: 10000, elasticity: 0.001 },
    { channel: "TikTok", budget: 2000, startDate: "2025-01-01", endDate: "2025-01-31", notes: "Creative tests", histSpend: 2000, histRevenue: 5000, grossMarginPct: 60, minBudget: 0, maxBudget: 8000, elasticity: 0.0015 },
  ]);
  const [targetRevenue, setTargetRevenue] = useState<string>("500000");
  const [targetNetMarginPct, setTargetNetMarginPct] = useState<string>("20");
  const [totalBudgetConstraint, setTotalBudgetConstraint] = useState<string>("20000");
  const [proMode, setProMode] = useState<boolean>(false);
  const [iosLossPct, setIosLossPct] = useState<string>("0");
  const [cpmChangePct, setCpmChangePct] = useState<string>("0");
  const [creativeBoostPct, setCreativeBoostPct] = useState<string>("0");

  const totals = useMemo(() => {
    const totalBudget = rows.reduce((sum, r) => sum + (Number.isFinite(r.budget) ? r.budget : 0), 0);
    const predicted = rows.map(r => {
      const e = Math.max(0.0001, r.elasticity || 0.001);
      const a = r.histRevenue > 0 && r.histSpend > 0 ? r.histRevenue / Math.log(1 + e * r.histSpend) : 0;
      const iosLoss = parseFloat(iosLossPct) || 0;
      const cpmShock = parseFloat(cpmChangePct) || 0;
      const creativeBoost = parseFloat(creativeBoostPct) || 0;
      const adjE = e * (1 - iosLoss / 100) * (1 - cpmShock / 100) * (1 + creativeBoost / 100);
      const revenue = a * Math.log(1 + adjE * r.budget);
      const margin = (r.grossMarginPct || 0) / 100;
      const profit = revenue * margin - r.budget;
      const roas = r.budget > 0 ? revenue / r.budget : 0;
      const cpa = roas > 0 ? (1 / roas) * (typeof window !== "undefined" ? 0 : 0) : 0;
      return { revenue, profit, roas };
    });
    const totalRevenue = predicted.reduce((s, p) => s + p.revenue, 0);
    const totalProfit = predicted.reduce((s, p) => s + p.profit, 0);
    const blendedROAS = totalBudget > 0 ? totalRevenue / totalBudget : 0;
    return { totalBudget, totalRevenue, totalProfit, blendedROAS };
  }, [rows, iosLossPct, cpmChangePct, creativeBoostPct]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }
  function addRow() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const d = `${yyyy}-${mm}-${dd}`;
    setRows(prev => [...prev, { channel: "Channel", budget: 0, startDate: d, endDate: d, notes: "", histSpend: 0, histRevenue: 0, grossMarginPct: 60, minBudget: 0, maxBudget: 0, elasticity: 0.001 }]);
  }
  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  function downloadCsv() {
    const header = ["channel","budget","start_date","end_date","days","daily_budget","predicted_revenue","predicted_profit","roas","notes"];
    const rowsCsv = rows.map(r => {
      const d = daysBetween(r.startDate, r.endDate);
      const daily = d > 0 ? r.budget / d : 0;
      const e = Math.max(0.0001, r.elasticity || 0.001);
      const a = r.histRevenue > 0 && r.histSpend > 0 ? r.histRevenue / Math.log(1 + e * r.histSpend) : 0;
      const iosLoss = parseFloat(iosLossPct) || 0;
      const cpmShock = parseFloat(cpmChangePct) || 0;
      const creativeBoost = parseFloat(creativeBoostPct) || 0;
      const adjE = e * (1 - iosLoss / 100) * (1 - cpmShock / 100) * (1 + creativeBoost / 100);
      const revenue = a * Math.log(1 + adjE * r.budget);
      const margin = (r.grossMarginPct || 0) / 100;
      const profit = revenue * margin - r.budget;
      const roas = r.budget > 0 ? revenue / r.budget : 0;
      return [r.channel, r.budget.toFixed(2), r.startDate, r.endDate, String(d), daily.toFixed(2), revenue.toFixed(2), profit.toFixed(2), roas.toFixed(2), r.notes || ""];
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

  function weeklyCsv() {
    function getWeeks(start: string, end: string) {
      if (!start || !end) return [] as { start: Date; end: Date }[];
      const s = new Date(start + "T00:00:00");
      const e = new Date(end + "T00:00:00");
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return [];
      const weeks: { start: Date; end: Date }[] = [];
      let cur = new Date(s);
      while (cur <= e) {
        const ws = new Date(cur);
        const we = new Date(cur);
        we.setDate(we.getDate() + (6 - we.getDay()));
        if (we > e) we.setTime(e.getTime());
        weeks.push({ start: ws, end: we });
        const next = new Date(we);
        next.setDate(next.getDate() + 1);
        cur = next;
      }
      return weeks;
    }
    const header = ["week_start","week_end","channel","weekly_budget","predicted_revenue","predicted_profit","roas"];
    const lines: string[][] = [];
    rows.forEach(r => {
      const weeks = getWeeks(r.startDate, r.endDate);
      const d = daysBetween(r.startDate, r.endDate);
      const daily = d > 0 ? r.budget / d : 0;
      weeks.forEach(w => {
        const days = Math.floor((w.end.getTime() - w.start.getTime()) / 86400000) + 1;
        const weeklyBudget = daily * days;
        const e = Math.max(0.0001, r.elasticity || 0.001);
        const a = r.histRevenue > 0 && r.histSpend > 0 ? r.histRevenue / Math.log(1 + e * r.histSpend) : 0;
        const iosLoss = parseFloat(iosLossPct) || 0;
        const cpmShock = parseFloat(cpmChangePct) || 0;
        const creativeBoost = parseFloat(creativeBoostPct) || 0;
        const adjE = e * (1 - iosLoss / 100) * (1 - cpmShock / 100) * (1 + creativeBoost / 100);
        const revenue = a * Math.log(1 + adjE * weeklyBudget);
        const margin = (r.grossMarginPct || 0) / 100;
        const profit = revenue * margin - weeklyBudget;
        const roas = weeklyBudget > 0 ? revenue / weeklyBudget : 0;
        lines.push([
          w.start.toISOString().slice(0, 10),
          w.end.toISOString().slice(0, 10),
          r.channel,
          weeklyBudget.toFixed(2),
          revenue.toFixed(2),
          profit.toFixed(2),
          roas.toFixed(2)
        ]);
      });
    });
    const csv = [header, ...lines].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-plan-weekly-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function recommendAllocation() {
    const total = Math.max(0, parseFloat(totalBudgetConstraint) || 0);
    const step = 100;
    const channels = rows.map(r => {
      const e = Math.max(0.0001, r.elasticity || 0.001);
      const a = r.histRevenue > 0 && r.histSpend > 0 ? r.histRevenue / Math.log(1 + e * r.histSpend) : 0;
      const margin = (r.grossMarginPct || 0) / 100;
      const iosLoss = parseFloat(iosLossPct) || 0;
      const cpmShock = parseFloat(cpmChangePct) || 0;
      const creativeBoost = parseFloat(creativeBoostPct) || 0;
      const adjE = e * (1 - iosLoss / 100) * (1 - cpmShock / 100) * (1 + creativeBoost / 100);
      return { idx: rows.indexOf(r), a, e: adjE, margin, min: r.minBudget || 0, max: r.maxBudget || Infinity, alloc: 0 };
    });
    let remaining = total;
    channels.forEach(c => {
      const need = Math.min(c.max, Math.max(0, c.min));
      c.alloc = need;
      remaining -= need;
    });
    let loops = 0;
    while (remaining >= step && loops < 10000) {
      loops += 1;
      let best = -1;
      let bestMarg = -Infinity;
      for (let i = 0; i < channels.length; i++) {
        const c = channels[i];
        const s = c.alloc;
        const dRev = c.a * c.e / (1 + c.e * s);
        const dProfit = dRev * c.margin - 1;
        const capacity = c.max - c.alloc;
        const effMarg = capacity <= 0 ? -Infinity : dProfit;
        if (effMarg > bestMarg) { bestMarg = effMarg; best = i; }
      }
      if (best === -1 || bestMarg <= 0) break;
      const inc = Math.min(step, channels[best].max - channels[best].alloc);
      if (inc <= 0) break;
      channels[best].alloc += inc;
      remaining -= inc;
    }
    setRows(prev => prev.map((r, i) => ({ ...r, budget: channels.find(c => c.idx === i)?.alloc || r.budget })));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          Planning
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Smart Media Planner</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Optimize spend using marginal returns, simulate shocks, and export weekly pacing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Planner Controls</h2>
            
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
              <button
                onClick={weeklyCsv}
                className="w-full bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                📅 Export Weekly CSV
              </button>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Revenue ($)</label>
                  <input type="number" value={targetRevenue} onChange={(e) => setTargetRevenue(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Net Margin %</label>
                  <input type="number" value={targetNetMarginPct} onChange={(e) => setTargetNetMarginPct(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Budget Constraint ($)</label>
                  <input type="number" value={totalBudgetConstraint} onChange={(e) => setTotalBudgetConstraint(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={proMode} onChange={(e) => setProMode(e.target.checked)} />
                  Pro Mode
                </label>
                <HelpTip title="What-If">Adjust iOS attribution, CPM shock, and creative boost to simulate impacts.</HelpTip>
              </div>
              {proMode && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">iOS Loss %</label>
                    <input type="number" value={iosLossPct} onChange={(e) => setIosLossPct(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">CPM Change %</label>
                    <input type="number" value={cpmChangePct} onChange={(e) => setCpmChangePct(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Creative Boost %</label>
                    <input type="number" value={creativeBoostPct} onChange={(e) => setCreativeBoostPct(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                  </div>
                </div>
              )}
              <button
                onClick={recommendAllocation}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                ⚙️ Recommend Allocation
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                ${totals.totalBudget.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Projected Revenue ${totals.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })} • Profit ${totals.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} • ROAS {totals.blendedROAS.toFixed(2)}x</div>
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

        <div className="lg:col-span-2">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-[1600px] table-fixed">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="w-48 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Channel</th>
                    <th className="w-32 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Budget ($)</th>
                    <th className="w-28 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Hist Spend</th>
                    <th className="w-28 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Hist Revenue</th>
                    <th className="w-24 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Gross Margin %</th>
                    <th className="w-24 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Min ($)</th>
                    <th className="w-24 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Max ($)</th>
                    <th className="w-24 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Elasticity</th>
                    <th className="w-32 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Start Date</th>
                    <th className="w-32 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">End Date</th>
                    <th className="w-20 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Days</th>
                    <th className="w-24 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Daily ($)</th>
                    <th className="w-72 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notes</th>
                    <th className="w-36 text-left py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {rows.map((r, i) => {
                    const d = daysBetween(r.startDate, r.endDate);
                    const daily = d > 0 ? r.budget / d : 0;
                    const e = Math.max(0.0001, r.elasticity || 0.001);
                    const a = r.histRevenue > 0 && r.histSpend > 0 ? r.histRevenue / Math.log(1 + e * r.histSpend) : 0;
                    const iosLoss = parseFloat(iosLossPct) || 0;
                    const cpmShock = parseFloat(cpmChangePct) || 0;
                    const creativeBoost = parseFloat(creativeBoostPct) || 0;
                    const adjE = e * (1 - iosLoss / 100) * (1 - cpmShock / 100) * (1 + creativeBoost / 100);
                    const revenue = a * Math.log(1 + adjE * r.budget);
                    const margin = (r.grossMarginPct || 0) / 100;
                    const profit = revenue * margin - r.budget;
                    const roas = r.budget > 0 ? revenue / r.budget : 0;
                    return (
                      <tr key={i} className="align-top">
                        <td className="py-4 px-4">
                          <input
                            value={r.channel}
                            onChange={(e) => updateRow(i, { channel: e.target.value })}
                            className="w-full min-w-[10rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Channel name"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="number"
                            min={0}
                            value={r.budget}
                            onChange={(e) => updateRow(i, { budget: parseFloat(e.target.value) || 0 })}
                            className="w-full min-w-[7rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input type="number" value={r.histSpend} onChange={(e) => updateRow(i, { histSpend: parseFloat(e.target.value) || 0 })} className="w-full min-w-[7rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                        </td>
                        <td className="py-4 px-4">
                          <input type="number" value={r.histRevenue} onChange={(e) => updateRow(i, { histRevenue: parseFloat(e.target.value) || 0 })} className="w-full min-w-[7rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                        </td>
                        <td className="py-4 px-4">
                          <input type="number" value={r.grossMarginPct} onChange={(e) => updateRow(i, { grossMarginPct: parseFloat(e.target.value) || 0 })} className="w-full min-w-[6rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                        </td>
                        <td className="py-4 px-4">
                          <input type="number" value={r.minBudget} onChange={(e) => updateRow(i, { minBudget: parseFloat(e.target.value) || 0 })} className="w-full min-w-[6rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                        </td>
                        <td className="py-4 px-4">
                          <input type="number" value={r.maxBudget} onChange={(e) => updateRow(i, { maxBudget: parseFloat(e.target.value) || 0 })} className="w-full min-w-[6rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                        </td>
                        <td className="py-4 px-4">
                          <input type="number" step="0.0001" value={r.elasticity} onChange={(e) => updateRow(i, { elasticity: parseFloat(e.target.value) || 0 })} className="w-full min-w-[6rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
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
                            className="w-full min-w-[5rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            readOnly
                            value={daily.toFixed(2)}
                            className="w-full min-w-[6rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input
                            value={r.notes || ""}
                            onChange={(e) => updateRow(i, { notes: e.target.value })}
                            className="w-full min-w-[16rem] px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">ROAS {roas.toFixed(2)}x • Profit ${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
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
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI Media Assistant</div>
          <HelpTip title="Assistant">Ask questions about ROAS, budgets, and strategy. Data stays local.</HelpTip>
        </div>
        <Copilot rows={rows} totals={totals} recommend={recommendAllocation} />
      </div>
    </div>
  );
}

type CopilotProps = {
  rows: Row[];
  totals: { totalBudget: number; totalRevenue: number; totalProfit: number; blendedROAS: number };
  recommend: () => void;
};

function Copilot({ rows, totals, recommend }: CopilotProps) {
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState<string>("");
  const [dataInput, setDataInput] = useState("");

  function analyze() {
    const q = query.toLowerCase();
    let out = "";
    if (q.includes("roas") && q.includes("drop")) {
      const low = rows.filter(r => r.budget > 0).map(r => {
        const e = Math.max(0.0001, r.elasticity || 0.001);
        const a = r.histRevenue > 0 && r.histSpend > 0 ? r.histRevenue / Math.log(1 + e * r.histSpend) : 0;
        const s = r.budget;
        const dRev = a * e / (1 + e * s);
        const margin = (r.grossMarginPct || 0) / 100;
        const mp = dRev * margin - 1;
        return { name: r.channel, mp };
      }).sort((a,b) => a.mp - b.mp);
      if (low[0] && low[0].mp < 0) out += `Creative fatigue or saturation detected in ${low[0].name}. Consider reducing spend or refreshing.`;
      else out += "ROAS decline likely from CPM shifts or attribution; try the What-If sandbox.";
    } else if (q.includes("how much") && q.includes("tiktok")) {
      const t = rows.find(r => r.channel.toLowerCase().includes("tiktok"));
      if (t) out += `Recommended spend for TikTok is currently $${t.budget.toFixed(0)} based on optimizer.`;
      else out += "No TikTok channel found.";
    } else if (q.includes("recommend") || q.includes("optimize")) {
      recommend();
      out += "Updated budgets using marginal profit optimization.";
    } else if (q.includes("break-even")) {
      const margin = totals.totalRevenue > 0 ? totals.totalProfit / totals.totalRevenue : 0;
      const beRoas = margin > 0 ? 1 / margin : Infinity;
      out += `Blended break-even ROAS is ${beRoas === Infinity ? "∞" : beRoas.toFixed(2)}.`;
    } else if (q.includes("upload") || q.includes("paste")) {
      const lines = dataInput.trim().split(/\n+/);
      let note = "";
      try {
        const parsed = lines.map(l => l.split(",")).map(parts => ({ name: parts[0], roas: parseFloat(parts[3]), cpa: parseFloat(parts[4]) }));
        const good = parsed.filter(p => p.roas && p.roas >= 0);
        if (good.length) {
          const be = totals.totalRevenue > 0 ? 1 / (totals.totalProfit / totals.totalRevenue) : Infinity;
          const meta = good.find(g => g.name.toLowerCase().includes("meta"));
          const google = good.find(g => g.name.toLowerCase().includes("google"));
          note += `Break-even ROAS is ${be === Infinity ? "∞" : be.toFixed(2)}. `;
          if (meta) note += `Meta ROAS ${meta.roas} looks healthy. `;
          if (google) note += `Google ROAS ${google.roas} may be low versus break-even. `;
        }
      } catch {}
      out += note || "Paste CSV as: Campaign,Spend,Revenue,ROAS,CPA.";
    } else {
      out += "Ask about ROAS drops, budget recommendations, or paste last-month CSV.";
    }
    setInsights(out);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" placeholder="Ask the copilot..." />
        <textarea value={dataInput} onChange={(e) => setDataInput(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" placeholder="Optional: paste last month CSV (Campaign,Spend,Revenue,ROAS,CPA)" rows={4} />
        <div className="flex gap-2">
          <button onClick={analyze} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Analyze</button>
        </div>
      </div>
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{insights}</div>
    </div>
  );
}
