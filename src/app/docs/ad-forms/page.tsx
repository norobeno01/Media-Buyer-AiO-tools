"use client";

export default function AdFormsDocs() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Ad Forms — Tutorial</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Learn how to configure aspect ratios, overlay opacity, fonts, and export a PNG for your ad previews.</p>
      <ol className="list-decimal ml-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        <li>Open the Ad Forms Editor and select an aspect ratio that matches your target placement.</li>
        <li>Set overlay opacity to improve text legibility; pick a font for the bottom panel copy.</li>
        <li>Upload an image; use the preview to verify fit and copy, then click Export PNG.</li>
        <li>Review the exported PNG and iterate as needed; keep brand fonts consistent.</li>
      </ol>
    </div>
  );
}