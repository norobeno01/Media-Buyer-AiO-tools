"use client";

import { useEffect, useState } from "react";

export default function ShortcutsGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Shift+/ is '?' on US keyboards
      const isQuestion = e.shiftKey && e.key === "/";
      if (isQuestion) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[90%] max-w-xl rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Keyboard Shortcuts</h2>
            <button onClick={() => setOpen(false)} className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-xs">Close</button>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li><span className="font-medium">Shift + /</span> — Open this shortcuts guide</li>
            <li><span className="font-medium">Esc</span> — Close dialogs and guides</li>
            <li><span className="font-medium">Search input</span> — Use the sidebar search to quickly find tools</li>
          </ul>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">More shortcuts coming soon (e.g., focus search, navigate sections, quick actions).</p>
        </div>
      </div>
    </div>
  );
}