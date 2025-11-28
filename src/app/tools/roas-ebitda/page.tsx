"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

export default function RoasEbitda() {
  const [revenue, setRevenue] = useState("100000");
  const [cogsPct, setCogsPct] = useState("40");
  const [refundPct, setRefundPct] = useState("3");
  const [processingPct, setProcessingPct] = useState("2.9");
  const [opex, setOpex] = useState("20000");
  const [adSpend, setAdSpend] = useState("30000");
  const metrics = useMemo(() => {
    const rev = parseFloat(revenue) || 0;
    const cogs = rev * ((parseFloat(cogsPct) || 0) / 100);
    const refunds = rev * ((parseFloat(refundPct) || 0) / 100);
    const processing = rev * ((parseFloat(processingPct) || 0) / 100);
    const grossProfit = rev - cogs - refunds - processing;
    const ad = parseFloat(adSpend) || 0;
    const contrib = grossProfit - ad;
    const ebitda = contrib - (parseFloat(opex) || 0);
    const roas = ad > 0 ? rev / ad : 0;
    return { grossProfit, contrib, ebitda, roas };
  }, [revenue, cogsPct, refundPct, processingPct, opex, adSpend]);
  const downloadCsv = () => {
    const rows = [["Revenue", revenue],["ROAS", metrics.roas.toFixed(2)],["Gross Profit", metrics.grossProfit.toFixed(2)],["Contribution", metrics.contrib.toFixed(2)],["EBITDA", metrics.ebitda.toFixed(2)]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roas-ebitda-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Operations</div>
        <h1 className="text-3xl font-bold">ROAS-to-EBITDA Translator</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Convert performance into executive finance metrics</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <label className="block text-sm mb-1">Revenue ($)</label>
          <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Ad Spend ($)</label>
          <input type="number" value={adSpend} onChange={(e) => setAdSpend(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">COGS %</label>
          <input type="number" value={cogsPct} onChange={(e) => setCogsPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Refunds %</label>
          <input type="number" value={refundPct} onChange={(e) => setRefundPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Payment Processing %</label>
          <input type="number" value={processingPct} onChange={(e) => setProcessingPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Operating Expenses ($)</label>
          <input type="number" value={opex} onChange={(e) => setOpex(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex items-center gap-2"><button onClick={downloadCsv} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded">Export CSV</button><HelpTip title="Interpretation">EBITDA reflects profitability after ad spend and operating expenses.</HelpTip></div>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">ROAS {metrics.roas.toFixed(2)}x</div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">Gross Profit ${metrics.grossProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">Contribution ${metrics.contrib.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">EBITDA ${metrics.ebitda.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  );
}
