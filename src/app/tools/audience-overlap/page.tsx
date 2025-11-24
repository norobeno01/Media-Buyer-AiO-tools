"use client";

import { useMemo, useState } from "react";

export default function AudienceOverlapPage() {
  const [aSize, setASize] = useState<number>(100000);
  const [bSize, setBSize] = useState<number>(80000);
  const [overlapPct, setOverlapPct] = useState<number>(30); // % of the smaller audience

  const metrics = useMemo(() => {
    const a = Math.max(0, Math.floor(aSize));
    const b = Math.max(0, Math.floor(bSize));
    const base = Math.min(a, b);
    const overlapCount = Math.round(base * Math.max(0, Math.min(100, overlapPct)) / 100);
    const union = Math.max(0, a + b - overlapCount);
    const uniqueA = Math.max(0, a - overlapCount);
    const uniqueB = Math.max(0, b - overlapCount);
    const duplicationRate = union > 0 ? (overlapCount / union) * 100 : 0;
    return { a, b, overlapCount, union, uniqueA, uniqueB, duplicationRate };
  }, [aSize, bSize, overlapPct]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">Analysis</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Audience Overlap Estimator</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Estimate unique reach when combining two audiences using an assumed overlap percent relative to the smaller audience.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Audience Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Audience A Size</label>
            <input type="number" min={0} value={aSize} onChange={(e) => setASize(parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Audience B Size</label>
            <input type="number" min={0} value={bSize} onChange={(e) => setBSize(parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Estimated Overlap (%)</label>
            <input type="number" min={0} max={100} value={overlapPct} onChange={(e) => setOverlapPct(parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Applied to the smaller audience.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Overlap</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.overlapCount.toLocaleString()}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Users in both audiences</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <div className="text-sm text-green-700 dark:text-green-300 mb-1">Union Reach</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.union.toLocaleString()}</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">Combined unique users</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Unique to A</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{metrics.uniqueA.toLocaleString()}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Only in audience A</div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
          <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Unique to B</div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{metrics.uniqueB.toLocaleString()}</div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Only in audience B</div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Analysis</h2>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300">Duplication Rate</div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{metrics.duplicationRate.toFixed(2)}%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Overlap efficiency</div>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">Lower is better for reach</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}