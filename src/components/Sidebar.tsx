"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "Overview",
    items: [{ href: "/", label: "Dashboard" }]
  },
  {
    title: "Planning",
    items: [
      { href: "/tools/budget", label: "Budget Calculator" },
      { href: "/tools/media-plan", label: "Media Plan" },
      { href: "/tools/budget-pacing", label: "Budget Pacing" },
      { href: "/tools/profit-led-pacing", label: "Profit-Led Pacing" },
      { href: "/tools/bid-landscape", label: "Bid Landscape Explorer" },
    ]
  },
  {
    title: "Analysis",
    items: [
      { href: "/tools/costs", label: "CPM/CPC/CPA" },
      { href: "/tools/roi", label: "ROI & Breakeven" },
      { href: "/tools/reach-frequency", label: "Reach & Frequency" },
      { href: "/tools/abtest", label: "A/B Test" },
      { href: "/tools/audience-overlap", label: "Audience Overlap" },
      { href: "/tools/keyword-finder", label: "Keyword Finder" },
      { href: "/tools/seo-tools", label: "SEO Tools" },
      { href: "/tools/reporting-snapshot", label: "Reporting Snapshot" },
      { href: "/tools/channel-conflict", label: "Channel Conflict Detector" },
      { href: "/tools/holdout-calculator", label: "Holdout Group Calculator" },
      { href: "/tools/mta-builder", label: "MTA Builder" },
    ]
  },
  {
    title: "Creative",
    items: [
      { href: "/tools/creative-specs", label: "Creative Specs" },
      { href: "/tools/creative-qa", label: "Creative QA" },
      { href: "/tools/creative-tracker", label: "Creative Tracker" },
      { href: "/tools/copywriting-tool", label: "Copywriting Helper" },
      { href: "/tools/ai-assistant", label: "AI Assistant" },
      { href: "/tools/creative-heatmap", label: "Creative Saturation Heatmap" },
      { href: "/tools/media-brief", label: "AI Media Brief Generator" },
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/tools/utm-builder", label: "UTM Builder" },
      { href: "/tools/pixel-helper", label: "Pixel Helper" },
      { href: "/tools/redirect-tester", label: "Redirect Tester" },
      { href: "/tools/roas-ebitda", label: "ROAS → EBITDA Translator" },
      { href: "/tools/cashflow-forecast", label: "Cash Flow Forecast" },
    ]
  },
  {
    title: "Diagnostics",
    items: [
      { href: "/tools/performance-grader", label: "Performance Grader" },
      { href: "/tools/funnel-analyzer", label: "Funnel Analyzer" },
      { href: "/tools/privacy-impact", label: "iOS/Privacy Impact Simulator" },
    ]
  }
  ,
  {
    title: "Strategy",
    items: [
      { href: "/tools/strategy-planner", label: "Marketing Strategy Advanced Planner" },
    ]
  }
];

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Load favorites on mount
    const loadFavorites = () => {
      try {
        const raw = localStorage.getItem("mba:favorites-v1");
        if (raw) {
          const parsedFavorites = JSON.parse(raw);
          // Use a microtask to avoid synchronous setState in effect
          Promise.resolve().then(() => setFavorites(parsedFavorites));
        }
      } catch {}
    };
    
    loadFavorites();
  }, []);

  const allItems = useMemo(() => {
    return sections.flatMap((section) => section.items);
  }, []);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q)
      ),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  const favoriteItems = useMemo(() => {
    return allItems.filter((item) => favorites.includes(item.href));
  }, [favorites, allItems]);

  return (
    <aside className="hidden md:flex w-80 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col" suppressHydrationWarning>
      {/* Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">MBA Tools</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Marketing Analytics</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800" suppressHydrationWarning>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-zinc-400 text-sm">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4" suppressHydrationWarning>
        {/* Favorites */}
        {favoriteItems.length > 0 && (
          <div className="mb-6" suppressHydrationWarning>
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3 px-3">
              Favorites
            </h3>
            <ul className="space-y-1">
              {favoriteItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span>⭐</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Sections */}
        {filteredSections.map((section) => (
          <div key={section.title} className="mb-6" suppressHydrationWarning>
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3 px-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100"></span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800" suppressHydrationWarning>
        <div className="flex items-center justify-end">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">v1.1</span>
        </div>
      </div>
    </aside>
  );
}
