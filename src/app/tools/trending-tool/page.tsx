"use client";

import { useMemo, useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildHashtags(topic: string) {
  const base = slugify(topic).replace(/\s+/g, "");
  if (!base) return [];
  const variants = [
    `#${base}`,
    `#${base}Tips`,
    `#${base}Hack`,
    `#${base}Ideas`,
    `#${base}Guide`,
    `#${base}2025`,
    `#${base}Trend`,
    `#${base}Daily`,
  ];
  return Array.from(new Set(variants));
}

function buildHooks(topic: string) {
  const t = slugify(topic);
  if (!t) return [];
  const base = t.split(" ").map(w => w).join(" ");
  const hooks = [
    `I tested ${base} so you don’t have to`,
    `Beginners make this ${base} mistake — fix it in 3 steps`,
    `The fastest way to master ${base} (works in a day)`,
    `${base}: 5 myths vs facts`,
    `${base} on a budget: do this, not that`,
    `Top 10 ${base} ideas that actually convert`,
    `${base} checklist you can copy`,
  ];
  return hooks;
}

function buildAngles(topic: string) {
  const t = slugify(topic) || "your topic";
  return [
    `How-to: step-by-step ${t}`,
    `Comparison: ${t} vs alternatives`,
    `Before/After: transformation with ${t}`,
    `Mistakes: avoid these in ${t}`,
    `Templates: plug-and-play ${t}`,
    `FAQ: quick answers about ${t}`,
    `Unboxing/Walkthrough: show ${t} in action`,
  ];
}

function buildCalendar(topic: string, platform: string) {
  const t = slugify(topic);
  if (!t) return [] as string[];
  const p = platform;
  return [
    `Day 1 — Problem/Solution: The #1 ${t} mistake and a fix (${p})`,
    `Day 2 — Myth Busting: ${t} myths vs facts with examples (${p})`,
    `Day 3 — Tutorial: 3-step ${t} walkthrough anyone can follow (${p})`,
    `Day 4 — Comparison: ${t} vs alternative — pros/cons (${p})`,
    `Day 5 — Template: Plug-and-play ${t} template or checklist (${p})`,
    `Day 6 — Story: Before/After with ${t} and key learnings (${p})`,
    `Day 7 — Q&A: Answer 7 rapid-fire questions about ${t} (${p})`,
  ];
}

export default function TrendingToolPage() {
  const [topic, setTopic] = useState<string>("running shoes");
  const [platform, setPlatform] = useState<string>("TikTok");

  const hashtags = useMemo(() => buildHashtags(topic), [topic]);
  const hooks = useMemo(() => buildHooks(topic), [topic]);
  const angles = useMemo(() => buildAngles(topic), [topic]);
  const calendar = useMemo(() => buildCalendar(topic, platform), [topic, platform]);

  const copyAll = () => {
    const text = [
      `Platform: ${platform}`,
      `Topic: ${topic}`,
      "Hooks:",
      ...hooks,
      "\nAngles:",
      ...angles,
      "\nHashtags:",
      hashtags.join(" "),
      "\nContent Calendar (7 days):",
      ...calendar,
    ].join("\n");
    navigator.clipboard.writeText(text);
  };
  const copyCalendar = () => navigator.clipboard.writeText(calendar.join("\n"));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Trending Helper</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Generate platform-friendly hooks, angles, and hashtags from a topic. Use to ideate fast content and ads.</p>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm">
            <option>TikTok</option>
            <option>Meta</option>
            <option>YouTube</option>
            <option>Google</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Topic</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., email marketing, skincare, running shoes" className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">We don’t fetch external data; this helps you brainstorm trending-style content around your topic.</p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={copyAll} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900">Copy All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Hooks</h2>
            <ul className="space-y-2 text-sm">
              {hooks.map((h) => (
                <li key={h} className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2">{h}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Angles</h2>
            <ul className="space-y-2 text-sm">
              {angles.map((a) => (
                <li key={a} className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2">{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Hashtags</h2>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm">
              {hashtags.length ? hashtags.join(" ") : <span className="text-zinc-500 dark:text-zinc-400">Enter a topic to see hashtags</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Content Calendar (7 days)</h2>
          <button onClick={copyCalendar} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900">Copy Calendar</button>
        </div>
        <ul className="space-y-2 text-sm">
          {calendar.length ? (
            calendar.map((c) => (
              <li key={c} className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2">{c}</li>
            ))
          ) : (
            <li className="text-zinc-500 dark:text-zinc-400">Enter a topic to generate 7-day prompts</li>
          )}
        </ul>
      </section>
    </div>
  );
}