"use client";

import { useMemo, useState } from "react";

export default function CommentsPickerPage() {
  const [postUrl, setPostUrl] = useState<string>("");
  const [inputComments, setInputComments] = useState<string>("Alice\nBob\nCharlie\nDiana");
  const [winner, setWinner] = useState<string>("");

  const comments = useMemo(() => {
    return inputComments
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [inputComments]);

  function pickWinner() {
    if (comments.length === 0) return;
    const idx = Math.floor(Math.random() * comments.length);
    setWinner(comments[idx]);
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    setInputComments(lines.join("\n"));
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-medium rounded-full">Social</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Social Media Comments Picker</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Randomly select a comment for giveaways. Paste comments or upload a CSV. Due to platform restrictions, fetching comments from URL requires platform APIs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Import Comments</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Post URL (Optional)</label>
              <input value={postUrl} onChange={(e) => setPostUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">For record keeping purposes</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Upload CSV</label>
              <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="w-full text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2" />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">One comment or username per line</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Comments</h2>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {comments.length} comments loaded
            </div>
          </div>
          
          <textarea
            value={inputComments}
            onChange={(e) => setInputComments(e.target.value)}
            className="w-full h-40 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter comments, one per line..."
          />
          
          <div className="mt-4">
            <button 
              onClick={pickWinner} 
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-sm font-medium transition-colors"
              disabled={comments.length === 0}
            >
              Pick Random Winner
            </button>
          </div>
          
          {winner && (
            <div className="mt-4 rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
              <div className="text-center">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">🎉 Winner Selected!</div>
                <div className="text-lg font-semibold text-green-900 dark:text-green-100">{winner}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}