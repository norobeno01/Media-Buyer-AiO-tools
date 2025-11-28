"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

export default function TrueCACCohort() {
  const [spend, setSpend] = useState<string>("10000");
  const [newCustomers, setNewCustomers] = useState<string>("500");
  const [rev30, setRev30] = useState<string>("3000");
  const [rev60, setRev60] = useState<string>("6000");
  const [rev90, setRev90] = useState<string>("9000");
  const [proMode, setProMode] = useState<boolean>(false);
  const [repeatMarginPct, setRepeatMarginPct] = useState<string>("60");

  const baseCAC = useMemo(() => {
    const s = parseFloat(spend) || 0;
    const n = Math.max(1, parseFloat(newCustomers) || 0);
    return s / n;
  }, [spend, newCustomers]);

  const results = useMemo(() => {
    const n = Math.max(1, parseFloat(newCustomers) || 0);
    const m = ((parseFloat(repeatMarginPct) || 0) / 100);
    const r30 = (parseFloat(rev30) || 0) * (proMode ? m : 1);
    const r60 = (parseFloat(rev60) || 0) * (proMode ? m : 1);
    const r90 = (parseFloat(rev90) || 0) * (proMode ? m : 1);
    const ltv30 = r30 / n;
    const ltv60 = r60 / n;
    const ltv90 = r90 / n;
    const netCAC30 = Math.max(0, baseCAC - ltv30);
    const netCAC60 = Math.max(0, baseCAC - ltv60);
    const netCAC90 = Math.max(0, baseCAC - ltv90);
    const ratio30 = ltv30 > 0 ? (ltv30 / baseCAC) : 0;
    const ratio60 = ltv60 > 0 ? (ltv60 / baseCAC) : 0;
    const ratio90 = ltv90 > 0 ? (ltv90 / baseCAC) : 0;
    return { ltv30, ltv60, ltv90, netCAC30, netCAC60, netCAC90, ratio30, ratio60, ratio90 };
  }, [newCustomers, rev30, rev60, rev90, baseCAC, proMode, repeatMarginPct]);

  const downloadCsv = () => {
    const rows = [
      ["Acquisition Spend", spend],
      ["New Customers", newCustomers],
      ["Repeat Rev 30d", rev30],
      ["Repeat Rev 60d", rev60],
      ["Repeat Rev 90d", rev90],
      ["Repeat Margin % (Pro)", repeatMarginPct],
      ["Base CAC", baseCAC.toFixed(2)],
      ["LTV/CAC 30d", results.ratio30.toFixed(2)],
      ["LTV/CAC 60d", results.ratio60.toFixed(2)],
      ["LTV/CAC 90d", results.ratio90.toFixed(2)],
      ["Net CAC 30d", results.netCAC30.toFixed(2)],
      ["Net CAC 60d", results.netCAC60.toFixed(2)],
      ["Net CAC 90d", results.netCAC90.toFixed(2)],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `true-cac-cohort-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Analysis</div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">True CAC with Cohort Retention</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Blend CAC with 30/60/90-day retention revenue</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Inputs</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Acquisition Spend ($)</label>
                <input type="number" value={spend} onChange={(e) => setSpend(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">New Customers</label>
                <input type="number" value={newCustomers} onChange={(e) => setNewCustomers(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Repeat Rev 30d ($)</label>
                  <input type="number" value={rev30} onChange={(e) => setRev30(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Repeat Rev 60d ($)</label>
                  <input type="number" value={rev60} onChange={(e) => setRev60(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Repeat Rev 90d ($)</label>
                  <input type="number" value={rev90} onChange={(e) => setRev90(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={proMode} onChange={(e) => setProMode(e.target.checked)} />
                  Pro Mode
                </label>
                <HelpTip title="Logic">Net CAC subtracts per-customer retention revenue or margin from base CAC.</HelpTip>
              </div>
              {proMode && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Repeat Gross Margin %</label>
                  <input type="number" value={repeatMarginPct} onChange={(e) => setRepeatMarginPct(e.target.value)} className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                <HelpTip title="Ratios">Higher LTV:CAC indicates stronger payback.</HelpTip>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Base CAC</div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">${baseCAC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">Net CAC 30d</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">${results.netCAC30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">Net CAC 60d</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">${results.netCAC60.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">Net CAC 90d</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">${results.netCAC90.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">LTV:CAC 30d</div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{results.ratio30.toFixed(2)}x</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">LTV:CAC 60d</div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{results.ratio60.toFixed(2)}x</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">LTV:CAC 90d</div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{results.ratio90.toFixed(2)}x</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

