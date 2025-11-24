"use client";

import { useState } from "react";

type Result = {
  ok?: boolean;
  pixels?: { facebook: boolean; google: boolean; tiktok: boolean };
  error?: string;
};

export default function PixelCheckerPage() {
  const [url, setUrl] = useState<string>("https://example.com");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function check() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/pixel-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Pixel Installation Checker</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Validate common tracking pixels on a site. Some pages may block scraping; use public pages.</p>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm" />
        <div className="mt-3 flex items-center gap-2">
          <button onClick={check} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900" disabled={loading}>
            {loading ? "Checking..." : "Check Pixels"}
          </button>
        </div>
      </section>

      {result && (
        <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          {result.error ? (
            <p className="text-sm text-red-600">Error: {result.error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-zinc-700 dark:text-zinc-300">Facebook Pixel</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{result.pixels?.facebook ? "Installed" : "Not found"}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-zinc-700 dark:text-zinc-300">Google Analytics/Tag</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{result.pixels?.google ? "Installed" : "Not found"}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-zinc-700 dark:text-zinc-300">TikTok Pixel</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{result.pixels?.tiktok ? "Installed" : "Not found"}</p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}