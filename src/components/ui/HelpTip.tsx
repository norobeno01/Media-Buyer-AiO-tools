"use client";

import { useState } from "react";

type HelpTipProps = {
  title?: string;
  children: React.ReactNode;
};

export default function HelpTip({ title = "Help", children }: HelpTipProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={title}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-64 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-700 dark:text-zinc-300 shadow">
          {children}
        </div>
      )}
    </div>
  );
}