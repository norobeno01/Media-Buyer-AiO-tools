"use client";

import { useMemo, useState } from "react";

function zTest(p1: number, n1: number, p2: number, n2: number) {
  const pPool = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  if (se === 0) return 0;
  return (p2 - p1) / se;
}

// Approximate inverse CDF for standard normal (Acklam's approximation)
function normInv(p: number) {
  if (p <= 0 || p >= 1) return NaN;
  const a1 = -3.969683028665376e+01;
  const a2 = 2.209460984245205e+02;
  const a3 = -2.759285104469687e+02;
  const a4 = 1.383577518672690e+02;
  const a5 = -3.066479806614716e+01;
  const a6 = 2.506628277459239e+00;
  const b1 = -5.447609879822406e+01;
  const b2 = 1.615858368580409e+02;
  const b3 = -1.556989798598866e+02;
  const b4 = 6.680131188771972e+01;
  const b5 = -1.328068155288572e+01;
  const c1 = -7.784894002430293e-03;
  const c2 = -3.223964580411365e-01;
  const c3 = -2.400758277161838e+00;
  const c4 = -2.549732539343734e+00;
  const c5 = 4.374664141464968e+00;
  const c6 = 2.938163982698783e+00;
  const d1 = 7.784695709041462e-03;
  const d2 = 3.224671290700398e-01;
  const d3 = 2.445134137142996e+00;
  const d4 = 3.754408661907416e+00;
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q: number, r: number;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (phigh < p) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  }
}

function requiredSampleSize(pBaseline: number, mde: number, alpha = 0.05, power = 0.8) {
  // Normal approximation for difference in proportions, two-sided
  const a = Math.min(0.5, Math.max(1e-6, alpha));
  const pow = Math.min(0.999, Math.max(0.5, power));
  const zAlpha = normInv(1 - a / 2); // two-sided critical value
  const zPower = normInv(pow); // desired power
  const pVariant = pBaseline + mde;
  const pPool = (pBaseline + pVariant) / 2;
  const sePool = Math.sqrt(2 * pPool * (1 - pPool));
  const seDiff = Math.sqrt(pBaseline * (1 - pBaseline) + pVariant * (1 - pVariant));
  const n = Math.pow((zAlpha * sePool + zPower * seDiff) / mde, 2);
  return Math.ceil(n);
}

export default function AbTestPage() {
  const [convRateA, setConvRateA] = useState<number>(0.05); // 5%
  const [convRateB, setConvRateB] = useState<number>(0.06); // 6%
  const [nA, setNA] = useState<number>(1000);
  const [nB, setNB] = useState<number>(1000);
  const [alpha, setAlpha] = useState<number>(0.05);
  const [power, setPower] = useState<number>(0.8);
  const [mde, setMde] = useState<number>(0.01);

  const z = useMemo(() => zTest(convRateA, nA, convRateB, nB), [convRateA, nA, convRateB, nB]);
  const pValue = useMemo(() => {
    // Two-sided p-value from z
    const absZ = Math.abs(z);
    const phi = 0.5 * (1 + erf(absZ / Math.SQRT2));
    return 2 * (1 - phi);
  }, [z]);

  const neededN = useMemo(() => requiredSampleSize(convRateA, mde, alpha, power), [convRateA, mde, alpha, power]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">Testing</span>
          <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full">Statistics</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">A/B Test Calculator</h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Compute statistical significance and required sample size for conversion rate tests with confidence intervals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Test Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Baseline conversion rate for variant A (0-1)">Conversion Rate A</label>
                <input 
                  type="number" 
                  step={0.001} 
                  min={0} 
                  max={1} 
                  value={convRateA} 
                  onChange={(e) => setConvRateA(parseFloat(e.target.value) || 0)} 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Conversion rate for variant B (0-1)">Conversion Rate B</label>
                <input 
                  type="number" 
                  step={0.001} 
                  min={0} 
                  max={1} 
                  value={convRateB} 
                  onChange={(e) => setConvRateB(parseFloat(e.target.value) || 0)} 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Sample size for A">Sample Size A</label>
                  <input 
                    type="number" 
                    min={1} 
                    value={nA} 
                    onChange={(e) => setNA(parseInt(e.target.value) || 1)} 
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Sample size for B">Sample Size B</label>
                  <input 
                    type="number" 
                    min={1} 
                    value={nB} 
                    onChange={(e) => setNB(parseInt(e.target.value) || 1)} 
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Statistical Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Desired significance level">Significance Level (Alpha)</label>
                <input 
                  type="number" 
                  step={0.001} 
                  min={0.001} 
                  max={0.5} 
                  value={alpha} 
                  onChange={(e) => setAlpha(parseFloat(e.target.value) || 0.05)} 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Desired test power">Statistical Power</label>
                <input 
                  type="number" 
                  step={0.01} 
                  min={0.5} 
                  max={0.99} 
                  value={power} 
                  onChange={(e) => setPower(parseFloat(e.target.value) || 0.8)} 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2" title="Minimum detectable effect (absolute difference in rate)">Minimum Detectable Effect</label>
                <input 
                  type="number" 
                  step={0.001} 
                  min={0.001} 
                  max={0.5} 
                  value={mde} 
                  onChange={(e) => setMde(parseFloat(e.target.value) || 0.01)} 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Test Results</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Z-Score</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{z.toFixed(2)}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Test statistic</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">P-Value</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{pValue.toFixed(4)}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {pValue < alpha ? 'Statistically significant' : 'Not significant'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Sample Size Requirements</h2>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Required Sample Size</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{neededN.toLocaleString()}</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Per variant</div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">
              This is the minimum sample size needed per variant to detect the specified minimum detectable effect with {Math.round(power * 100)}% power at α = {alpha}.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Statistical Notes</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Assumes normal approximation and independent samples. For low rates or counts, consider exact tests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error function approximation for p-value calculation
function erf(x: number) {
  // Abramowitz and Stegun formula 7.1.26
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}