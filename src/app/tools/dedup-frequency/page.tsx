"use client";

import { useMemo, useState } from "react";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export default function DedupFrequencyPage() {
  const [audA, setAudA] = useState(500_000);
  const [audB, setAudB] = useState(400_000);
  const [overlapPct, setOverlapPct] = useState(30); // % of smaller audience
  const [imprA, setImprA] = useState(1_200_000);
  const [imprB, setImprB] = useState(900_000);

  const metrics = useMemo(() => {
    const A = Math.max(0, audA);
    const B = Math.max(0, audB);
    const smaller = Math.min(A, B);
    const ovPct = clamp(overlapPct);
    const overlapCount = Math.floor(smaller * (ovPct / 100));
    const unionReach = A + B - overlapCount;

    const totalImpr = Math.max(0, imprA) + Math.max(0, imprB);
    const avgFreqNoDedup = unionReach > 0 ? totalImpr / unionReach : 0;

    // Approximate duplicated impressions proportionally to overlapped population share.
    const duplicationRate = unionReach > 0 ? overlapCount / unionReach : 0;
    const duplicatedImprApprox = Math.round(totalImpr * duplicationRate);

    // Dedup scenario: assume we exclude the overlap from campaign B targeting.
    // We keep same reach union but avoid cross-campaign duplication.
    const avoidedDupImpr = duplicatedImprApprox; // naive approximation
    const efficiencyGainPct = totalImpr > 0 ? (avoidedDupImpr / totalImpr) * 100 : 0;

    return {
      A,
      B,
      overlapCount,
      unionReach,
      avgFreqNoDedup,
      duplicatedImprApprox,
      avoidedDupImpr,
      efficiencyGainPct,
      totalImpr,
    };
  }, [audA, audB, overlapPct, imprA, imprB]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Audience Dedup vs Frequency</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Model reach loss and duplicated impressions by overlap assumptions; estimate efficiency gains from deduplication.</p>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Audience A size</label>
            <input type="number" min={0} value={audA} onChange={(e) => setAudA(parseInt(e.target.value || "0", 10))} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Audience B size</label>
            <input type="number" min={0} value={audB} onChange={(e) => setAudB(parseInt(e.target.value || "0", 10))} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Overlap (% of smaller)</label>
            <input type="number" min={0} max={100} value={overlapPct} onChange={(e) => setOverlapPct(parseFloat(e.target.value || "0"))} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Impressions A</label>
            <input type="number" min={0} value={imprA} onChange={(e) => setImprA(parseInt(e.target.value || "0", 10))} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Impressions B</label>
            <input type="number" min={0} value={imprB} onChange={(e) => setImprB(parseInt(e.target.value || "0", 10))} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-200">Assumptions</h2>
            <ul className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              <li>Overlap estimated as a percentage of the smaller audience.</li>
              <li>Duplicated impressions approximate proportional to overlapped population share.</li>
              <li>Dedup excludes overlapped segment from one campaign to avoid duplication.</li>
            </ul>
          </div>
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-200">Key Metrics</h2>
            <ul className="mt-2 text-sm text-zinc-800 dark:text-zinc-200 space-y-1">
              <li>Union reach: {metrics.unionReach.toLocaleString()}</li>
              <li>Overlap count: {metrics.overlapCount.toLocaleString()}</li>
              <li>Total impressions: {metrics.totalImpr.toLocaleString()}</li>
              <li>Avg frequency (no dedup): {metrics.avgFreqNoDedup.toFixed(2)}</li>
              <li>Duplicated impressions (approx): {metrics.duplicatedImprApprox.toLocaleString()}</li>
              <li>Duplicated impressions avoided (dedup): {metrics.avoidedDupImpr.toLocaleString()}</li>
              <li>Efficiency gain: {metrics.efficiencyGainPct.toFixed(1)}%</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}