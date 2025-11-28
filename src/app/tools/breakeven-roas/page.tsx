"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

export default function BreakEvenROAS() {
  const [aov, setAov] = useState<string>("100");
  const [cogsPct, setCogsPct] = useState<string>("40");
  const [refundPct, setRefundPct] = useState<string>("3");
  const [procPct, setProcPct] = useState<string>("2.9");
  const [platformFeePct, setPlatformFeePct] = useState<string>("0");
  const [proMode, setProMode] = useState<boolean>(false);
  const [otherCostPct, setOtherCostPct] = useState<string>("0");

  const results = useMemo(() => {
    const AOV = parseFloat(aov) || 0;
    const cogs = (parseFloat(cogsPct) || 0) / 100;
    const refunds = (parseFloat(refundPct) || 0) / 100;
    const proc = (parseFloat(procPct) || 0) / 100;
    const platform = (parseFloat(platformFeePct) || 0) / 100;
    const other = (parseFloat(otherCostPct) || 0) / 100;
    const totalCosts = Math.min(0.99, cogs + refunds + proc + platform + other);
    const marginAfterCosts = Math.max(0, 1 - totalCosts);
    const maxCAC = AOV * marginAfterCosts;
    const breakEvenROAS = marginAfterCosts > 0 ? 1 / marginAfterCosts : Infinity;
    return { maxCAC, breakEvenROAS, marginAfterCosts };
  }, [aov, cogsPct, refundPct, procPct, platformFeePct, otherCostPct]);

  const downloadCsv = () => {
    const rows = [
      ["AOV", aov],
      ["COGS %", cogsPct],
      ["Refund Rate %", refundPct],
      ["Payment Processing %", procPct],
      ["Ad Platform Fee %", platformFeePct],
      ["Other Cost %", otherCostPct],
      ["Break-even ROAS", results.breakEvenROAS === Infinity ? "∞" : results.breakEvenROAS.toFixed(2)],
      ["Max CAC (Break-even)", results.maxCAC.toFixed(2)],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `breakeven-roas-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Analysis</div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Dynamic Break-Even ROAS Calculator</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Compute minimum ROAS and max CAC after all costs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Inputs</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">AOV ($)</label>
                <input type="number" value={aov} onChange={(e) => setAov(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">COGS %</label>
                  <input type="number" value={cogsPct} onChange={(e) => setCogsPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Refund Rate %</label>
                  <input type="number" value={refundPct} onChange={(e) => setRefundPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Payment Processing %</label>
                  <input type="number" value={procPct} onChange={(e) => setProcPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Ad Platform Fee %</label>
                  <input type="number" value={platformFeePct} onChange={(e) => setPlatformFeePct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={proMode} onChange={(e) => setProMode(e.target.checked)} />
                  Pro Mode
                </label>
                <HelpTip title="Logic">Break-even ROAS is 1 divided by margin after all costs.</HelpTip>
              </div>

              {proMode && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Other Cost %</label>
                  <input type="number" value={otherCostPct} onChange={(e) => setOtherCostPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Outputs</h2>
              <div className="flex items-center gap-2">
                <button onClick={downloadCsv} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold rounded-xl">Export CSV</button>
                <HelpTip title="Interpretation">ROAS below break-even implies negative profit.</HelpTip>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Break-even ROAS</div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{results.breakEvenROAS === Infinity ? "∞" : `${results.breakEvenROAS.toFixed(2)}x`}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">Max CAC (Break-even)</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">${results.maxCAC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

