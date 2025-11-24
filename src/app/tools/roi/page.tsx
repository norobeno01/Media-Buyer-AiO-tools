"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";

export default function RoiToolPage() {
  const [spend, setSpend] = useState<number>(5000);
  const [revenue, setRevenue] = useState<number>(15000);
  const [conversions, setConversions] = useState<number>(120);
  const [grossMarginPct, setGrossMarginPct] = useState<number>(60);
  const [aov, setAov] = useState<number>(125);

  const roas = useMemo(() => (spend > 0 ? revenue / spend : 0), [revenue, spend]);
  const cpa = useMemo(() => (conversions > 0 ? spend / conversions : 0), [spend, conversions]);
  const marginRate = useMemo(() => grossMarginPct / 100, [grossMarginPct]);
  const breakevenRevenue = useMemo(() => (marginRate > 0 ? spend / marginRate : 0), [spend, marginRate]);
  const breakevenConversions = useMemo(() => (aov > 0 ? Math.ceil(breakevenRevenue / aov) : 0), [breakevenRevenue, aov]);

  function downloadCSV() {
    const rows = [
      ["Metric", "Value"],
      ["Ad Spend", `$${spend.toFixed(2)}`],
      ["Revenue", `$${revenue.toFixed(2)}`],
      ["Conversions", conversions.toString()],
      ["ROAS", `${roas.toFixed(2)}x`],
      ["CPA", `$${cpa.toFixed(2)}`],
      ["Gross Margin", `${grossMarginPct}%`],
      ["Breakeven Revenue", `$${breakevenRevenue.toFixed(2)}`],
      ["Breakeven Conversions", breakevenConversions.toString()]
    ];
    
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roi_analysis.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Analysis Tool
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">ROI & Breakeven Calculator</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl">
          Calculate ROAS, CPA, and breakeven points to optimize your campaign performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Campaign Parameters</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ad Spend
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={spend}
                  onChange={(e) => setSpend(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total advertising spend for the campaign
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Revenue
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={revenue}
                  onChange={(e) => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total revenue attributed to the campaign
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Conversions
              </label>
              <input
                type="number"
                min={0}
                value={conversions}
                onChange={(e) => setConversions(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total conversions (purchases, signups, etc.)
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Margin Analysis</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Gross Margin Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={grossMarginPct}
                  onChange={(e) => setGrossMarginPct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-full pr-12 pl-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 text-sm">%</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Percentage of revenue retained after COGS
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Average Order Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={aov}
                  onChange={(e) => setAov(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Average revenue per conversion
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Key Metrics</h2>
              <Button onClick={downloadCSV} variant="secondary" size="sm">
                Export CSV
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Return on Ad Spend</div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{roas.toFixed(2)}x</div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">Cost Per Acquisition</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">${cpa.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Breakeven Revenue</div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  ${breakevenRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Breakeven Conversions</div>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{breakevenConversions.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Performance Analysis</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Current ROAS</span>
                <span className={`text-sm font-semibold ${roas >= 3 ? "text-green-600" : roas >= 2 ? "text-yellow-600" : "text-red-600"}`}>
                  {roas.toFixed(2)}x {roas >= 3 ? "🟢 Excellent" : roas >= 2 ? "🟡 Good" : "🔴 Needs Improvement"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">CPA vs Industry</span>
                <span className={`text-sm font-semibold ${cpa <= 50 ? "text-green-600" : cpa <= 100 ? "text-yellow-600" : "text-red-600"}`}>
                  ${cpa.toFixed(2)} {cpa <= 50 ? "🟢 Low" : cpa <= 100 ? "🟡 Medium" : "🔴 High"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Profit Margin</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {grossMarginPct}% {grossMarginPct >= 60 ? "🟢 Healthy" : grossMarginPct >= 40 ? "🟡 Moderate" : "🔴 Low"}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p className="mb-2"><strong>Analysis:</strong></p>
                {revenue >= breakevenRevenue ? (
                  <p className="text-green-600 dark:text-green-400">
                    ✅ Your campaign is profitable! Revenue exceeds breakeven by ${(revenue - breakevenRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                  </p>
                ) : (
                  <p className="text-red-600 dark:text-red-400">
                    ⚠️ Your campaign needs optimization. Revenue is ${(breakevenRevenue - revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} below breakeven.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}