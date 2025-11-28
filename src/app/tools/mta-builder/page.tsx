"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type TouchRow = { name: string; conversions: string; weight: string };

export default function MtaBuilder() {
  const [rows, setRows] = useState<TouchRow[]>([
    { name: "Meta Click", conversions: "3000", weight: "0.5" },
    { name: "Google Click", conversions: "2000", weight: "0.3" },
    { name: "Email Open", conversions: "1000", weight: "0.2" },
  ]);
  const totals = useMemo(() => {
    const weighted = rows.reduce((s, r) => s + (parseFloat(r.conversions) || 0) * (parseFloat(r.weight) || 0), 0);
    const sumWeights = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
    const normalized = rows.map(r => ({ name: r.name, value: sumWeights > 0 ? ((parseFloat(r.conversions) || 0) * (parseFloat(r.weight) || 0)) / sumWeights : 0 }));
    return { weighted, normalized };
  }, [rows]);
  const updateRow = (i: number, patch: Partial<TouchRow>) => setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addRow = () => setRows([...rows, { name: "Touch", conversions: "0", weight: "0" }]);
  const downloadCsv = () => {
    const header = ["Touch","Attributed"];
    const data = totals.normalized.map(n => [n.name, n.value.toFixed(2)]);
    const csv = [header, ...data].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mta-builder-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Analysis</div>
      <h1 className="text-3xl font-bold">Multi-Touch Attribution Builder</h1>
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Touch</th>
              <th className="text-left py-2 px-3">Conversions</th>
              <th className="text-left py-2 px-3">Weight</th>
              <th className="text-left py-2 px-3">Attributed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => {
              const attributed = (parseFloat(r.conversions) || 0) * (parseFloat(r.weight) || 0);
              return (
                <tr key={i}>
                  <td className="py-2 px-3"><input value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} className="w-32 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3"><input type="number" value={r.conversions} onChange={(e) => updateRow(i, { conversions: e.target.value })} className="w-24 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3"><input type="number" step="0.1" value={r.weight} onChange={(e) => updateRow(i, { weight: e.target.value })} className="w-20 px-2 py-1 border rounded" /></td>
                  <td className="py-2 px-3 text-blue-700 font-semibold">{attributed.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-4 flex items-center justify-between"><button onClick={addRow} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">+ Add Touch</button><div className="flex items-center gap-2"><button onClick={downloadCsv} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded">Export CSV</button><HelpTip title="Models">Rule-based weights approximate MTA; compare different schemes.</HelpTip></div></div>
      </div>
    </div>
  );
}

