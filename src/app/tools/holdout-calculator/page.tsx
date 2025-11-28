"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

export default function HoldoutCalculator() {
  const [baseCrPct, setBaseCrPct] = useState("2.0");
  const [expectedLiftPct, setExpectedLiftPct] = useState("10");
  const [confidencePct, setConfidencePct] = useState("95");
  const [powerPct, setPowerPct] = useState("80");
  const result = useMemo(() => {
    const p1 = (parseFloat(baseCrPct) || 0) / 100;
    const p2 = p1 * (1 + ((parseFloat(expectedLiftPct) || 0) / 100));
    const zAlpha = 1.96;
    const zBeta = 0.84;
    const pooled = (p1 + p2) / 2;
    const diff = Math.abs(p2 - p1);
    const n = ((zAlpha * Math.sqrt(2 * pooled * (1 - pooled)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2) / (diff ** 2);
    const perGroup = Math.ceil(n);
    const durationDays = Math.ceil(7 + (1000 / perGroup));
    return { perGroup, durationDays };
  }, [baseCrPct, expectedLiftPct, confidencePct, powerPct]);
  const downloadCsv = () => {
    const rows = [["Per Group", result.perGroup],["Duration Days", result.durationDays]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `holdout-calculator-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Analysis</div>
      <h1 className="text-3xl font-bold">Holdout Group Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <label className="block text-sm mb-1">Baseline Conversion Rate %</label>
          <input type="number" value={baseCrPct} onChange={(e) => setBaseCrPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Expected Lift %</label>
          <input type="number" value={expectedLiftPct} onChange={(e) => setExpectedLiftPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Confidence Level %</label>
          <input type="number" value={confidencePct} onChange={(e) => setConfidencePct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Statistical Power %</label>
          <input type="number" value={powerPct} onChange={(e) => setPowerPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex items-center gap-2"><button onClick={downloadCsv} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded">Export CSV</button><HelpTip title="Sizing">Approximate sample size per group for detected lift.</HelpTip></div>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">Required per group {result.perGroup}</div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">Estimated duration {result.durationDays} days</div>
        </div>
      </div>
    </div>
  );
}

