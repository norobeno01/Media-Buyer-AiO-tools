"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

export default function MediaBrief() {
  const [goal, setGoal] = useState("Drive profitable growth in Q1");
  const [audience, setAudience] = useState("Women 25-44, US");
  const [valueProp, setValueProp] = useState("Premium quality at fair price");
  const [pastWinners, setPastWinners] = useState("UGC with product demo; Value-focused headlines");
  const brief = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# AI Media Brief`);
    lines.push(`Goal: ${goal}`);
    lines.push(`Audience: ${audience}`);
    lines.push(`Value Proposition: ${valueProp}`);
    lines.push(`Past Winners: ${pastWinners}`);
    lines.push("");
    lines.push(`Creative Directions:`);
    lines.push(`- UGC with clear product benefit within 3s`);
    lines.push(`- Headlines tied to margin and value, not vanity`);
    lines.push(`- Ad set frequency caps to avoid fatigue`);
    return lines.join("\n");
  }, [goal, audience, valueProp, pastWinners]);
  const downloadMd = () => {
    const blob = new Blob([brief], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-brief-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">Creative</div>
      <h1 className="text-3xl font-bold">AI Media Brief Generator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <label className="block text-sm mb-1">Goal</label>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Audience</label>
          <input value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Value Proposition</label>
          <input value={valueProp} onChange={(e) => setValueProp(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          <label className="block text-sm mb-1">Past Winning Assets</label>
          <textarea value={pastWinners} onChange={(e) => setPastWinners(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={3} />
          <div className="flex items-center gap-2"><button onClick={downloadMd} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded">Download Markdown</button><HelpTip title="Direction">Outputs a concise brief grounded in goals and winners.</HelpTip></div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{brief}</pre>
        </div>
      </div>
    </div>
  );
}

