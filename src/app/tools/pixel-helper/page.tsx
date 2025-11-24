"use client";

import { useState } from "react";

export default function PixelHelperPage() {
  const [pixelCode, setPixelCode] = useState<string>("");
  const [testUrl, setTestUrl] = useState<string>("");
  const [results, setResults] = useState<{
    facebook: boolean;
    google: boolean;
    linkedin: boolean;
    tiktok: boolean;
    twitter: boolean;
    errors: string[];
  } | null>(null);

  const analyzePixel = () => {
    if (!pixelCode.trim()) return;
    
    const facebook = /fbq\(['"]init['"]|facebook\.com\/tr/i.test(pixelCode);
    const google = /gtag\(['"]config['"]|googletagmanager\.com/i.test(pixelCode);
    const linkedin = /linkedin\.com\/li\.o|_linkedin_partner_id/i.test(pixelCode);
    const tiktok = /ttq\.track|tiktok\.com\/i18n\/pixel/i.test(pixelCode);
    const twitter = /twq\(['"]init['"]|analytics\.twitter\.com/i.test(pixelCode);
    
    const errors: string[] = [];
    
    if (!facebook && !google && !linkedin && !tiktok && !twitter) {
      errors.push("No recognized tracking pixels found in the code");
    }
    
    if (pixelCode.includes("<script") && !pixelCode.includes("</script>")) {
      errors.push("Missing closing script tag");
    }
    
    if (pixelCode.includes("window") && !pixelCode.includes("typeof window")) {
      errors.push("Consider adding window object checks for server-side rendering");
    }

    setResults({ facebook, google, linkedin, tiktok, twitter, errors });
  };

  const clearResults = () => {
    setResults(null);
    setPixelCode("");
    setTestUrl("");
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M6.343 6.343L4.929 4.929M19.071 19.071l-1.414 1.414M6.343 17.657L4.929 19.071M19.071 4.929l-1.414-1.414M12 12h.01M12 8h.01M12 16h.01" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Pixel Helper</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Analyze and validate tracking pixels across platforms</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Pixel Analysis</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Tracking Pixel Code</label>
            <textarea 
              value={pixelCode}
              onChange={(e) => setPixelCode(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 font-mono" 
              placeholder="Paste your tracking pixel code here..."
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Include the full JavaScript code from your tracking platform</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Test URL (Optional)</label>
            <input 
              type="url" 
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="https://example.com"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">URL where the pixel will be deployed (for validation)</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={analyzePixel}
              disabled={!pixelCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
            >
              Analyze Pixel
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
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Analysis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${results.facebook ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${results.facebook ? 'bg-green-100 dark:bg-green-900' : 'bg-zinc-100 dark:bg-zinc-700'}`}>
                  {results.facebook ? (
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Facebook Pixel</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{results.facebook ? 'Detected' : 'Not found'}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${results.google ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${results.google ? 'bg-green-100 dark:bg-green-900' : 'bg-zinc-100 dark:bg-zinc-700'}`}>
                  {results.google ? (
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Google Analytics</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{results.google ? 'Detected' : 'Not found'}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${results.linkedin ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${results.linkedin ? 'bg-green-100 dark:bg-green-900' : 'bg-zinc-100 dark:bg-zinc-700'}`}>
                  {results.linkedin ? (
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">LinkedIn Insight</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{results.linkedin ? 'Detected' : 'Not found'}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${results.tiktok ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${results.tiktok ? 'bg-green-100 dark:bg-green-900' : 'bg-zinc-100 dark:bg-zinc-700'}`}>
                  {results.tiktok ? (
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">TikTok Pixel</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{results.tiktok ? 'Detected' : 'Not found'}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${results.twitter ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${results.twitter ? 'bg-green-100 dark:bg-green-900' : 'bg-zinc-100 dark:bg-zinc-700'}`}>
                  {results.twitter ? (
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Twitter Pixel</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{results.twitter ? 'Detected' : 'Not found'}</p>
                </div>
              </div>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Issues Found</p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
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
              <li>• Always test pixels in a staging environment first</li>
              <li>• Place conversion pixels on thank-you/confirmation pages</li>
              <li>• Use Google Tag Manager for easier pixel management</li>
              <li>• Regularly audit your pixels for accuracy and compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}