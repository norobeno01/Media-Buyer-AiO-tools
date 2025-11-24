"use client";

import { useMemo, useState } from "react";

export default function ReachFrequencyPage() {
  const [audience, setAudience] = useState<number>(1000000);
  const [budget, setBudget] = useState<number>(10000);
  const [cpm, setCpm] = useState<number>(10);

  const impressions = useMemo(() => (cpm > 0 ? (budget / cpm) * 1000 : 0), [budget, cpm]);
  // Poisson reach approximation: reach = audience * (1 - exp(-impressions/audience))
  const reach = useMemo(() => {
    if (audience <= 0) return 0;
    const lambda = impressions / audience;
    return Math.round(audience * (1 - Math.exp(-lambda)));
  }, [audience, impressions]);
  const frequency = useMemo(() => (reach > 0 ? impressions / reach : 0), [impressions, reach]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          Planning
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100">Reach & Frequency Calculator</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Estimate reach and average frequency from budget and CPM</p>
      </div>

      {/* Input Section */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Campaign Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Audience Size</label>
            <input 
              type="number" 
              min={0} 
              value={audience} 
              onChange={(e) => setAudience(parseInt(e.target.value) || 0)} 
              className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Enter audience size"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total size of your target audience</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Budget ($)</label>
            <input 
              type="number" 
              min={0} 
              value={budget} 
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)} 
              className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Enter total budget"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total media budget</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">CPM ($)</label>
            <input 
              type="number" 
              min={0} 
              value={cpm} 
              onChange={(e) => setCpm(parseFloat(e.target.value) || 0)} 
              className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Enter CPM rate"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Cost per thousand impressions</p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Impressions</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{Math.round(impressions).toLocaleString()}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Estimated total impressions</p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reach</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{reach.toLocaleString()}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Estimated unique people reached</p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Avg Frequency</h3>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{frequency.toFixed(2)}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Average exposures per reached person</p>
        </div>
      </div>

      {/* Note */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Calculation Note</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">This approximation assumes random exposure. Real platform delivery may differ based on targeting, optimization, and other factors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}