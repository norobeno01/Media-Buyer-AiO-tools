"use client";

import { useEffect, useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

async function callGemini(prompt: string, system?: string, model?: string): Promise<{ text: string }>{
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, system, model }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return { text: data.text as string };
}

async function callOpenRouter(prompt: string, system?: string, model?: string): Promise<{ text: string }>{
  const res = await fetch("/api/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, system, model }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return { text: data.text as string };
}

export default function AIAssistantPage() {
  const [task, setTask] = useState("copywriting");
  const [input, setInput] = useState("running shoes by StridePro, tone: upbeat");
  const [output, setOutput] = useState("\n• Headline: ...\n• Description: ...\n• CTA: ...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<"gemini" | "openrouter">("gemini");
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState<string>("auto");
  const [template, setTemplate] = useState<string>("none");

  useEffect(() => {
    let mounted = true;
    setModels([]);
    setModel("auto");
    const url = provider === "gemini" ? "/api/gemini/models" : "/api/openrouter/models";
    fetch(url)
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.text())))
      .then((json) => {
        let names: string[] = [];
        if (provider === "gemini") {
          names = Array.isArray(json?.models)
            ? json.models.map((m: any) => (typeof m?.name === "string" ? m.name : ""))
                .filter(Boolean)
                .map((n: string) => n.replace(/^models\//, ""))
            : [];
        } else {
          names = Array.isArray(json?.data)
            ? json.data.map((m: any) => (typeof m?.id === "string" ? m.id : ""))
                .filter(Boolean)
            : [];
        }
        if (mounted) setModels(names);
      })
      .catch(() => { if (mounted) setModels([]); });
    return () => { mounted = false; };
  }, [provider]);

  const templates: Record<string, string> = useMemo(() => ({
    none: "",
    "Ad Copy": "Product: running shoes by StridePro\nAudience: fitness enthusiasts\nTone: upbeat\nInclude: headline, description, CTA",
    "Product Description": "Product: moisturizing face cream\nBrand: LumiGlow\nKey benefits: hydration, sensitive skin\nTone: friendly\nLength: 150-200 words",
    "Outline": "Topic: email marketing for SMBs\nSections: intro, benefits, best practices, tools, CTA\nKeywords: deliverability, segmentation, automation",
    "Hashtag Set": "Platform: TikTok\nTheme: skincare routines\nAudience: Gen Z\nStyle: fun, trending, brand-safe\nCount: 20",
  }), []);

  useEffect(() => {
    if (template !== "none") {
      setInput(templates[template] || "");
    }
  }, [template, templates]);

  const systemMap: Record<string, string> = {
    search: "Generate 6 concise search queries and angles.",
    copywriting: "Generate 6 headlines, 3 descriptions, and 3 CTAs.",
    content: "Create an outline with sections, bullets, and suggested keywords.",
    image: "Produce 6 detailed image prompts with style, lighting, composition.",
  };

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const selected = model === "auto" ? undefined : model;
      const { text } = provider === "gemini"
        ? await callGemini(input, systemMap[task], selected)
        : await callOpenRouter(input, systemMap[task], selected);
      setOutput(text || "(no output)");
      try {
        localStorage.setItem("ai_assistant_last_output", text || "");
      } catch {}
    } catch (e: any) {
      setError(e?.message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function sendToSEO() {
    try {
      localStorage.setItem("ai_assistant_last_output", output || "");
    } catch {}
    window.location.assign("/tools/seo-tools");
  }

  const copy = (t: string) => navigator.clipboard.writeText(t);
  const download = (t: string) => {
    const blob = new Blob([t], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-${task}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          Creative
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">AI Assistant</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          An AI helper for search, copywriting, content, and image prompt creation.
        </p>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">AI Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gemini">Gemini</option>
                <option value="openrouter">OpenRouter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Task Type</label>
              <select
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="search">Search Helper</option>
                <option value="copywriting">Copywriting</option>
                <option value="content">Content Outline</option>
                <option value="image">Image Prompts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.keys(templates).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">Auto (fallback)</option>
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Input / Brief</h2>
            <div className="flex items-center gap-2">
              <HelpTip title="AI Assistant">
                Use Gemini to brainstorm queries, generate copy, plan content outlines, and craft image prompts. Copy or download outputs.
              </HelpTip>
            </div>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your task..."
          />

            <div className="flex items-center gap-3">
              <button
                onClick={run}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
              {provider === "gemini" && (
                <button
                  onClick={() => setModel("gemini-1.5-flash-latest")}
                  className="px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Use flash-latest
                </button>
              )}
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => copy(output)}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold rounded-xl transition-colors"
        >
          📋 Copy Output
        </button>
        <button
          onClick={() => download(output)}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold rounded-xl transition-colors"
        >
          📄 Download .txt
        </button>
        <button
          onClick={sendToSEO}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          🚀 Send to SEO Tools
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-xl">⚠️</div>
            <div className="font-semibold text-red-800 dark:text-red-200">Request Error</div>
          </div>
          <div className="text-red-700 dark:text-red-300 mb-3">{error}</div>
          <div className="text-sm text-red-600 dark:text-red-400">
            Tip: switch to <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">gemini-1.5-flash-latest</code> or check API access.
          </div>
        </div>
      )}

      {/* Output Display */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Generated Output</h2>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {output.length} characters
          </div>
        </div>
        <pre className="text-sm whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono">
          {output}
        </pre>
      </div>
    </div>
  );
}
