"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

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
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/tools/utm-builder", label: "UTM Builder" },
      { href: "/tools/pixel-helper", label: "Pixel Helper" },
      { href: "/tools/redirect-tester", label: "Redirect Tester" },
    ]
  },
  {
    title: "Diagnostics",
    items: [
      { href: "/tools/performance-grader", label: "Performance Grader" },
      { href: "/tools/funnel-analyzer", label: "Funnel Analyzer" },
    ]
  }
];

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">MBA Tools</h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Marketing Analytics</p>
            </div>
          </Link>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70" 
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    M
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">MBA Tools</h1>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Marketing Analytics</p>
                  </div>
                </Link>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Content */}
              <nav className="flex-1 overflow-y-auto p-4">
                {sections.map((section) => (
                  <div key={section.title} className="mb-6">
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
                              onClick={closeMenu}
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

              {/* Menu Footer */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">v1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}