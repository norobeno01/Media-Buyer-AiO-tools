"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Row = {
  channel: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
};

function toNumber(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ReportingSnapshotPage() {
  const [rows, setRows] = useState<Row[]>([
    { channel: "Meta", spend: 2500, impressions: 500_000, clicks: 8_000, conversions: 120, revenue: 9000 },
    { channel: "Google Search", spend: 1800, impressions: 120_000, clicks: 6_500, conversions: 95, revenue: 7500 },
  ]);
  const [ignoreTopLines, setIgnoreTopLines] = useState<number>(0);

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
    mapping: Record<string, number | undefined>; // index to headersOriginal
    warnings: string[];
    appliedCount?: number;
  };
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  const targetFields = ["channel","spend","impressions","clicks","conversions","revenue"] as const;
  const headerSynonyms: Record<typeof targetFields[number], string[]> = {
    channel: ["channel","source","platform","network"],
    spend: ["spend","cost","amount"],
    impressions: ["impressions","impr","imps"],
    clicks: ["clicks","click","clks"],
    conversions: ["conversions","conv","purchases","orders"],
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

    // Attempt immediate application using auto map, collect warnings
    const applied: Row[] = [];
    for (let i = 0; i < rowsRaw.length; i++) {
      const cells = rowsRaw[i];
      const get = (field: typeof targetFields[number]) => {
        const j = mapping[field];
        return j !== undefined ? (cells[j] ?? "") : "";
      };
      const spendStr = get("spend");
      const imprStr = get("impressions");
      const clicksStr = get("clicks");
      const convStr = get("conversions");
      const revStr = get("revenue");
      const channelStr = get("channel") || "";
      const numOrWarn = (label: string, raw: string) => {
        const n = toNumber(raw);
        if (raw && !Number.isFinite(parseFloat(raw))) warnings.push(`Row ${i + 1}: non-numeric ${label} "${raw}"`);
        return n;
      };
      const r: Row = {
        channel: channelStr,
        spend: numOrWarn("spend", spendStr),
        impressions: Math.floor(numOrWarn("impressions", imprStr)),
        clicks: Math.floor(numOrWarn("clicks", clicksStr)),
        conversions: Math.floor(numOrWarn("conversions", convStr)),
        revenue: numOrWarn("revenue", revStr),
      };
      if (r.channel) applied.push(r);
      else warnings.push(`Row ${i + 1}: missing channel`);
    }
    if (applied.length > 0) setRows(applied);
    setImportPreview({ sep, headersOriginal, headersNormalized, rowsRaw, mapping, warnings, appliedCount: applied.length });
  }
  async function handleFile(file: File) {
    const text = await file.text();
    importCsvText(text);
  }

  function insertExampleRows() {
    setRows([
      { channel: "Meta", spend: 2500, impressions: 500_000, clicks: 8_000, conversions: 120, revenue: 9000 },
      { channel: "Google Search", spend: 1800, impressions: 120_000, clicks: 6_500, conversions: 95, revenue: 7500 },
    ]);
  }

  function updateRow(i: number, patch: Partial<Row>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }
  function addRow() {
    setRows(prev => [...prev, { channel: "TikTok", spend: 1000, impressions: 80_000, clicks: 2_000, conversions: 25, revenue: 2500 }]);
  }
  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  const totals = useMemo(() => {
    const spend = rows.reduce((s, r) => s + r.spend, 0);
    const impressions = rows.reduce((s, r) => s + r.impressions, 0);
    const clicks = rows.reduce((s, r) => s + r.clicks, 0);
    const conversions = rows.reduce((s, r) => s + r.conversions, 0);
    const revenue = rows.reduce((s, r) => s + r.revenue, 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 ? revenue / spend : 0;
    return { spend, impressions, clicks, conversions, revenue, ctr, cvr, cpc, cpa, roas };
  }, [rows]);

  function downloadCsv() {
    const header = ["channel","spend","impressions","clicks","conversions","revenue","ctr_%","cvr_%","cpc","cpa","roas"];
    const rowCsv = rows.map(r => {
      const ctr = r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0;
      const cvr = r.clicks > 0 ? (r.conversions / r.clicks) * 100 : 0;
      const cpc = r.clicks > 0 ? r.spend / r.clicks : 0;
      const cpa = r.conversions > 0 ? r.spend / r.conversions : 0;
      const roas = r.spend > 0 ? r.revenue / r.spend : 0;
      return [
        r.channel,
        r.spend.toFixed(2),
        String(r.impressions),
        String(r.clicks),
        String(r.conversions),
        r.revenue.toFixed(2),
        ctr.toFixed(2),
        cvr.toFixed(2),
        cpc.toFixed(2),
        cpa.toFixed(2),
        roas.toFixed(2),
      ];
    });
    const totalRow = [
      "TOTAL",
      totals.spend.toFixed(2),
      String(totals.impressions),
      String(totals.clicks),
      String(totals.conversions),
      totals.revenue.toFixed(2),
      totals.ctr.toFixed(2),
      totals.cvr.toFixed(2),
      totals.cpc.toFixed(2),
      totals.cpa.toFixed(2),
      totals.roas.toFixed(2),
    ];
    const csv = [header, ...rowCsv, totalRow]
      .map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporting_snapshot.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadTemplateCsv() {
    const header = ["channel","spend","impressions","clicks","conversions","revenue"];
    const sample = [
      ["Meta","2500","500000","8000","120","9000"],
      ["Google Search","1800","120000","6500","95","7500"],
    ];
    const csv = [header, ...sample]
      .map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporting_snapshot_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function copySummary() {
    const text = `Total Spend $${totals.spend.toFixed(2)} | Impr ${totals.impressions.toLocaleString()} | Clicks ${totals.clicks.toLocaleString()} | Conv ${totals.conversions.toLocaleString()} | Rev $${totals.revenue.toFixed(2)} | CTR ${totals.ctr.toFixed(2)}% | CVR ${totals.cvr.toFixed(2)}% | CPC $${totals.cpc.toFixed(2)} | CPA $${totals.cpa.toFixed(2)} | ROAS ${totals.roas.toFixed(2)}`;
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Reporting Snapshot</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Paste or enter metrics per channel; view blended KPIs, copy summary, and export CSV.</p>

      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={addRow}>Add Row</Button>
          <Button onClick={downloadCsv} variant="primary">Download CSV</Button>
          <Button onClick={copySummary}>Copy Summary</Button>
          <Button onClick={downloadTemplateCsv}>Download Template CSV</Button>
          <Button onClick={insertExampleRows}>Insert Example</Button>
          <label className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
            Import CSV
            <input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="ml-2 text-sm" />
          </label>
          <label className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
            Ignore first N lines
            <input
              type="number"
              min={0}
              value={ignoreTopLines}
              onChange={(e) => setIgnoreTopLines(Math.max(0, e.target.valueAsNumber || 0))}
              className="ml-2 w-20 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1"
            />
          </label>
        </div>

        <details className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 text-sm">
          <summary className="cursor-pointer text-zinc-700 dark:text-zinc-300">Tips and assumptions</summary>
          <ul className="mt-2 list-disc ml-5 text-zinc-700 dark:text-zinc-300">
            <li>Import columns: channel, spend, impressions, clicks, conversions, revenue.</li>
            <li>Auto-mapping tries common header names; adjust in the mapping grid.</li>
            <li>Numeric validation warns, but you can still import and edit inline.</li>
            <li>Totals row shows blended KPIs; use Copy Summary for quick sharing.</li>
          </ul>
        </details>

        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          className="rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 p-3 text-sm text-zinc-600 dark:text-zinc-400"
        >
          Drag & drop a CSV to replace rows (channel, spend, impressions, clicks, conversions, revenue).
        </div>

        {importPreview && (
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 space-y-3">
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
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1"
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
              <Button
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
                      channel: get('channel'),
                      spend: toNumber(get('spend')),
                      impressions: Math.floor(toNumber(get('impressions'))),
                      clicks: Math.floor(toNumber(get('clicks'))),
                      conversions: Math.floor(toNumber(get('conversions'))),
                      revenue: toNumber(get('revenue')),
                    };
                    if (r.channel) applied.push(r);
                  }
                  setRows(applied);
                  setImportPreview(prev => prev ? { ...prev, appliedCount: applied.length } : prev);
                }}
              >Apply Mapping</Button>
              <Button onClick={() => setImportPreview(null)}>Clear</Button>
            </div>
            {importPreview.warnings.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-2 text-sm text-amber-800 dark:text-amber-200">
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
                <th className="py-2 pr-3">Channel</th>
                <th className="py-2 pr-3">Spend ($)</th>
                <th className="py-2 pr-3">Impressions</th>
                <th className="py-2 pr-3">Clicks</th>
                <th className="py-2 pr-3">Conversions</th>
                <th className="py-2 pr-3">Revenue ($)</th>
                <th className="py-2 pr-3">CTR %</th>
                <th className="py-2 pr-3">CVR %</th>
                <th className="py-2 pr-3">CPC ($)</th>
                <th className="py-2 pr-3">CPA ($)</th>
                <th className="py-2 pr-3">ROAS</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-4 text-center text-zinc-500 dark:text-zinc-400">
                    No rows yet — use Insert Example or Import CSV to get started.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const ctr = r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0;
                const cvr = r.clicks > 0 ? (r.conversions / r.clicks) * 100 : 0;
                const cpc = r.clicks > 0 ? r.spend / r.clicks : 0;
                const cpa = r.conversions > 0 ? r.spend / r.conversions : 0;
                const roas = r.spend > 0 ? r.revenue / r.spend : 0;
                return (
                  <tr key={i}>
                    <td className="py-2 pr-3"><input value={r.channel} onChange={(e) => updateRow(i, { channel: e.target.value })} className="w-40 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" /></td>
                    <td className="py-2 pr-3"><input type="number" value={r.spend} onChange={(e) => updateRow(i, { spend: toNumber(e.target.value) })} className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" /></td>
                    <td className="py-2 pr-3"><input type="number" value={r.impressions} onChange={(e) => updateRow(i, { impressions: Math.max(0, Math.floor(toNumber(e.target.value))) })} className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" /></td>
                    <td className="py-2 pr-3"><input type="number" value={r.clicks} onChange={(e) => updateRow(i, { clicks: Math.max(0, Math.floor(toNumber(e.target.value))) })} className="w-24 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" /></td>
                    <td className="py-2 pr-3"><input type="number" value={r.conversions} onChange={(e) => updateRow(i, { conversions: Math.max(0, Math.floor(toNumber(e.target.value))) })} className="w-24 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" /></td>
                    <td className="py-2 pr-3"><input type="number" value={r.revenue} onChange={(e) => updateRow(i, { revenue: toNumber(e.target.value) })} className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1" /></td>
                    <td className="py-2 pr-3">{ctr.toFixed(2)}</td>
                    <td className="py-2 pr-3">{cvr.toFixed(2)}</td>
                    <td className="py-2 pr-3">${cpc.toFixed(2)}</td>
                    <td className="py-2 pr-3">${cpa.toFixed(2)}</td>
                    <td className="py-2 pr-3">{roas.toFixed(2)}</td>
                    <td className="py-2 pr-3"><Button size="sm" onClick={() => removeRow(i)}>Remove</Button></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="py-2 pr-3 font-medium">Total</td>
                <td className="py-2 pr-3">${totals.spend.toFixed(2)}</td>
                <td className="py-2 pr-3">{totals.impressions.toLocaleString()}</td>
                <td className="py-2 pr-3">{totals.clicks.toLocaleString()}</td>
                <td className="py-2 pr-3">{totals.conversions.toLocaleString()}</td>
                <td className="py-2 pr-3">${totals.revenue.toFixed(2)}</td>
                <td className="py-2 pr-3">{totals.ctr.toFixed(2)}</td>
                <td className="py-2 pr-3">{totals.cvr.toFixed(2)}</td>
                <td className="py-2 pr-3">${totals.cpc.toFixed(2)}</td>
                <td className="py-2 pr-3">${totals.cpa.toFixed(2)}</td>
                <td className="py-2 pr-3">{totals.roas.toFixed(2)}</td>
                <td className="py-2 pr-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}