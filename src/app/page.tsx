"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";


type ToolItem = {
  href: string;
  label: string;
  description: string;
  category: string;
};

const tools: ToolItem[] = [
  // Planning
  { href: "/tools/budget", label: "Budget Calculator", description: "Plan budgets by channel and timeframe", category: "Planning" },
  { href: "/tools/media-plan", label: "Media Plan", description: "Build weekly plans you can share", category: "Planning" },
  { href: "/tools/budget-pacing", label: "Budget Pacing", description: "Distribute budgets across dates", category: "Planning" },

  // Analysis
  { href: "/tools/costs", label: "CPM/CPC/CPA", description: "Convert between pricing models", category: "Analysis" },
  { href: "/tools/roi", label: "ROI & Breakeven", description: "Evaluate ROAS and breakeven points", category: "Analysis" },
  { href: "/tools/reach-frequency", label: "Reach & Frequency", description: "Estimate reach from spend and CPM", category: "Analysis" },
  { href: "/tools/abtest", label: "A/B Test Calculator", description: "Compute sample size and significance", category: "Analysis" },
  { href: "/tools/audience-overlap", label: "Audience Overlap", description: "Estimate overlap between audiences", category: "Analysis" },
  { href: "/tools/keyword-finder", label: "Keyword Finder", description: "Generate relevant keywords", category: "Analysis" },
  { href: "/tools/seo-tools", label: "SEO Tools", description: "Generate titles, meta, and slugs", category: "Analysis" },
  { href: "/tools/dedup-frequency", label: "Dedup vs Frequency", description: "Compare deduplicated reach vs frequency", category: "Analysis" },
  { href: "/tools/landing-analyzer", label: "Landing Analyzer", description: "Review landing page readiness", category: "Analysis" },
  { href: "/tools/reporting-snapshot", label: "Reporting Snapshot", description: "Summarize performance metrics", category: "Analysis" },
  { href: "/tools/performance-grader", label: "Performance Grader", description: "Grade campaign performance against benchmarks", category: "Analysis" },
  { href: "/tools/funnel-analyzer", label: "Funnel Analyzer", description: "Analyze conversion funnels and identify optimization opportunities", category: "Analysis" },
  { href: "/tools/diagnostics", label: "Diagnostics", description: "Comprehensive website health check and performance analysis", category: "Diagnostics" },

  // Creative
  { href: "/tools/creative-specs", label: "Creative Specs", description: "Reference ad specs across platforms", category: "Creative" },
  { href: "/tools/creative-qa", label: "Creative QA", description: "Use checklists to launch confidently", category: "Creative" },
  { href: "/tools/copywriting-tool", label: "Copywriting Helper", description: "Generate headlines and CTAs", category: "Creative" },
  { href: "/tools/creative-tracker", label: "Creative Tracker", description: "Track creatives and performance", category: "Creative" },
  { href: "/tools/ad-forms", label: "Ad Forms", description: "Quickly mock ad layouts", category: "Creative" },
  { href: "/tools/ai-assistant", label: "AI Assistant", description: "Generate copy and content ideas", category: "Creative" },

  // Operations
  { href: "/tools/utm-builder", label: "UTM Builder", description: "Build tracking URLs", category: "Operations" },
  { href: "/tools/bulk-utm", label: "Bulk UTM", description: "Generate many tagged URLs", category: "Operations" },
  { href: "/tools/pixel-checker", label: "Pixel Checker", description: "Validate tracking pixel events", category: "Operations" },
  { href: "/tools/pixel-helper", label: "Pixel Helper", description: "Analyze and validate tracking pixels", category: "Operations" },
  { href: "/tools/redirect-tester", label: "Redirect Tester", description: "Test redirect chains and identify issues", category: "Operations" },
  { href: "/tools/comments-picker", label: "Comments Picker", description: "Pick giveaway winners", category: "Operations" },
  { href: "/tools/policy-checker", label: "Policy Checker", description: "Check ad policy compliance", category: "Operations" },
  { href: "/tools/trending-tool", label: "Trending Helper", description: "Discover trending topics", category: "Operations" },

  // Imports
  { href: "/tools/audience-overlap-import", label: "Audience Overlap Import", description: "Import overlap data", category: "Operations" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<{ href: string; label: string; ts: number }[]>([]);

  useEffect(() => {
    // Load favorites and recent tools on mount
    const loadStoredData = () => {
      try {
        const rawFavorites = localStorage.getItem("mba:favorites-v1");
        if (rawFavorites) {
          const parsedFavorites = JSON.parse(rawFavorites);
          // Use a microtask to avoid synchronous setState in effect
          Promise.resolve().then(() => setFavorites(parsedFavorites));
        }
      } catch {}
      
      try {
        const rawRecent = localStorage.getItem("mba:recent-tools");
        if (rawRecent) {
          const parsedRecent = JSON.parse(rawRecent);
          // Use a microtask to avoid synchronous setState in effect
          Promise.resolve().then(() => setRecent(parsedRecent));
        }
      } catch {}
    };
    
    loadStoredData();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("mba:favorites-v1", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFavorite = (href: string) => {
    setFavorites((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [href, ...prev]
    );
  };

  const filteredTools = useMemo(() => {
    if (!query.trim()) return tools;
    const q = query.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.label.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
    );
  }, [query]);

  const groupedTools = useMemo(() => {
    const groups: Record<string, ToolItem[]> = {};
    filteredTools.forEach((tool) => {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category].push(tool);
    });
    return groups;
  }, [filteredTools]);

  const favoriteTools = tools.filter((tool) => favorites.includes(tool.href));
  const recentTools = recent.slice(0, 3).map((r) => {
    const tool = tools.find((t) => t.href === r.href);
    return tool || { href: r.href, label: r.label, description: "", category: "Recent" };
  });

  return (
    <div className="space-y-16" suppressHydrationWarning>
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          AI-Powered Marketing Tools
        </div>
        <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">
          Professional Marketing Analytics
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          Streamline your marketing workflow with intuitive calculators and analytics tools designed for modern media buying
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-zinc-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search tools (e.g., budget calculator, UTM builder, ROI analysis)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-zinc-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Quick Access */}
      {(favoriteTools.length > 0 || recentTools.length > 0) && (
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {favoriteTools.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>⭐</span> Favorites
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteTools.map((tool) => (
                    <Link key={tool.href} href={tool.href}>
                      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{tool.label}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {recentTools.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>🕒</span> Recently Used
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentTools.map((tool) => (
                    <Link key={tool.href} href={tool.href}>
                      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{tool.label}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tools by Category */}
      <section className="space-y-12">
        {Object.entries(groupedTools).map(([category, categoryTools]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{category}</h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {category === "Planning" && "Strategic tools for campaign planning and budget allocation"}
                  {category === "Analysis" && "Analytics calculation and performance measurement tools"}
                  {category === "Creative" && "Design and creative optimization tools"}
                  {category === "Operations" && "Workflow and operational efficiency tools"}
                  {category === "Diagnostics" && "Technical analysis and troubleshooting tools"}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryTools.map((tool) => (
                <div key={tool.href} className="group relative">
                  <Link href={tool.href}>
                    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <span className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full">
                            {tool.category}
                          </span>
                          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{tool.label}</h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(tool.href);
                          }}
                          className={`p-2 rounded-full transition-colors ${
                            favorites.includes(tool.href)
                              ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                              : "text-zinc-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          }`}
                        >
                          ⭐
                        </button>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed flex-grow mb-4">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:underline">
                          Launch Tool →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}