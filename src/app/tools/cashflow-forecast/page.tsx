"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type Row = { week: string; spend: string; payoutDelayDays: string; refundPct: string };

export default function CashflowForecast() {
  const [rows, setRows] = useState<Row[]>([
    { week: "2025-01-01", spend: "10000", payoutDelayDays: "7", refundPct: "3" },
    { week: "2025-01-08", spend: "12000", payoutDelayDays: "7", refundPct: "3" },
  ]);
  const result = useMemo(() => rows.map(r => {
    const spend = parseFloat(r.spend) || 0;
    const delay = parseFloat(r.payoutDelayDays) || 0;
    const refunds = spend * ((parseFloat(r.refundPct) || 0) / 100);
    const outflow = spend;
    const inflow = Math.max(0, spend - refunds);
    const payoutDate = new Date(new Date(r.week).getTime() + delay * 86400000).toISOString().slice(0,10);
    return { week: r.week, outflow, inflow, payoutDate };
  }), [rows]);
  const updateRow = (i: number, patch: Partial<Row>) => setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addRow = () => setRows([...rows, { week: new Date().toISOString().slice(0,10), spend: "0", payoutDelayDays: "7", refundPct: "0" }]);
  const downloadCsv = () => {
    const header = ["Week","Outflow","Inflow","PayoutDate"];
    const data = result.map(r => [r.week, r.outflow.toFixed(2), r.inflow.toFixed(2), r.payoutDate]);
    const csv = [header, ...data].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashflow-forecast-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Operations</div>
      <h1 className="text-3xl font-bold">Cash Flow Forecast for Ad Spend</h1>
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Week</th>
              <th className="text-left py-2 px-3">Spend ($)</th>
              <th className="text-left py-2 px-3">Payout Delay (days)</th>
              <th className="text-left py-2 px-3">Refund %</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="py-2 px-3"><input type="date" value={r.week} onChange={(e) => updateRow(i, { week: e.target.value })} className="px-2 py-1 border rounded" /></td>
                <td className="py-2 px-3"><input type="number" value={r.spend} onChange={(e) => updateRow(i, { spend: e.target.value })} className="w-24 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-3"><input type="number" value={r.payoutDelayDays} onChange={(e) => updateRow(i, { payoutDelayDays: e.target.value })} className="w-24 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-3"><input type="number" value={r.refundPct} onChange={(e) => updateRow(i, { refundPct: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center justify-between"><button onClick={addRow} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">+ Add Week</button><div className="flex items-center gap-2"><button onClick={downloadCsv} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded">Export CSV</button><HelpTip title="Timing">Outflows occur at spend; inflows follow payout delay minus refunds.</HelpTip></div></div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.map((r, i) => (
            <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">{r.week}: Outflow ${r.outflow.toFixed(2)} • Inflow ${r.inflow.toFixed(2)} on {r.payoutDate}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

