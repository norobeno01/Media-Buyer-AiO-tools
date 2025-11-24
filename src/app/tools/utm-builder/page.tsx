"use client";

import { useMemo, useState } from "react";

function buildUtmUrl(base: string, params: Record<string, string>) {
  try {
    const url = new URL(base);
    Object.entries(params).forEach(([k, v]) => {
      if (v && v.trim().length > 0) url.searchParams.set(k, v.trim());
    });
    return url.toString();
  } catch {
    return "";
  }
}

export default function UTMBuilderPage() {
  const [baseUrl, setBaseUrl] = useState("https://example.com/product");
  const [source, setSource] = useState("facebook");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("spring_sale");
  const [content, setContent] = useState("video_a");
  const [term, setTerm] = useState("");

  const utmUrl = useMemo(() => {
    return buildUtmUrl(baseUrl, {
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_content: content,
      utm_term: term,
    });
  }, [baseUrl, source, medium, campaign, content, term]);

  const valid = useMemo(() => utmUrl.length > 0, [utmUrl]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Tracking</span>
          <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full">Campaign</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">UTM Builder</h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Construct tracking URLs with source, medium, campaign, content, and term parameters to measure your marketing campaigns effectively.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Campaign Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Base URL</label>
                <input 
                  value={baseUrl} 
                  onChange={(e) => setBaseUrl(e.target.value)} 
                  placeholder="https://yourdomain.com/page" 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Must be a valid URL (includes protocol)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Source (utm_source)</label>
                <input 
                  value={source} 
                  onChange={(e) => setSource(e.target.value)} 
                  placeholder="facebook, google, newsletter" 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Medium (utm_medium)</label>
                <input 
                  value={medium} 
                  onChange={(e) => setMedium(e.target.value)} 
                  placeholder="cpc, email, social" 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Campaign (utm_campaign)</label>
                <input 
                  value={campaign} 
                  onChange={(e) => setCampaign(e.target.value)} 
                  placeholder="spring_sale, product_launch" 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Content (utm_content)</label>
                <input 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="video_a, banner_1, text_link" 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Term (utm_term)</label>
                <input 
                  value={term} 
                  onChange={(e) => setTerm(e.target.value)} 
                  placeholder="running_shoes, marketing_software" 
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Generated URL</h2>
            {valid ? (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Your tracking URL:</p>
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-md border border-zinc-200 dark:border-zinc-700">
                    <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 break-all">{utmUrl}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigator.clipboard.writeText(utmUrl)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to Clipboard
                </button>
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">Invalid base URL. Please include the protocol (e.g., https://)</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">UTM Parameter Guide</h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p><strong>Source:</strong> Where traffic originates (facebook, google, newsletter)</p>
              <p><strong>Medium:</strong> Marketing medium (cpc, email, social, organic)</p>
              <p><strong>Campaign:</strong> Specific campaign name (spring_sale, product_launch)</p>
              <p><strong>Content:</strong> Differentiates similar content (video_a, banner_1)</p>
              <p><strong>Term:</strong> Keywords for paid search (running_shoes, marketing)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}