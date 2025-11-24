"use client";

import { useState, useMemo } from "react";

export default function PerformanceGrader() {
  const [metrics, setMetrics] = useState({
    impressions: "",
    clicks: "",
    conversions: "",
    spend: "",
    ctrBenchmark: "2.5",
    cvrBenchmark: "3.0",
    cpcBenchmark: "1.50"
  });

  const [results, setResults] = useState<any>(null);

  const calculateGrades = () => {
    const impressions = parseFloat(metrics.impressions) || 0;
    const clicks = parseFloat(metrics.clicks) || 0;
    const conversions = parseFloat(metrics.conversions) || 0;
    const spend = parseFloat(metrics.spend) || 0;
    const ctrBenchmark = parseFloat(metrics.ctrBenchmark) || 2.5;
    const cvrBenchmark = parseFloat(metrics.cvrBenchmark) || 3.0;
    const cpcBenchmark = parseFloat(metrics.cpcBenchmark) || 1.50;

    if (impressions === 0 || clicks === 0 || spend === 0) {
      alert("Please enter valid impressions, clicks, and spend values");
      return;
    }

    const ctr = (clicks / impressions) * 100;
    const cvr = (conversions / clicks) * 100;
    const cpc = spend / clicks;
    const cpa = spend / conversions;

    const ctrScore = Math.min(100, (ctr / ctrBenchmark) * 100);
    const cvrScore = Math.min(100, (cvr / cvrBenchmark) * 100);
    const cpcScore = Math.min(100, (cpcBenchmark / cpc) * 100);

    const overallScore = (ctrScore + cvrScore + cpcScore) / 3;

    let grade = "F";
    if (overallScore >= 90) grade = "A+";
    else if (overallScore >= 80) grade = "A";
    else if (overallScore >= 70) grade = "B";
    else if (overallScore >= 60) grade = "C";
    else if (overallScore >= 50) grade = "D";

    setResults({
      ctr: ctr.toFixed(2),
      cvr: cvr.toFixed(2),
      cpc: cpc.toFixed(2),
      cpa: cpa ? cpa.toFixed(2) : "N/A",
      ctrScore: ctrScore.toFixed(1),
      cvrScore: cvrScore.toFixed(1),
      cpcScore: cpcScore.toFixed(1),
      overallScore: overallScore.toFixed(1),
      grade
    });
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvContent = [
      ["Metric", "Value", "Score", "Grade"],
      ["CTR", `${results.ctr}%`, `${results.ctrScore}/100`, results.grade],
      ["Conversion Rate", `${results.cvr}%`, `${results.cvrScore}/100`, results.grade],
      ["CPC", `$${results.cpc}`, `${results.cpcScore}/100`, results.grade],
      ["CPA", results.cpa !== "N/A" ? `$${results.cpa}` : "N/A", "-", results.grade],
      ["Overall Score", "-", `${results.overallScore}/100`, results.grade]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-grade-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          Analysis
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Performance Grader</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Grade your campaign performance against industry benchmarks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Campaign Metrics</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Impressions
                </label>
                <input
                  type="number"
                  value={metrics.impressions}
                  onChange={(e) => setMetrics({...metrics, impressions: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Clicks
                </label>
                <input
                  type="number"
                  value={metrics.clicks}
                  onChange={(e) => setMetrics({...metrics, clicks: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Conversions
                </label>
                <input
                  type="number"
                  value={metrics.conversions}
                  onChange={(e) => setMetrics({...metrics, conversions: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Total Spend ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={metrics.spend}
                  onChange={(e) => setMetrics({...metrics, spend: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3750.00"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Benchmarks</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  CTR Benchmark (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={metrics.ctrBenchmark}
                  onChange={(e) => setMetrics({...metrics, ctrBenchmark: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Conversion Rate Benchmark (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={metrics.cvrBenchmark}
                  onChange={(e) => setMetrics({...metrics, cvrBenchmark: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  CPC Benchmark ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={metrics.cpcBenchmark}
                  onChange={(e) => setMetrics({...metrics, cpcBenchmark: e.target.value})}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1.50"
                />
              </div>
            </div>

            <button
              onClick={calculateGrades}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Grade Performance
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results && (
            <div className="space-y-4">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                <div className="text-6xl font-bold mb-2">
                  {results.grade === "A+" && "🎯"}
                  {results.grade === "A" && "⭐"}
                  {results.grade === "B" && "👍"}
                  {results.grade === "C" && "😐"}
                  {results.grade === "D" && "⚠️"}
                  {results.grade === "F" && "❌"}
                </div>
                <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {results.grade}
                </div>
                <div className="text-lg text-zinc-600 dark:text-zinc-400">
                  Overall Score: {results.overallScore}/100
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Performance Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">CTR</span>
                    <div className="text-right">
                      <div className="font-semibold">{results.ctr}%</div>
                      <div className="text-sm text-zinc-500">Score: {results.ctrScore}/100</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">Conversion Rate</span>
                    <div className="text-right">
                      <div className="font-semibold">{results.cvr}%</div>
                      <div className="text-sm text-zinc-500">Score: {results.cvrScore}/100</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">CPC</span>
                    <div className="text-right">
                      <div className="font-semibold">${results.cpc}</div>
                      <div className="text-sm text-zinc-500">Score: {results.cpcScore}/100</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">CPA</span>
                    <div className="text-right">
                      <div className="font-semibold">{results.cpa !== "N/A" ? `$${results.cpa}` : "N/A"}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={exportResults}
                  className="w-full bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                >
                  Export Results
                </button>
              </div>
            </div>
          )}

          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Grading Scale</h3>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <div>A+ (90-100): Exceptional performance</div>
              <div>A (80-89): Excellent performance</div>
              <div>B (70-79): Good performance</div>
              <div>C (60-69): Average performance</div>
              <div>D (50-59): Below average</div>
              <div>F (0-49): Needs improvement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}