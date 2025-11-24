"use client";

import { useMemo, useState } from "react";

type Issue = { category: string; examples: string[] };

const RULES: { platform: string; category: string; patterns: RegExp[]; hint: string }[] = [
  { platform: "Meta", category: "Personal attributes", hint: "Avoid implying traits/conditions of the user.", patterns: [/you\s*have/i, /your\s*(condition|disease|problem)/i, /are\s*you\s*(over|under)\s*\d+/i] },
  { platform: "Meta", category: "Before/After claims", hint: "Avoid before/after imagery or sensational claims.", patterns: [/before\s*and\s*after/i, /dramatic\s*results/i, /transform\w*/i] },
  { platform: "Meta", category: "Health claims", hint: "Do not claim cures or guaranteed outcomes.", patterns: [/cure\w*/i, /guarantee\w*/i, /100%\s*(results|success|safe)/i] },
  { platform: "Google", category: "Misleading content", hint: "Avoid misleading superlatives and unverifiable claims.", patterns: [/best\s*ever/i, /only\s*solution/i, /#1\s*(product|service)/i] },
  { platform: "Google", category: "Sensitive categories", hint: "Certain categories require extra certification.", patterns: [/crypto\b/i, /loan\b/i, /medicine\b/i] },
];

function checkText(platform: string, text: string): Issue[] {
  const issues: Issue[] = [];
  const rules = RULES.filter((r) => r.platform === platform);
  for (const rule of rules) {
    const hits: string[] = [];
    for (const p of rule.patterns) {
      const m = text.match(p);
      if (m) hits.push(m[0]);
    }
    if (hits.length) issues.push({ category: `${rule.category} — ${rule.hint}`, examples: hits });
  }
  return issues;
}

export default function PolicyCheckerPage() {
  const [platform, setPlatform] = useState("Meta");
  const [text, setText] = useState("");

  const issues = useMemo(() => (text.trim().length ? checkText(platform, text) : []), [platform, text]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Ad Policy Checker</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Paste ad copy to flag common risky phrases for platform policies.</p>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm">
            <option>Meta</option>
            <option>Google</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Ad Text</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full h-40 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-3 py-2 text-sm" placeholder="Paste your headline and primary text here..." />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Tip: Keep copy truthful, non-sensational, and compliant with policies.</p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Flags</h2>
        {issues.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No flags detected. Always review platform policies for updates.</p>
        ) : (
          <ul className="space-y-2">
            {issues.map((i, idx) => (
              <li key={idx} className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{i.category}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Examples: {i.examples.join(", ")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}