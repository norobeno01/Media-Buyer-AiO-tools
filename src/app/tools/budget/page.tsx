"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";

type Channel = {
  name: string;
  percent: number;
};

export default function BudgetToolPage() {
  const [totalBudget, setTotalBudget] = useState<number>(10000);
  const [days, setDays] = useState<number>(30);
  const [channels, setChannels] = useState<Channel[]>([
    { name: "Meta Ads", percent: 40 },
    { name: "Google Ads", percent: 40 },
    { name: "TikTok Ads", percent: 20 },
  ]);

  const percentSum = useMemo(
    () => channels.reduce((sum, c) => sum + (isNaN(c.percent) ? 0 : c.percent), 0),
    [channels]
  );

  const dailyLimit = useMemo(() => (days > 0 ? totalBudget / days : 0), [totalBudget, days]);

  const computed = useMemo(
    () =>
      channels.map((c) => {
        const pct = isNaN(c.percent) ? 0 : c.percent;
        const allocation = (pct / 100) * totalBudget;
        const perDay = days > 0 ? allocation / days : 0;
        return { ...c, allocation, perDay };
      }),
    [channels, totalBudget, days]
  );

  function updateChannel(index: number, patch: Partial<Channel>) {
    setChannels((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addChannel() {
    setChannels((prev) => [...prev, { name: `Channel ${prev.length + 1}`, percent: 0 }]);
  }

  function removeChannel(index: number) {
    setChannels((prev) => prev.filter((_, i) => i !== index));
  }

  function downloadCSV() {
    const rows = [
      ["Channel", "Percent", "Total ($)", "Per Day ($)"]
    ];
    channels.forEach((c) => {
      const total = (totalBudget * (c.percent / 100));
      const perDay = days > 0 ? total / days : 0;
      rows.push([c.name || "", String(c.percent || 0), total.toFixed(2), perDay.toFixed(2)]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budget_allocation.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Planning Tool
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">Budget Calculator</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl">
          Plan and allocate your media budget across channels and timeframes with precision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Budget Settings</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Total Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Your total campaign budget across all channels
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Campaign Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full pr-12 pl-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 text-sm">days</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                How long your campaign will run
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Daily Budget</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  ${dailyLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Average daily spend across all channels
              </p>
            </div>
          </div>
        </div>

        {/* Channel Allocation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Channel Allocation</h2>
              <Button onClick={addChannel} size="sm">
                + Add Channel
              </Button>
            </div>

            <div className="space-y-4">
              {channels.map((channel, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={channel.name}
                      onChange={(e) => updateChannel(index, { name: e.target.value })}
                      placeholder="Channel name"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="w-32">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={channel.percent}
                        onChange={(e) => updateChannel(index, { percent: parseFloat(e.target.value) || 0 })}
                        className="w-full pr-8 pl-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 text-sm">%</span>
                    </div>
                  </div>

                  <div className="w-32 text-right">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      ${((channel.percent / 100) * totalBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      ${(days > 0 ? ((channel.percent / 100) * totalBudget) / days : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day
                    </div>
                  </div>

                  <button
                    onClick={() => removeChannel(index)}
                    className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove channel"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className={`text-lg font-semibold ${percentSum === 100 ? "text-green-600" : "text-red-600"}`}>
                    Total: {percentSum.toFixed(1)}%
                  </div>
                  {percentSum !== 100 && (
                    <div className="text-sm text-red-600">
                      Allocation must equal 100%
                    </div>
                  )}
                </div>
                <Button onClick={downloadCSV} variant="secondary" size="sm">
                  Download CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Allocation Summary</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Channel</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Percentage</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Budget</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Daily Budget</th>
              </tr>
            </thead>
            <tbody>
              {computed.map((channel, index) => (
                <tr key={index} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">{channel.name}</td>
                  <td className="py-3 px-4 text-right text-zinc-700 dark:text-zinc-300">{channel.percent.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    ${channel.allocation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-700 dark:text-zinc-300">
                    ${channel.perDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                ${dailyLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Daily Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {channels.length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Channels</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}