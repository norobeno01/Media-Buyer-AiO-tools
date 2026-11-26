"use client";

import { useState } from "react";

export default function RedirectTesterPage() {
  const [url, setUrl] = useState<string>("");
  const [results, setResults] = useState<{
    originalUrl: string;
    finalUrl: string;
    redirectChain: { url: string; status: number; statusText: string }[];
    totalRedirects: number;
    totalTime: number;
    errors: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testRedirect = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const startTime = Date.now();
      const response = await fetch(`/api/redirect-test?url=${encodeURIComponent(url)}`);
      const endTime = Date.now();
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }
      setResults({
        ...data,
        totalTime: endTime - startTime
      });
    } catch (error) {
      setResults({
        originalUrl: url,
        finalUrl: url,
        redirectChain: [],
        totalRedirects: 0,
        totalTime: 0,
        errors: [error instanceof Error ? error.message : "Request failed"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setUrl("");
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400) return 'text-amber-600 dark:text-amber-400';
    if (status >= 400) return 'text-red-600 dark:text-red-400';
    return 'text-zinc-600 dark:text-zinc-400';
  };

  const getStatusBg = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
    if (status >= 300 && status < 400) return 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800';
    if (status >= 400) return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    return 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Redirect Tester</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Analyze redirect chains and identify optimization opportunities</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">URL Analysis</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">URL to Test</label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="https://example.com/page"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Enter the URL you want to test for redirects</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={testRedirect}
              disabled={!url.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </>
              ) : (
                'Test Redirects'
              )}
            </button>
            <button 
              onClick={clearResults}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Redirects</h3>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{results.totalRedirects}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Number of redirect hops</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Response Time</h3>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{results.totalTime}ms</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total redirect chain time</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
                  <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Final Status</h3>
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(results.redirectChain[results.redirectChain.length - 1]?.status || 0)}`}>
                {results.redirectChain[results.redirectChain.length - 1]?.status || 'N/A'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Final response status</p>
            </div>
          </div>

          {/* Redirect Chain */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Redirect Chain</h3>
            <div className="space-y-3">
              {results.redirectChain.map((step, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusBg(step.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-md">
                          {step.url}
                        </p>
                        <p className={`text-sm ${getStatusColor(step.status)}`}>
                          {step.status} {step.statusText}
                        </p>
                      </div>
                    </div>
                    {index < results.redirectChain.length - 1 && (
                      <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Errors */}
          {results.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Issues Found</p>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                    {results.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Best Practices</p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
              <li>• Minimize redirect chains to improve page load speed</li>
              <li>• Use 301 redirects for permanent URL changes</li>
              <li>• Avoid redirect loops that can break user experience</li>
              <li>• Test redirects after any website migration or restructuring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}