"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

export default function ProfitFirstBudget() {
  const [aov, setAov] = useState<string>("100");
  const [grossMarginPct, setGrossMarginPct] = useState<string>("60");
  const [refundPct, setRefundPct] = useState<string>("3");
  const [paymentFeesPct, setPaymentFeesPct] = useState<string>("2.9");
  const [targetNetMarginPct, setTargetNetMarginPct] = useState<string>("15");
  const [proMode, setProMode] = useState<boolean>(false);
  const [fixedCostPerOrder, setFixedCostPerOrder] = useState<string>("0");

  const results = useMemo(() => {
    const AOV = parseFloat(aov) || 0;
    const gm = (parseFloat(grossMarginPct) || 0) / 100;
    const refunds = (parseFloat(refundPct) || 0) / 100;
    const fees = (parseFloat(paymentFeesPct) || 0) / 100;
    const target = (parseFloat(targetNetMarginPct) || 0) / 100;
    const fixed = parseFloat(fixedCostPerOrder) || 0;

    const marginAfterCosts = Math.max(0, gm - refunds - fees - target);
    const maxCAC = Math.max(0, AOV * marginAfterCosts - fixed);
    const maxROAS = maxCAC > 0 ? AOV / maxCAC : Infinity;

    return { maxCAC, maxROAS, marginAfterCosts };
  }, [aov, grossMarginPct, refundPct, paymentFeesPct, targetNetMarginPct, fixedCostPerOrder]);

  const downloadCsv = () => {
    const rows = [
      ["AOV", aov],
      ["Gross Margin %", grossMarginPct],
      ["Refund Rate %", refundPct],
      ["Payment Fees %", paymentFeesPct],
      ["Target Net Margin %", targetNetMarginPct],
      ["Fixed Cost Per Order", fixedCostPerOrder],
      ["Max CAC", results.maxCAC.toFixed(2)],
      ["Max ROAS Threshold", results.maxROAS === Infinity ? "∞" : results.maxROAS.toFixed(2)],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-first-budget-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Planning</div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Profit-First Budget Calculator</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Compute max allowable ad spend to hit target net margin</p>
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
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Gross Margin %</label>
                <input type="number" value={grossMarginPct} onChange={(e) => setGrossMarginPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Refund Rate %</label>
                  <input type="number" value={refundPct} onChange={(e) => setRefundPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Payment Fees %</label>
                  <input type="number" value={paymentFeesPct} onChange={(e) => setPaymentFeesPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Target Net Margin %</label>
                <input type="number" value={targetNetMarginPct} onChange={(e) => setTargetNetMarginPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={proMode} onChange={(e) => setProMode(e.target.checked)} />
                  Pro Mode
                </label>
                <HelpTip title="Logic">
                  Uses margin after refunds, fees, and target net margin to compute max CAC and ROAS thresholds.
                </HelpTip>
              </div>

              {proMode && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Fixed Cost Per Order ($)</label>
                    <input type="number" value={fixedCostPerOrder} onChange={(e) => setFixedCostPerOrder(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
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
                <HelpTip title="Thresholds">Max CAC ensures target net margin. Max ROAS is the minimum efficiency required.</HelpTip>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">Max CAC</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">${results.maxCAC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Max ROAS Threshold</div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{results.maxROAS === Infinity ? "∞" : `${results.maxROAS.toFixed(2)}x`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

