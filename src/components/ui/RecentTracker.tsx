"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TOOL_REGISTRY } from "@/app/tools/registry";

type RecentEntry = { href: string; label: string; ts: number };

export default function RecentTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !pathname.startsWith("/tools/")) return;
    const tool = TOOL_REGISTRY.find((t) => t.path === pathname);
    const label = tool?.title || pathname.split("/").pop() || pathname;
    const entry: RecentEntry = { href: pathname, label, ts: Date.now() };

    try {
      const raw = localStorage.getItem("mba:recent-tools");
      const list: RecentEntry[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((e) => e.href !== entry.href);
      const next = [entry, ...filtered].slice(0, 8);
      localStorage.setItem("mba:recent-tools", JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, [pathname]);

  return null;
}