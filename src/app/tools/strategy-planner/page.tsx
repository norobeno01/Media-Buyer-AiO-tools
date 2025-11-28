"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type Channel = { name: string; histSpend: string; histRevenue: string; marginPct: string; minBudget: string; maxBudget: string; elasticity: string; attrWindowDays: string; saturationPct: string; kind: "Brand" | "Performance"; pastWinners?: string };

export default function StrategyPlanner() {
  const [goalText, setGoalText] = useState("Generate $1M net profit");
  const [goalMode, setGoalMode] = useState<"Revenue" | "NetProfit">("NetProfit");
  const [targetAmount, setTargetAmount] = useState("1000000");
  const [grossMarginPct, setGrossMarginPct] = useState("60");
  const [cogsPct, setCogsPct] = useState("40");
  const [refundPct, setRefundPct] = useState("3");
  const [brandSharePct, setBrandSharePct] = useState("30");
  const [perfSharePct, setPerfSharePct] = useState("70");

  const [channels, setChannels] = useState<Channel[]>([
    { name: "Meta", histSpend: "5000", histRevenue: "15000", marginPct: "60", minBudget: "0", maxBudget: "10000", elasticity: "0.001", attrWindowDays: "7", saturationPct: "0", kind: "Performance", pastWinners: "UGC product demo" },
    { name: "Google", histSpend: "4000", histRevenue: "12000", marginPct: "60", minBudget: "0", maxBudget: "10000", elasticity: "0.001", attrWindowDays: "7", saturationPct: "0", kind: "Performance", pastWinners: "Benefit-first search ads" },
    { name: "TikTok", histSpend: "2000", histRevenue: "5000", marginPct: "60", minBudget: "0", maxBudget: "8000", elasticity: "0.0015", attrWindowDays: "7", saturationPct: "10", kind: "Brand", pastWinners: "Lifestyle hooks + fast cuts" },
  ]);
  const [totalBudget, setTotalBudget] = useState("25000");
  const [proMode, setProMode] = useState(false);
  const [iosLossPct, setIosLossPct] = useState("0");
  const [cpmChangePct, setCpmChangePct] = useState("0");
  const [creativeBoostPct, setCreativeBoostPct] = useState("0");
  const [weeksCount, setWeeksCount] = useState("12");
  const [adjustUpPct, setAdjustUpPct] = useState("10");
  const [adjustDownPct, setAdjustDownPct] = useState("10");
  const [useOverrides, setUseOverrides] = useState(false);
  const [overrides, setOverrides] = useState<Record<number, Record<string, string>>>({});
  function setOverride(week: number, channel: string, value: string) {
    setOverrides((prev) => ({ ...prev, [week]: { ...(prev[week] || {}), [channel]: value } }));
  }

  const plan = useMemo(() => {
    const step = 100;
    const budget = Math.max(0, parseFloat(totalBudget) || 0);
    const items = channels.map(r => {
      const s = Math.max(0, parseFloat(r.histSpend) || 0);
      const rev = Math.max(0, parseFloat(r.histRevenue) || 0);
      const m = ((parseFloat(r.marginPct) || 0) / 100);
      const e = Math.max(0.0001, parseFloat(r.elasticity) || 0.001);
      const ios = (parseFloat(iosLossPct) || 0) / 100;
      const cpm = (parseFloat(cpmChangePct) || 0) / 100;
      const boost = (parseFloat(creativeBoostPct) || 0) / 100;
      const sat = (parseFloat(r.saturationPct) || 0) / 100;
      const a = rev > 0 && s > 0 ? rev / Math.log(1 + e * s) : 0;
      const adjE = e * (1 - ios) * (1 - cpm) * (1 + boost) * (1 - sat);
      const minB = Math.max(0, parseFloat(r.minBudget) || 0);
      const maxB = Math.max(minB, parseFloat(r.maxBudget) || Infinity);
      return { name: r.name, a, e: adjE, margin: m, min: minB, max: maxB, alloc: 0 };
    });
    let remaining = budget;
    items.forEach(c => { c.alloc = Math.min(c.max, c.min); remaining -= c.alloc; });
    let loops = 0;
    while (remaining >= step && loops < 10000) {
      loops += 1;
      let bi = -1; let bm = -Infinity;
      for (let i = 0; i < items.length; i++) {
        const c = items[i];
        const s = c.alloc;
        const dRev = c.a * c.e / (1 + c.e * s);
        const dProfit = dRev * c.margin - 1;
        const cap = c.max - c.alloc;
        const eff = cap <= 0 ? -Infinity : dProfit;
        if (eff > bm) { bm = eff; bi = i; }
      }
      if (bi === -1 || bm <= 0) break;
      const inc = Math.min(step, items[bi].max - items[bi].alloc);
      if (inc <= 0) break;
      items[bi].alloc += inc;
      remaining -= inc;
    }
    const rows = items.map(c => {
      const revenue = c.a * Math.log(1 + c.e * c.alloc);
      const profit = revenue * c.margin - c.alloc;
      const roas = c.alloc > 0 ? revenue / c.alloc : 0;
      return { name: c.name, alloc: c.alloc, revenue, profit, roas };
    });
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const totalProfit = rows.reduce((s, r) => s + r.profit, 0);
    const blendedRoas = budget > 0 ? totalRevenue / budget : 0;
    const effectiveMargin = Math.max(0, (parseFloat(grossMarginPct) || 0) / 100) * (1 - (parseFloat(refundPct) || 0) / 100);
    const breakEvenRoas = effectiveMargin > 0 ? 1 / effectiveMargin : Infinity;
    return { rows, totalRevenue, totalProfit, blendedRoas, breakEvenRoas };
  }, [channels, totalBudget, iosLossPct, cpmChangePct, creativeBoostPct, grossMarginPct, refundPct]);

  const weeklyPlan = useMemo(() => {
    const weeks = Math.max(1, parseInt(weeksCount) || 12);
    const up = (parseFloat(adjustUpPct) || 0) / 100;
    const down = (parseFloat(adjustDownPct) || 0) / 100;
    const brandTarget = Math.min(100, Math.max(0, parseFloat(brandSharePct) || 0)) / 100;
    const perfTarget = Math.min(100, Math.max(0, parseFloat(perfSharePct) || 0)) / 100;
    const total = Math.max(0, parseFloat(totalBudget) || 0);
    const brandBudget = total * brandTarget;
    const perfBudget = total * perfTarget;
    const brandChannels = channels.filter(c => c.kind === "Brand");
    const perfChannels = channels.filter(c => c.kind === "Performance");
    const baseAlloc: Record<string, number> = {};
    // Start from optimized alloc proportions
    const sumAlloc = plan.rows.reduce((s, r) => s + r.alloc, 0) || 1;
    plan.rows.forEach(r => { baseAlloc[r.name] = r.alloc / sumAlloc; });
    // Split into brand/perf pools
    const perWeekTotal = total / weeks;
    const series: Array<{ week: number; byChannel: Record<string, { spend: number; roas: number }> }> = [];
    let prevWeekSpends: Record<string, number> = {};
    for (let w = 1; w <= weeks; w++) {
      const weekSpend: Record<string, number> = {};
      // initial proportional split, then enforce brand/perf pool by rescaling
      let brandSum = 0, perfSum = 0;
      channels.forEach(c => {
        const base = perWeekTotal * (baseAlloc[c.name] || 0);
        weekSpend[c.name] = base;
      });
      brandChannels.forEach(c => brandSum += weekSpend[c.name] || 0);
      perfChannels.forEach(c => perfSum += weekSpend[c.name] || 0);
      const brandScale = brandSum > 0 ? (brandBudget / weeks) / brandSum : 1;
      const perfScale = perfSum > 0 ? (perfBudget / weeks) / perfSum : 1;
      brandChannels.forEach(c => weekSpend[c.name] = (weekSpend[c.name] || 0) * brandScale);
      perfChannels.forEach(c => weekSpend[c.name] = (weekSpend[c.name] || 0) * perfScale);

      // profit-led adjustment vs break-even
      const adjusted: Record<string, number> = {};
      channels.forEach(c => {
        const r = plan.rows.find(r => r.name === c.name);
        const a = r ? (r.alloc > 0 ? r.revenue / Math.log(1 + (r.revenue / r.alloc) * r.alloc) : 0) : 0; // fallback; not used
        // use per-channel curves
        const s = Math.max(0, parseFloat(c.histSpend) || 0);
        const rev = Math.max(0, parseFloat(c.histRevenue) || 0);
        const e = Math.max(0.0001, parseFloat(c.elasticity) || 0.001);
        const ios = (parseFloat(iosLossPct) || 0) / 100;
        const cpm = (parseFloat(cpmChangePct) || 0) / 100;
        const boost = (parseFloat(creativeBoostPct) || 0) / 100;
        const sat = (parseFloat(c.saturationPct) || 0) / 100;
        const A = rev > 0 && s > 0 ? rev / Math.log(1 + e * s) : 0;
        const E = e * (1 - ios) * (1 - cpm) * (1 + boost) * (1 - sat);
        const spend = weekSpend[c.name] || 0;
        const revenue = A * Math.log(1 + E * spend);
        const roas = spend > 0 ? revenue / spend : 0;
        const be = plan.breakEvenRoas;
        let newSpend = spend;
        if (prevWeekSpends[c.name] !== undefined) {
          if (roas >= be) newSpend = spend * (1 + up);
          else newSpend = spend * (1 - down);
        }
        adjusted[c.name] = newSpend;
      });
      prevWeekSpends = adjusted;
      const byChannel: Record<string, { spend: number; roas: number }> = {};
      channels.forEach(c => {
        let spend = adjusted[c.name] || 0;
        const ov = overrides[w]?.[c.name];
        if (useOverrides && ov !== undefined) {
          spend = Math.max(0, parseFloat(ov) || 0);
        }
        const s = Math.max(0, parseFloat(c.histSpend) || 0);
        const rev = Math.max(0, parseFloat(c.histRevenue) || 0);
        const e = Math.max(0.0001, parseFloat(c.elasticity) || 0.001);
        const ios = (parseFloat(iosLossPct) || 0) / 100;
        const cpm = (parseFloat(cpmChangePct) || 0) / 100;
        const boost = (parseFloat(creativeBoostPct) || 0) / 100;
        const sat = (parseFloat(c.saturationPct) || 0) / 100;
        const A = rev > 0 && s > 0 ? rev / Math.log(1 + e * s) : 0;
        const E = e * (1 - ios) * (1 - cpm) * (1 + boost) * (1 - sat);
        const revenue = A * Math.log(1 + E * spend);
        const roas = spend > 0 ? revenue / spend : 0;
        byChannel[c.name] = { spend, roas };
      });
      series.push({ week: w, byChannel });
    }
    return series;
  }, [plan.breakEvenRoas, channels, totalBudget, weeksCount, brandSharePct, perfSharePct, adjustUpPct, adjustDownPct, iosLossPct, cpmChangePct, creativeBoostPct, useOverrides, overrides]);

  const weeklyDriftAlerts = useMemo(() => {
    const weeks = Math.max(1, parseInt(weeksCount) || 12);
    const targetBrand = Math.min(100, Math.max(0, parseFloat(brandSharePct) || 0)) / 100;
    const alerts: string[] = [];
    for (let w = 1; w <= weeks; w++) {
      const wp = weeklyPlan.find((x) => x.week === w);
      if (!wp) continue;
      let brandSpend = 0;
      let totalSpend = 0;
      channels.forEach((c) => {
        const spend = wp.byChannel[c.name]?.spend || 0;
        totalSpend += spend;
        if (c.kind === "Brand") brandSpend += spend;
      });
      const actualBrandShare = totalSpend > 0 ? brandSpend / totalSpend : 0;
      const drift = actualBrandShare - targetBrand;
      if (Math.abs(drift) >= 0.05) {
        alerts.push(`Week ${w}: brand share drift ${(drift * 100).toFixed(1)}% vs target`);
      }
    }
    return alerts;
  }, [weeklyPlan, weeksCount, brandSharePct, channels]);

  function guardrailTarget(attrDays: number, be: number) {
    if (attrDays >= 28) return be * 0.85;
    if (attrDays >= 14) return be * 0.9;
    return be * 1.0;
  }

  function addChannel() {
    setChannels(prev => [...prev, { name: "Channel", histSpend: "0", histRevenue: "0", marginPct: "60", minBudget: "0", maxBudget: "0", elasticity: "0.001", attrWindowDays: "7", saturationPct: "0", kind: "Performance", pastWinners: "" }]);
  }
  function updateChannel(i: number, patch: Partial<Channel>) {
    setChannels(channels.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  }
  function removeChannel(i: number) {
    setChannels(channels.filter((_, idx) => idx !== i));
  }

  function exportMarkdown() {
    const lines: string[] = [];
    lines.push(`# Marketing Strategy Advanced Planner`);
    lines.push(`Goal: ${goalText}`);
    lines.push(`Mode: ${goalMode} • Target ${parseFloat(targetAmount || "0").toLocaleString()}`);
    lines.push(`Gross Margin ${grossMarginPct}% • COGS ${cogsPct}% • Refunds ${refundPct}%`);
    lines.push(`Brand/Perf Split: ${brandSharePct}%/${perfSharePct}%`);
    lines.push("");
    lines.push(`## Recommended Allocation`);
    plan.rows.forEach(r => lines.push(`- ${r.name}: $${r.alloc.toFixed(0)} • ROAS ${r.roas.toFixed(2)}x • Profit $${r.profit.toFixed(0)}`));
    lines.push("");
    lines.push(`Total Revenue: $${plan.totalRevenue.toFixed(0)} • Total Profit: $${plan.totalProfit.toFixed(0)} • ROAS ${plan.blendedRoas.toFixed(2)}x • Break-even ROAS ${plan.breakEvenRoas.toFixed(2)}x`);
    lines.push("");
    lines.push(`## Creative Directions`);
    channels.forEach(c => {
      const refresh = (parseFloat(c.saturationPct) || 0) > 20 ? "Weekly" : "Bi-weekly";
      lines.push(`- ${c.name}: Hooks from winners: ${c.pastWinners || "—"}; Formats: UGC/Story; Refresh cadence: ${refresh}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strategy-planner-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportCsvMediaPlan() {
    const header = ["Week", ...channels.map(c => `${c.name} Spend`), ...channels.map(c => `${c.name} ROAS`)];
    const rows = weeklyPlan.map(w => {
      const spendRow = channels.map(c => (w.byChannel[c.name]?.spend || 0).toFixed(2));
      const roasRow = channels.map(c => (w.byChannel[c.name]?.roas || 0).toFixed(2));
      return [String(w.week), ...spendRow, ...roasRow];
    });
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-plan-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportPdfDeck() {
    window.print();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Strategy</div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Marketing Strategy Advanced Planner</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Translate business goals into profit-aligned media strategy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Objectives & Constraints</h2>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Business Goal</label>
              <input value={goalText} onChange={(e) => setGoalText(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mode</label>
                  <select value={goalMode} onChange={(e) => setGoalMode(e.target.value as any)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800">
                    <option>Revenue</option>
                    <option>NetProfit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Amount ($)</label>
                  <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
                </div>
              </div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Budget ($)</label>
              <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium">Gross Margin %</label>
                  <input type="number" value={grossMarginPct} onChange={(e) => setGrossMarginPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium">COGS %</label>
                  <input type="number" value={cogsPct} onChange={(e) => setCogsPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Refund %</label>
                  <input type="number" value={refundPct} onChange={(e) => setRefundPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Brand Share %</label>
                  <input type="number" value={brandSharePct} onChange={(e) => setBrandSharePct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Performance Share %</label>
                  <input type="number" value={perfSharePct} onChange={(e) => setPerfSharePct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={proMode} onChange={(e) => setProMode(e.target.checked)} />
                  Pro Mode
                </label>
                <HelpTip title="Scenarios">Simulate iOS attribution loss, CPM shock, audience saturation, and creative boosts.</HelpTip>
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium">Weeks</label>
                  <input type="number" value={weeksCount} onChange={(e) => setWeeksCount(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Adjust Up %</label>
                  <input type="number" value={adjustUpPct} onChange={(e) => setAdjustUpPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Adjust Down %</label>
                  <input type="number" value={adjustDownPct} onChange={(e) => setAdjustDownPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <button onClick={exportMarkdown} className="w-full bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-xl">Export Strategy Deck (Markdown)</button>
              <button onClick={exportCsvMediaPlan} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl">Export Media Plan (CSV)</button>
              <button onClick={exportPdfDeck} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl">Export PDF Deck</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Channel Mix</h2>
            <div className="flex items-center gap-2">
              <button onClick={addChannel} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">+ Add Channel</button>
              <HelpTip title="Allocation">Optimizes by marginal profit under diminishing returns.</HelpTip>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1400px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-2 px-3 text-sm font-semibold">Channel</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Hist Spend</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Hist Revenue</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Margin %</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Min ($)</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Max ($)</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Elasticity</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Attr Window (days)</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Saturation %</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Kind</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Recommended ($)</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {channels.map((c, i) => {
                  const s = Math.max(0, parseFloat(c.histSpend) || 0);
                  const rev = Math.max(0, parseFloat(c.histRevenue) || 0);
                  const m = ((parseFloat(c.marginPct) || 0) / 100);
                  const e = Math.max(0.0001, parseFloat(c.elasticity) || 0.001);
                  const a = rev > 0 && s > 0 ? rev / Math.log(1 + e * s) : 0;
                  const ios = (parseFloat(iosLossPct) || 0) / 100;
                  const cpm = (parseFloat(cpmChangePct) || 0) / 100;
                  const boost = (parseFloat(creativeBoostPct) || 0) / 100;
                  const adjE = e * (1 - ios) * (1 - cpm) * (1 + boost);
                  const minB = Math.max(0, parseFloat(c.minBudget) || 0);
                  const maxB = Math.max(minB, parseFloat(c.maxBudget) || 0);
                  const sAlloc = plan.rows.find(r => r.name === c.name)?.alloc || 0;
                  return (
                    <tr key={i}>
                      <td className="py-2 px-3"><input value={c.name} onChange={(e) => updateChannel(i, { name: e.target.value })} className="w-32 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3"><input type="number" value={c.histSpend} onChange={(e) => updateChannel(i, { histSpend: e.target.value })} className="w-24 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3"><input type="number" value={c.histRevenue} onChange={(e) => updateChannel(i, { histRevenue: e.target.value })} className="w-24 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3"><input type="number" value={c.marginPct} onChange={(e) => updateChannel(i, { marginPct: e.target.value })} className="w-20 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3"><input type="number" value={c.minBudget} onChange={(e) => updateChannel(i, { minBudget: e.target.value })} className="w-20 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3"><input type="number" value={c.maxBudget} onChange={(e) => updateChannel(i, { maxBudget: e.target.value })} className="w-20 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3"><input type="number" step="0.0001" value={c.elasticity} onChange={(e) => updateChannel(i, { elasticity: e.target.value })} className="w-24 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3"><input type="number" value={c.attrWindowDays} onChange={(e) => updateChannel(i, { attrWindowDays: e.target.value })} className="w-20 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3"><input type="number" value={c.saturationPct} onChange={(e) => updateChannel(i, { saturationPct: e.target.value })} className="w-20 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded" /></td>
                      <td className="py-2 px-3">
                        <select value={c.kind} onChange={(e) => updateChannel(i, { kind: e.target.value as any })} className="px-2 py-1 border rounded w-28">
                          <option>Brand</option>
                          <option>Performance</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-blue-700 dark:text-blue-300 font-semibold">${sAlloc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-3"><button onClick={() => removeChannel(i)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">Remove</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-between">
            <div className="text-sm text-blue-700 dark:text-blue-300">Totals</div>
            <div className="text-zinc-900 dark:text-zinc-100 font-semibold">Budget ${parseFloat(totalBudget || "0").toLocaleString(undefined, { maximumFractionDigits: 2 })} • Revenue ${plan.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })} • Profit ${plan.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} • ROAS {plan.blendedRoas.toFixed(2)}x • Break-even {plan.breakEvenRoas.toFixed(2)}x</div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Weekly Pacing (Profit-led)</h3>
              <HelpTip title="Rules">Budgets increase when predicted ROAS ≥ break-even; decrease otherwise.</HelpTip>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3 text-left">Week</th>
                    {channels.map(c => (<th key={`h-sp-${c.name}`} className="py-2 px-3 text-left">{c.name} ($)</th>))}
                    {channels.map(c => (<th key={`h-ro-${c.name}`} className="py-2 px-3 text-left">{c.name} ROAS</th>))}
                  </tr>
                </thead>
                <tbody>
                  {weeklyPlan.map(w => (
                    <tr key={w.week} className="border-b">
                      <td className="py-2 px-3">{w.week}</td>
                      {channels.map(c => (
                        <td key={`sp-${c.name}-${w.week}`} className="py-2 px-3">
                          {useOverrides ? (
                            <input
                              type="number"
                              value={overrides[w.week]?.[c.name] ?? (w.byChannel[c.name]?.spend || 0).toFixed(2)}
                              onChange={(e) => setOverride(w.week, c.name, e.target.value)}
                              className="w-24 px-2 py-1 border rounded"
                            />
                          ) : (
                            (w.byChannel[c.name]?.spend || 0).toFixed(2)
                          )}
                        </td>
                      ))}
                      {channels.map(c => (<td key={`ro-${c.name}-${w.week}`} className="py-2 px-3">{(w.byChannel[c.name]?.roas || 0).toFixed(2)}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={useOverrides} onChange={(e) => setUseOverrides(e.target.checked)} />
                Enable manual overrides
              </label>
              {weeklyDriftAlerts.length > 0 && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  {weeklyDriftAlerts.join(" • ")}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Guardrails</div>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                {channels.map(c => (
                  <li key={`gr-${c.name}`}>If {parseInt(c.attrWindowDays || "7")}-day ROAS &lt; {guardrailTarget(parseInt(c.attrWindowDays || "7"), plan.breakEvenRoas).toFixed(2)}x, pause and diagnose.</li>
                ))}
                <li>If brand share drifts ±5%, re-balance in next week.</li>
                <li>If saturation &gt; 30%, refresh creatives and audiences.</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
              <div className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">Creative Directions</div>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                {channels.map(c => (
                  <li key={c.name}>{c.name}: {c.pastWinners || "Add past winners"} • Refresh {(parseFloat(c.saturationPct) || 0) > 20 ? "weekly" : "bi-weekly"}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden print:block p-12">
        <div style={{ pageBreakAfter: "always" }}>
          <h1 className="text-4xl font-bold">Marketing Strategy Deck</h1>
          <p className="text-zinc-600">{new Date().toLocaleDateString()}</p>
          <div className="mt-6 text-zinc-800">{goalText}</div>
        </div>
        <div style={{ pageBreakAfter: "always" }}>
          <h2 className="text-2xl font-semibold">Executive Summary</h2>
          <p className="mt-2">Budget ${parseFloat(totalBudget || "0").toLocaleString(undefined, { maximumFractionDigits: 2 })} • Revenue ${plan.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })} • Profit ${plan.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} • ROAS {plan.blendedRoas.toFixed(2)}x • Break-even {plan.breakEvenRoas.toFixed(2)}x</p>
          <div className="mt-6">
            <h3 className="font-medium">Allocation by Channel</h3>
            <div className="space-y-2 mt-2">
              {plan.rows.map(r => {
                const sum = plan.rows.reduce((s, x) => s + x.alloc, 0) || 1;
                const pct = (r.alloc / sum) * 100;
                return (
                  <div key={r.name} className="flex items-center gap-3">
                    <div className="w-40">{r.name}</div>
                    <div className="flex-1 h-4 bg-zinc-200"><div className="h-4 bg-blue-600" style={{ width: `${pct}%` }}></div></div>
                    <div className="w-20 text-right">{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-medium">Weekly Spend Trend</h3>
            <div className="space-y-2 mt-2">
              {weeklyPlan.map(w => {
                const total = channels.reduce((s, c) => s + (w.byChannel[c.name]?.spend || 0), 0);
                const max = Math.max(...weeklyPlan.map(x => channels.reduce((s, c) => s + (x.byChannel[c.name]?.spend || 0), 0))) || 1;
                const pct = (total / max) * 100;
                return (
                  <div key={`wk-${w.week}`} className="flex items-center gap-3">
                    <div className="w-20">Week {w.week}</div>
                    <div className="flex-1 h-4 bg-zinc-200"><div className="h-4 bg-emerald-600" style={{ width: `${pct}%` }}></div></div>
                    <div className="w-24 text-right">${total.toFixed(0)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Creative Directions</h2>
          <div className="mt-4 space-y-2">
            {channels.map(c => (
              <div key={`cd-${c.name}`} className="flex items-center gap-3">
                <div className="w-40">{c.name}</div>
                <div className="flex-1">{c.pastWinners || "Add past winners"}</div>
                <div className="w-32">Refresh {(parseFloat(c.saturationPct) || 0) > 20 ? "weekly" : "bi-weekly"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
