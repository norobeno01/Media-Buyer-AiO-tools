"use client";

import { useState } from "react";

type Analysis = {
  ok?: boolean;
  analysis?: {
    title: string | null;
    metaDescription: string | null;
    wordCount: number;
    h1Count: number;
    ctaHits: string[];
    buttonCount: number;
    trustHits: string[];
    imgCount: number;
    imgWithAltCount: number;
    altRatio: number;
    formCount: number;
    emailInputCount: number;
    scriptCount: number;
    thirdPartyScripts: string[];
    scores: { content: number; seo: number; cta: number; trust: number; accessibility: number; tech: number };
    suggestions: string[];
  };
  error?: string;
};

export default function LandingAnalyzerPage() {
  const [url, setUrl] = useState("https://example.com");
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/landing-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      setData(json);
    } catch {
      setData({ error: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Landing Page Analyzer</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Scan a URL for conversion elements, SEO basics, accessibility, and technical bloat. Use public pages.</p>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm" />
        <div className="mt-3 flex items-center gap-2">
          <button onClick={analyze} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </section>

      {data && (
        <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
          {data.error ? (
            <p className="text-sm text-red-600">Error: {data.error}</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                  <p className="text-zinc-700 dark:text-zinc-300">Content Score</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{data.analysis?.scores.content}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Words: {data.analysis?.wordCount} • H1: {data.analysis?.h1Count}</p>
                </div>
                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                  <p className="text-zinc-700 dark:text-zinc-300">SEO Score</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{data.analysis?.scores.seo}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Title: {data.analysis?.title || '—'}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Meta: {data.analysis?.metaDescription || '—'}</p>
                </div>
                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                  <p className="text-zinc-700 dark:text-zinc-300">CTA Score</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{data.analysis?.scores.cta}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">CTAs: {data.analysis?.ctaHits?.length || 0} • Buttons/Links: {data.analysis?.buttonCount}</p>
                </div>
                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                  <p className="text-zinc-700 dark:text-zinc-300">Trust Score</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{data.analysis?.scores.trust}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Signals: {data.analysis?.trustHits?.join(', ') || '—'}</p>
                </div>
                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                  <p className="text-zinc-700 dark:text-zinc-300">Accessibility Score</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{data.analysis?.scores.accessibility}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Images: {data.analysis?.imgWithAltCount}/{data.analysis?.imgCount} with alt</p>
                </div>
                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                  <p className="text-zinc-700 dark:text-zinc-300">Tech Score</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{data.analysis?.scores.tech}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Scripts: {data.analysis?.scriptCount} • 3rd-party: {data.analysis?.thirdPartyScripts?.length || 0}</p>
                </div>
              </div>

              <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Suggestions</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300">
                  {data.analysis?.suggestions?.length ? (
                    data.analysis?.suggestions.map((s, i) => <li key={i}>{s}</li>)
                  ) : (
                    <li>No immediate issues detected. Nice work!</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}