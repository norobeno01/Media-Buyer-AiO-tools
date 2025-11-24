"use client";

import { useMemo, useState } from "react";

type Spec = {
  platform: "Meta" | "TikTok" | "YouTube" | "Google";
  format: string;
  aspectRatio: string;
  resolution: string;
  duration: string;
  fileSize: string;
  notes?: string;
};

const SPECS: Spec[] = [
  // Meta
  { platform: "Meta", format: "Feed Image", aspectRatio: "1:1", resolution: "1080x1080", duration: "—", fileSize: "<30MB", notes: "PNG/JPG; keep text <20% for readability" },
  { platform: "Meta", format: "Feed Video", aspectRatio: "4:5", resolution: "1080x1350", duration: "≤ 60s", fileSize: "<4GB", notes: "MP4/MOV; captions recommended" },
  { platform: "Meta", format: "Story/Reel", aspectRatio: "9:16", resolution: "1080x1920", duration: "≤ 90s", fileSize: "<4GB", notes: "Safe margin top/bottom" },
  // TikTok
  { platform: "TikTok", format: "In-Feed Video", aspectRatio: "9:16", resolution: "1080x1920", duration: "5–60s", fileSize: "<500MB", notes: "MP4/MOV; hook in first 3s" },
  { platform: "TikTok", format: "Spark Ad", aspectRatio: "9:16", resolution: "1080x1920", duration: "5–60s", fileSize: "<500MB", notes: "Use existing post; keep captions" },
  // YouTube
  { platform: "YouTube", format: "In-Stream (Skippable)", aspectRatio: "16:9", resolution: "1920x1080", duration: "≤ 3 min", fileSize: "<128GB", notes: "MP4; include branding before 5s" },
  { platform: "YouTube", format: "Shorts", aspectRatio: "9:16", resolution: "1080x1920", duration: "≤ 60s", fileSize: "<128GB", notes: "Vertical format" },
  // Google
  { platform: "Google", format: "Responsive Display (Image)", aspectRatio: "1:1 / 1.91:1", resolution: "1200x1200 / 1200x628", duration: "—", fileSize: "<150KB", notes: "PNG/JPG; upload multiple sizes" },
  { platform: "Google", format: "Responsive Video", aspectRatio: "16:9 / 1:1 / 9:16", resolution: "varies", duration: "≤ 30s", fileSize: "—", notes: "Provide multiple durations" },
];

export default function CreativeSpecsPage() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<string>("All");

  const filtered = useMemo(() => {
    return SPECS.filter((s) => {
      const matchesPlatform = platform === "All" || s.platform === platform;
      const q = query.toLowerCase();
      const matchesQuery = q.length === 0 || [s.format, s.aspectRatio, s.resolution, s.duration, s.fileSize, s.notes || ""].some((t) => t.toLowerCase().includes(q));
      return matchesPlatform && matchesQuery;
    });
  }, [query, platform]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Creative</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Creative Specs Helper</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Quickly reference ad specs across platforms. Filter by platform or search.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm">
            <option>All</option>
            <option>Meta</option>
            <option>TikTok</option>
            <option>YouTube</option>
            <option>Google</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Search</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., 9:16, feed, 1080x1920" className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm" />
        </div>
      </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{s.platform} • {s.format}</p>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">{s.aspectRatio}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-zinc-700 dark:text-zinc-300">Resolution</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{s.resolution}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-zinc-700 dark:text-zinc-300">Duration</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{s.duration}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-zinc-700 dark:text-zinc-300">File Size</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{s.fileSize}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-zinc-700 dark:text-zinc-300">Notes</p>
                <p className="text-zinc-900 dark:text-zinc-100">{s.notes || "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}