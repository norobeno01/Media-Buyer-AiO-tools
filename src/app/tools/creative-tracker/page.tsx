"use client";

import { useMemo, useState } from "react";
 

type Row = {
  name: string;
  platform: string;
  format: string; // e.g., 9:16 Video, 1:1 Image
  hook: string;
  cta: string;
  tags: string; // comma-separated tags
  notes?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  revenue?: number;
};

function toNumber(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export default function CreativeTrackerPage() {
  const [rows, setRows] = useState<Row[]>([
    { name: "UGC Hook A", platform: "Meta", format: "9:16 Video", hook: "Problem agitation", cta: "Shop Now", tags: "UGC,HookA", notes: "Performs well with women 25-34", impressions: 120000, clicks: 2500, conversions: 40, spend: 1200, revenue: 3800 },
    { name: "Static V1", platform: "Google", format: "1:1 Image", hook: "Value prop", cta: "Learn More", tags: "Static,Value", notes: "High CTR, low CVR", impressions: 80000, clicks: 2200, conversions: 25, spend: 900, revenue: 2700 },
  ]);
  const [ignoreTopLines, setIgnoreTopLines] = useState<number>(0);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }
  function addRow() {
    setRows(prev => [...prev, { name: "", platform: "Meta", format: "9:16 Video", hook: "", cta: "", tags: "", notes: "" }]);
  }
  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  const totals = useMemo(() => {
    const impressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
    const clicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
    const conversions = rows.reduce((s, r) => s + (r.conversions || 0), 0);
    const spend = rows.reduce((s, r) => s + (r.spend || 0), 0);
    const revenue = rows.reduce((s, r) => s + (r.revenue || 0), 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 ? revenue / spend : 0;
    return { impressions, clicks, conversions, spend, revenue, ctr, cvr, cpc, cpa, roas };
  }, [rows]);

  function normalizeHeader(h: string) {
    return h.toLowerCase().replace(/[^a-z0-9]+/g, "");
  }
  function parseLine(line: string, sep: string) {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
      } else if (!inQuotes && ch === sep) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  }
  type ImportPreview = {
    sep: string;
    headersOriginal: string[];
    headersNormalized: string[];
    rowsRaw: string[][];
    mapping: Record<string, number | undefined>;
    warnings: string[];
    appliedCount?: number;
  };
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  const targetFields = [
    "name","platform","format","hook","cta","tags","notes",
    "impressions","clicks","conversions","spend","revenue"
  ] as const;
  const headerSynonyms: Record<typeof targetFields[number], string[]> = {
    name: ["name","creative","asset"],
    platform: ["platform","channel","network"],
    format: ["format","type"],
    hook: ["hook","angle","concept"],
    cta: ["cta","calltoaction"],
    tags: ["tags","label","labels"],
    notes: ["notes","comments","remark"],
    impressions: ["impressions","impr","imps"],
    clicks: ["clicks","click","clks"],
    conversions: ["conversions","conv","purchases","orders"],
    spend: ["spend","cost","amount"],
    revenue: ["revenue","rev","sales","value"],
  };
  function autoMap(headersNorm: string[]) {
    const mapping: Record<string, number | undefined> = {};
    for (const field of targetFields) {
      const syns = headerSynonyms[field];
      let foundIndex: number | undefined = undefined;
      for (const s of syns) {
        const idx = headersNorm.indexOf(s);
        if (idx >= 0) { foundIndex = idx; break; }
      }
      mapping[field] = foundIndex;
    }
    return mapping;
  }
  function importCsvText(text: string) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return;
    const effective = ignoreTopLines > 0 ? lines.slice(ignoreTopLines) : lines;
    if (effective.length === 0) return;
    const sep = effective[0].includes("\t") ? "\t" : ",";
    const headersOriginal = parseLine(effective[0], sep);
    const headersNormalized = headersOriginal.map(normalizeHeader);
    const rowsRaw = effective.slice(1).map(line => parseLine(line, sep));
    const mapping = autoMap(headersNormalized);
    const warnings: string[] = [];

    const applied: Row[] = [];
    for (let i = 0; i < rowsRaw.length; i++) {
      const cells = rowsRaw[i];
      const get = (field: typeof targetFields[number]) => {
        const j = mapping[field];
        return j !== undefined ? (cells[j] ?? "") : "";
      };
      const numOrWarn = (label: string, raw: string) => {
        const n = toNumber(raw);
        if (raw && !Number.isFinite(parseFloat(raw))) warnings.push(`Row ${i + 1}: non-numeric ${label} "${raw}"`);
        return n;
      };
      const r: Row = {
        name: get("name"),
        platform: get("platform") || "",
        format: get("format"),
        hook: get("hook"),
        cta: get("cta"),
        tags: get("tags"),
        notes: get("notes"),
        impressions: Math.floor(numOrWarn("impressions", get("impressions"))),
        clicks: Math.floor(numOrWarn("clicks", get("clicks"))),
        conversions: Math.floor(numOrWarn("conversions", get("conversions"))),
        spend: numOrWarn("spend", get("spend")),
        revenue: numOrWarn("revenue", get("revenue")),
      };
      if (r.name || r.platform) applied.push(r); else warnings.push(`Row ${i + 1}: missing name/platform`);
    }
    if (applied.length > 0) setRows(applied);
    setImportPreview({ sep, headersOriginal, headersNormalized, rowsRaw, mapping, warnings, appliedCount: applied.length });
  }
  async function handleFile(file: File) {
    const text = await file.text();
    importCsvText(text);
  }

  function downloadCsv() {
    const header = ["name","platform","format","hook","cta","tags","notes","impressions","clicks","conversions","spend","revenue","ctr_%","cvr_%","cpc","cpa","roas"];
    const rowCsv = rows.map(r => {
      const impressions = r.impressions || 0;
      const clicks = r.clicks || 0;
      const conversions = r.conversions || 0;
      const spend = r.spend || 0;
      const revenue = r.revenue || 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const cpa = conversions > 0 ? spend / conversions : 0;
      const roas = spend > 0 ? revenue / spend : 0;
      return [
        r.name,
        r.platform,
        r.format,
        r.hook,
        r.cta,
        r.tags,
        r.notes || "",
        String(impressions),
        String(clicks),
        String(conversions),
        spend.toFixed(2),
        revenue.toFixed(2),
        ctr.toFixed(2),
        cvr.toFixed(2),
        cpc.toFixed(2),
        cpa.toFixed(2),
        roas.toFixed(2),
      ];
    });
    const csv = [header, ...rowCsv]
      .map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creative_tracker.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadTemplateCsv() {
    const header = ["name","platform","format","hook","cta","tags","notes","impressions","clicks","conversions","spend","revenue"];
    const sample = [
      ["UGC Hook A","Meta","9:16 Video","Problem agitation","Shop Now","UGC,HookA","Performs well with women 25-34","120000","2500","40","1200","3800"],
      ["Static V1","Google","1:1 Image","Value prop","Learn More","Static,Value","High CTR, low CVR","80000","2200","25","900","2700"],
    ];
    const csv = [header, ...sample]
      .map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creative_tracker_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function insertExampleRows() {
    setRows([
      { name: "UGC Hook A", platform: "Meta", format: "9:16 Video", hook: "Problem agitation", cta: "Shop Now", tags: "UGC,HookA", notes: "Performs well with women 25-34", impressions: 120000, clicks: 2500, conversions: 40, spend: 1200, revenue: 3800 },
      { name: "Static V1", platform: "Google", format: "1:1 Image", hook: "Value prop", cta: "Learn More", tags: "Static,Value", notes: "High CTR, low CVR", impressions: 80000, clicks: 2200, conversions: 25, spend: 900, revenue: 2700 },
    ]);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Creative</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Creative Tracker</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Tag creatives by format, hook, CTA; log notes and optional performance. Export to CSV.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={addRow} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Add Creative</button>
          <button onClick={downloadCsv} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors">Download CSV</button>
          <button onClick={downloadTemplateCsv} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Download Template CSV</button>
          <button onClick={insertExampleRows} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Insert Example</button>
          <span className="ml-auto text-sm text-zinc-700 dark:text-zinc-300">Totals · Impr {totals.impressions.toLocaleString()} · Clicks {totals.clicks.toLocaleString()} · Conv {totals.conversions.toLocaleString()} · ROAS {totals.roas.toFixed(2)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-zinc-700 dark:text-zinc-300">
            Import CSV
            <input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="ml-2 text-sm" />
          </label>
          <label className="text-sm text-zinc-700 dark:text-zinc-300">
            Ignore first N lines
            <input
              type="number"
              min={0}
              value={ignoreTopLines}
              onChange={(e) => setIgnoreTopLines(Math.max(0, e.target.valueAsNumber || 0))}
              className="ml-2 w-20 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <details className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-sm">
          <summary className="cursor-pointer text-zinc-700 dark:text-zinc-300">Tips and assumptions</summary>
          <ul className="mt-2 list-disc ml-5 text-zinc-700 dark:text-zinc-300">
            <li>Track creatives with tags, hooks, and optional performance metrics.</li>
            <li>Import columns can include name, platform, format, hook, CTA, tags, notes, impressions, clicks, conversions, spend, revenue.</li>
            <li>Auto-mapping matches common header names; refine via the mapping grid.</li>
            <li>Use Download CSV to share a tracker; totals update automatically.</li>
          </ul>
        </details>

        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-3 text-sm text-zinc-600 dark:text-zinc-400"
        >
          Drag & drop a CSV to replace rows (name, platform, format, hook, cta, tags, notes, impressions, clicks, conversions, spend, revenue).
        </div>

        {importPreview && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Import status:</span>
              <span className="text-zinc-600 dark:text-zinc-400">Headers {importPreview.headersOriginal.length} · Rows {importPreview.rowsRaw.length} · Applied {importPreview.appliedCount ?? 0}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {targetFields.map((f) => (
                <div key={f} className="text-sm">
                  <label className="block text-zinc-700 dark:text-zinc-300">Map “{f}”</label>
                  <select
                    value={importPreview.mapping[f] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                      setImportPreview(prev => prev ? { ...prev, mapping: { ...prev.mapping, [f]: val } } : prev);
                    }}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                  >
                    <option value="">(None)</option>
                    {importPreview.headersOriginal.map((h, idx) => (
                      <option key={idx} value={idx}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!importPreview) return;
                  const applied: Row[] = [];
                  for (let i = 0; i < importPreview.rowsRaw.length; i++) {
                    const cells = importPreview.rowsRaw[i];
                    const get = (field: typeof targetFields[number]) => {
                      const j = importPreview.mapping[field];
                      return j !== undefined ? (cells[j] ?? '') : '';
                    };
                    const r: Row = {
                      name: get('name'),
                      platform: get('platform') || '',
                      format: get('format'),
                      hook: get('hook'),
                      cta: get('cta'),
                      tags: get('tags'),
                      notes: get('notes'),
                      impressions: Math.floor(toNumber(get('impressions'))),
                      clicks: Math.floor(toNumber(get('clicks'))),
                      conversions: Math.floor(toNumber(get('conversions'))),
                      spend: toNumber(get('spend')),
                      revenue: toNumber(get('revenue')),
                    };
                    if (r.name || r.platform) applied.push(r);
                  }
                  setRows(applied);
                  setImportPreview(prev => prev ? { ...prev, appliedCount: applied.length } : prev);
                }}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
              >Apply Mapping</button>
              <button onClick={() => setImportPreview(null)} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Clear</button>
            </div>
            {importPreview.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-2 text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Import warnings</p>
                <ul className="list-disc ml-5">
                  {importPreview.warnings.slice(0, 10).map((w, i) => (<li key={i}>{w}</li>))}
                  {importPreview.warnings.length > 10 && (<li>+{importPreview.warnings.length - 10} more…</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-700 dark:text-zinc-300">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Platform</th>
                <th className="py-2 pr-3">Format</th>
                <th className="py-2 pr-3">Hook</th>
                <th className="py-2 pr-3">CTA</th>
                <th className="py-2 pr-3">Tags</th>
                <th className="py-2 pr-3">Notes</th>
                <th className="py-2 pr-3">Impr</th>
                <th className="py-2 pr-3">Clicks</th>
                <th className="py-2 pr-3">Conv</th>
                <th className="py-2 pr-3">Spend</th>
                <th className="py-2 pr-3">Revenue</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-4 text-center text-zinc-500 dark:text-zinc-400">
                    No creatives yet — use Insert Example or Import CSV to get started.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="py-2 pr-3"><input value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} className="w-40 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input value={r.platform} onChange={(e) => updateRow(i, { platform: e.target.value })} className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input value={r.format} onChange={(e) => updateRow(i, { format: e.target.value })} className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input value={r.hook} onChange={(e) => updateRow(i, { hook: e.target.value })} className="w-36 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input value={r.cta} onChange={(e) => updateRow(i, { cta: e.target.value })} className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input value={r.tags} onChange={(e) => updateRow(i, { tags: e.target.value })} className="w-40 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input value={r.notes || ''} onChange={(e) => updateRow(i, { notes: e.target.value })} className="w-48 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input type="number" value={r.impressions || 0} onChange={(e) => updateRow(i, { impressions: Math.max(0, Math.floor(toNumber(e.target.value))) })} className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input type="number" value={r.clicks || 0} onChange={(e) => updateRow(i, { clicks: Math.max(0, Math.floor(toNumber(e.target.value))) })} className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input type="number" value={r.conversions || 0} onChange={(e) => updateRow(i, { conversions: Math.max(0, Math.floor(toNumber(e.target.value))) })} className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input type="number" value={r.spend || 0} onChange={(e) => updateRow(i, { spend: toNumber(e.target.value) })} className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><input type="number" value={r.revenue || 0} onChange={(e) => updateRow(i, { revenue: toNumber(e.target.value) })} className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" /></td>
                  <td className="py-2 pr-3"><button className="rounded-lg border border-red-300 dark:border-red-700 px-3 py-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => removeRow(i)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}