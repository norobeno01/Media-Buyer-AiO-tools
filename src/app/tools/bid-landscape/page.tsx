"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

export default function BidLandscape() {
  const [baseBid, setBaseBid] = useState("1.00");
  const [bidChangePct, setBidChangePct] = useState("10");
  const [elasticity, setElasticity] = useState("-0.5");
  const [baseVolume, setBaseVolume] = useState("100000");
  const result = useMemo(() => {
    const b = parseFloat(baseBid) || 0;
    const ch = (parseFloat(bidChangePct) || 0) / 100;
    const e = parseFloat(elasticity) || 0;
    const vol = parseFloat(baseVolume) || 0;
    const newBid = b * (1 + ch);
    const newVol = vol * Math.exp(e * ch);
    const cpc = newBid;
    return { newBid, newVol, cpc };
  }, [baseBid, bidChangePct, elasticity, baseVolume]);
  const downloadCsv = () => {
    const rows = [["New Bid", result.newBid.toFixed(4)],["New Volume", result.newVol.toFixed(0)],["CPC", result.cpc.toFixed(4)]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bid-landscape-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Planning</div>
      <h1 className="text-3xl font-bold">Bid Landscape Explorer</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <label className="block text-sm mb-1">Base Bid</label>
          <input type="number" step="0.0001" value={baseBid} onChange={(e) => setBaseBid(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Bid Change %</label>
          <input type="number" value={bidChangePct} onChange={(e) => setBidChangePct(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Auction Elasticity</label>
          <input type="number" step="0.1" value={elasticity} onChange={(e) => setElasticity(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Base Volume</label>
          <input type="number" value={baseVolume} onChange={(e) => setBaseVolume(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex items-center gap-2"><button onClick={downloadCsv} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded">Export CSV</button><HelpTip title="Elasticity">Negative elasticity: higher bids reduce volume; tune per platform.</HelpTip></div>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">New Bid ${result.newBid.toFixed(4)}</div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">New Volume {result.newVol.toFixed(0)}</div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">CPC ${result.cpc.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}

