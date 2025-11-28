"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

export default function PrivacyImpact() {
  const [iosSharePct, setIosSharePct] = useState("50");
  const [attLossPct, setAttLossPct] = useState("40");
  const [cookieLossPct, setCookieLossPct] = useState("20");
  const [reportedConversions, setReportedConversions] = useState("10000");
  const estimate = useMemo(() => {
    const ios = (parseFloat(iosSharePct) || 0) / 100;
    const att = (parseFloat(attLossPct) || 0) / 100;
    const cookie = (parseFloat(cookieLossPct) || 0) / 100;
    const rep = parseFloat(reportedConversions) || 0;
    const lostIos = rep * ios * att;
    const lostCookie = rep * cookie * 0.5;
    const trueConv = rep + lostIos + lostCookie;
    return { lostIos, lostCookie, trueConv };
  }, [iosSharePct, attLossPct, cookieLossPct, reportedConversions]);
  const downloadCsv = () => {
    const rows = [["Reported", reportedConversions],["Lost iOS", estimate.lostIos.toFixed(0)],["Lost Cookie", estimate.lostCookie.toFixed(0)],["Estimated True", estimate.trueConv.toFixed(0)]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `privacy-impact-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Diagnostics</div>
        <h1 className="text-3xl font-bold">iOS/Privacy Impact Simulator</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Estimate lost conversions from privacy changes</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <label className="block text-sm mb-1">iOS Share %</label>
          <input type="number" value={iosSharePct} onChange={(e) => setIosSharePct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">ATT Loss %</label>
          <input type="number" value={attLossPct} onChange={(e) => setAttLossPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Cookie Deprecation %</label>
          <input type="number" value={cookieLossPct} onChange={(e) => setCookieLossPct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Reported Conversions</label>
          <input type="number" value={reportedConversions} onChange={(e) => setReportedConversions(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex items-center gap-2"><button onClick={downloadCsv} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded">Export CSV</button><HelpTip title="Logic">Adds estimated lost conversions due to ATT and cookies.</HelpTip></div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Estimated True Conversions</div>
            <div className="text-3xl font-bold">{estimate.trueConv.toFixed(0)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">Lost iOS: {estimate.lostIos.toFixed(0)}</div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">Lost Cookie: {estimate.lostCookie.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

