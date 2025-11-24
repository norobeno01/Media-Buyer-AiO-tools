"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Crumb = { href: string; label: string };

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/tools/budget": "Budget Calculator",
  "/tools/media-plan": "Media Plan",
  "/tools/budget-pacing": "Budget Pacing",
  "/tools/costs": "CPM/CPC/CPA",
  "/tools/roi": "ROI & Breakeven",
  "/tools/reach-frequency": "Reach & Frequency",
  "/tools/abtest": "A/B Test",
  "/tools/dedup-frequency": "Dedup vs Frequency",
  "/tools/audience-overlap": "Audience Overlap",
  "/tools/audience-overlap-import": "Overlap Import",
  "/tools/keyword-finder": "Keyword Finder",
  "/tools/trending-tool": "Trending Helper",
  "/tools/seo-tools": "SEO Tools",
  "/tools/reporting-snapshot": "Reporting Snapshot",
  "/tools/creative-specs": "Creative Specs",
  "/tools/creative-qa": "Creative QA",
  "/tools/creative-tracker": "Creative Tracker",
  "/tools/copywriting-tool": "Copywriting Helper",
  "/tools/ad-forms": "Ad Forms Editor",
  "/tools/utm-builder": "UTM Builder",
  "/tools/bulk-utm": "Bulk UTM",
  "/tools/pixel-checker": "Pixel Checker",
  "/tools/landing-analyzer": "Landing Analyzer",
  "/tools/policy-checker": "Policy Checker",
  "/integrations": "Integrations",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs: Crumb[] = [];

  // Always start with Dashboard
  crumbs.push({ href: "/", label: "Dashboard" });

  if (pathname && pathname !== "/") {
    const segments = pathname.split("/").filter(Boolean);
    // Group top-level
    if (segments[0] === "tools") {
      crumbs.push({ href: "/tools", label: "Tools" });
      const href = `/${segments.join("/")}`;
      const label = routeLabels[href] || segments[segments.length - 1].replace(/-/g, " ").replace(/\b\w/g, s => s.toUpperCase());
      crumbs.push({ href, label });
    } else {
      const href = `/${segments.join("/")}`;
      const label = routeLabels[href] || segments[segments.length - 1].replace(/-/g, " ").replace(/\b\w/g, s => s.toUpperCase());
      crumbs.push({ href, label });
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1">
            {i > 0 && <span className="text-zinc-400">/</span>}
            {i < crumbs.length - 1 ? (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}