"use client";

import { useMemo, useState } from "react";

export default function CostsToolPage() {
  const [impressions, setImpressions] = useState<number>(100000);
  const [clicks, setClicks] = useState<number>(2500);
  const [conversions, setConversions] = useState<number>(120);
  const [spend, setSpend] = useState<number>(5000);

  const cpm = useMemo(() => (impressions > 0 ? (spend / impressions) * 1000 : 0), [spend, impressions]);
  const cpc = useMemo(() => (clicks > 0 ? spend / clicks : 0), [spend, clicks]);
  const cpa = useMemo(() => (conversions > 0 ? spend / conversions : 0), [spend, conversions]);
  const ctr = useMemo(() => (impressions > 0 ? (clicks / impressions) * 100 : 0), [clicks, impressions]);
  const cr = useMemo(() => (clicks > 0 ? (conversions / clicks) * 100 : 0), [conversions, clicks]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">Analysis</span>
          <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full">Metrics</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">CPM / CPC / CPA Calculator</h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Calculate key advertising metrics including cost per thousand impressions, cost per click, and cost per acquisition.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Input Metrics</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Total ad spend for the period">Spend ($)</label>
              <input 
                type="number" 
                min={0} 
                value={spend} 
                onChange={(e) => setSpend(parseFloat(e.target.value) || 0)} 
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Total impressions served">Impressions</label>
              <input 
                type="number" 
                min={0} 
                value={impressions} 
                onChange={(e) => setImpressions(parseInt(e.target.value) || 0)} 
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Total clicks received">Clicks</label>
              <input 
                type="number" 
                min={0} 
                value={clicks} 
                onChange={(e) => setClicks(parseInt(e.target.value) || 0)} 
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Total conversions (purchases, signups, etc.)">Conversions</label>
              <input 
                type="number" 
                min={0} 
                value={conversions} 
                onChange={(e) => setConversions(parseInt(e.target.value) || 0)} 
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Cost Metrics</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Cost Per Thousand Impressions</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">${cpm.toFixed(2)}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">CPM</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">Cost Per Click</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">${cpc.toFixed(2)}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">CPC</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Cost Per Acquisition</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">${cpa.toFixed(2)}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">CPA</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Performance Rates</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Click-Through Rate</div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{ctr.toFixed(2)}%</div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">CTR</div>
              </div>
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                <div className="text-sm text-teal-700 dark:text-teal-300 mb-1">Conversion Rate</div>
                <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{cr.toFixed(2)}%</div>
                <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">Conv. Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}