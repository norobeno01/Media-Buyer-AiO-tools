"use client";

import { useState } from "react";

export default function FunnelAnalyzer() {
  const [funnelSteps, setFunnelSteps] = useState([
    { name: "Visitors", count: "10000" },
    { name: "Leads", count: "1500" },
    { name: "Qualified Leads", count: "450" },
    { name: "Opportunities", count: "120" },
    { name: "Customers", count: "35" }
  ]);

  const [results, setResults] = useState<any>(null);

  const addStep = () => {
    setFunnelSteps([...funnelSteps, { name: "", count: "" }]);
  };

  const removeStep = (index: number) => {
    if (funnelSteps.length > 2) {
      setFunnelSteps(funnelSteps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: "name" | "count", value: string) => {
    const updated = [...funnelSteps];
    updated[index][field] = value;
    setFunnelSteps(updated);
  };

  const analyzeFunnel = () => {
    const steps = funnelSteps.map(step => ({
      ...step,
      count: parseFloat(step.count) || 0
    }));

    if (steps.some(step => step.count <= 0)) {
      alert("Please enter valid counts for all steps");
      return;
    }

    const analysis = steps.map((step, index) => {
      const conversionRate = index === 0 ? 100 : ((step.count / steps[0].count) * 100);
      const stepConversion = index === 0 ? 100 : ((step.count / steps[index - 1].count) * 100);
      const dropoff = index === 0 ? 0 : (steps[index - 1].count - step.count);
      const dropoffRate = index === 0 ? 0 : ((dropoff / steps[index - 1].count) * 100);

      return {
        ...step,
        conversionRate: conversionRate.toFixed(2),
        stepConversion: stepConversion.toFixed(2),
        dropoff,
        dropoffRate: dropoffRate.toFixed(2)
      };
    });

    const totalConversion = analysis[analysis.length - 1].conversionRate;
    const totalDropoff = analysis[0].count - analysis[analysis.length - 1].count;
    const biggestDropoffStep = analysis.reduce((max, step, index) => {
      if (index === 0) return { step: "", dropoff: 0 };
      return step.dropoff > max.dropoff ? { step: step.name, dropoff: step.dropoff } : max;
    }, { step: "", dropoff: 0 });

    setResults({
      steps: analysis,
      totalConversion: totalConversion,
      totalDropoff,
      biggestDropoffStep,
      funnelEfficiency: ((parseFloat(totalConversion) / 100) * 100).toFixed(1)
    });
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvContent = [
      ["Step", "Count", "Overall Conversion %", "Step Conversion %", "Dropoff", "Dropoff Rate %"],
      ...results.steps.map((step: any) => [
        step.name,
        step.count,
        step.conversionRate,
        step.stepConversion,
        step.dropoff,
        step.dropoffRate
      ]),
      ["", "", "", "", "", ""],
      ["Total Conversion Rate", `${results.totalConversion}%`, "", "", "", ""],
      ["Total Dropoffs", results.totalDropoff, "", "", "", ""],
      ["Biggest Dropoff Step", results.biggestDropoffStep.step, "", "", results.biggestDropoffStep.dropoff, ""],
      ["Funnel Efficiency Score", `${results.funnelEfficiency}/100`, "", "", "", ""]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnel-analysis-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          Analysis
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Funnel Analyzer</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Analyze conversion funnels and identify optimization opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Funnel Steps</h2>
              <button
                onClick={addStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Add Step
              </button>
            </div>
            
            <div className="space-y-3">
              {funnelSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => updateStep(index, "name", e.target.value)}
                      placeholder={`Step ${index + 1} name`}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={step.count}
                      onChange={(e) => updateStep(index, "count", e.target.value)}
                      placeholder="Count"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {funnelSteps.length > 2 && (
                    <button
                      onClick={() => removeStep(index)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={analyzeFunnel}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Analyze Funnel
            </button>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Tips for Better Analysis</h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Start with your highest traffic step (usually visitors)</li>
              <li>• Include all major conversion points</li>
              <li>• Use consistent time periods for all steps</li>
              <li>• Focus on steps with highest dropoff rates</li>
            </ul>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results && (
            <div className="space-y-4">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Funnel Summary</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {results.totalConversion}%
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Overall Conversion</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {results.totalDropoff}
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Total Dropoffs</div>
                  </div>
                </div>

                {results.biggestDropoffStep.step && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="text-sm text-red-600 dark:text-red-400 mb-1">Biggest Dropoff</div>
                    <div className="font-semibold text-red-800 dark:text-red-200">
                      {results.biggestDropoffStep.step} ({results.biggestDropoffStep.dropoff} users)
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Funnel Efficiency</div>
                  <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                    {results.funnelEfficiency}/100
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Step-by-Step Analysis</h3>
                  <button
                    onClick={exportResults}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                
                <div className="space-y-3">
                  {results.steps.map((step: any, index: number) => (
                    <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {index + 1}. {step.name}
                        </div>
                        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {step.count}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-zinc-500 dark:text-zinc-400">Overall Conv.</div>
                          <div className="font-semibold">{step.conversionRate}%</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 dark:text-zinc-400">Step Conv.</div>
                          <div className="font-semibold">{step.stepConversion}%</div>
                        </div>
                        {index > 0 && (
                          <div className="col-span-2">
                            <div className="text-zinc-500 dark:text-zinc-400">Dropoff</div>
                            <div className="font-semibold text-red-600 dark:text-red-400">
                              {step.dropoff} users ({step.dropoffRate}%)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}