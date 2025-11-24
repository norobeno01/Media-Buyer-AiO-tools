"use client";

import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

type Audience = { name: string; size: number };

function parseAudiences(input: string): Audience[] {
  const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out: Audience[] = [];
  for (const line of lines) {
    // Try CSV or TSV: name,size
    const parts = line.split(/[\t,]/).map(p => p.trim());
    if (parts.length >= 2) {
      const name = parts[0];
      const size = parseFloat(parts[1].replace(/[^0-9.]/g, "")) || 0;
      if (name && size > 0) out.push({ name, size });
      continue;
    }
    // Fallback: "Name – 123456"
    const m = line.match(/^(.*?)\s*[–-]\s*(\d[\d,.]*)$/);
    if (m) {
      const name = m[1].trim();
      const size = parseFloat(m[2].replace(/[^0-9.]/g, "")) || 0;
      if (name && size > 0) out.push({ name, size });
    }
  }
  return out;
}

export default function AudienceOverlapImportPage() {
  const [raw, setRaw] = useState<string>("Prospecting, 500000\nRetargeting, 120000\nLookalike, 300000");
  const [assumedOverlapPct, setAssumedOverlapPct] = useState<number>(25); // % of smaller between any pair

  const audiences = useMemo(() => parseAudiences(raw), [raw]);

  const pairwise = useMemo(() => {
    const pairs: { a: Audience; b: Audience; overlap: number }[] = [];
    for (let i = 0; i < audiences.length; i++) {
      for (let j = i + 1; j < audiences.length; j++) {
        const a = audiences[i];
        const b = audiences[j];
        const smaller = Math.min(a.size, b.size);
        const overlap = Math.floor(smaller * (assumedOverlapPct / 100));
        pairs.push({ a, b, overlap });
      }
    }
    return pairs;
  }, [audiences, assumedOverlapPct]);

  const summary = useMemo(() => {
    const totalSize = audiences.reduce((s, a) => s + a.size, 0);
    const duplicatesApprox = pairwise.reduce((s, p) => s + p.overlap, 0);
    // Naive union estimate = sum - pairwise overlaps (ignores triple overlaps)
    const unionApprox = Math.max(0, totalSize - duplicatesApprox);
    const duplicationRate = totalSize > 0 ? (duplicatesApprox / totalSize) * 100 : 0;
    return { totalSize, duplicatesApprox, unionApprox, duplicationRate };
  }, [audiences, pairwise]);

  function downloadCsv() {
    const header1 = ["audience","size"];
    const audRows = audiences.map(a => [a.name, String(a.size)]);
    const header2 = ["pair_a","pair_b","overlap_assumed"];
    const pairRows = pairwise.map(p => [p.a.name, p.b.name, String(p.overlap)]);
    const header3 = ["total_size","duplicates_approx","union_approx","duplication_rate_%"];
    const summaryRow = [String(summary.totalSize), String(summary.duplicatesApprox), String(summary.unionApprox), summary.duplicationRate.toFixed(2)];
    const csv = [header1, ...audRows, [], header2, ...pairRows, [], header3, summaryRow]
      .map(r => Array.isArray(r) ? r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",") : r)
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audience_overlap_import.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadMatrixCsv() {
    if (audiences.length === 0) return;
    const header = ["Audience", ...audiences.map(a => a.name)];
    const lines: string[] = [];
    lines.push(header.join(","));
    for (let i = 0; i < audiences.length; i++) {
      const a = audiences[i];
      const rowVals: (string | number)[] = [a.name];
      for (let j = 0; j < audiences.length; j++) {
        const b = audiences[j];
        if (i === j) {
          rowVals.push(a.size);
        } else {
          const overlapCount = Math.floor(Math.min(a.size, b.size) * (assumedOverlapPct / 100));
          rowVals.push(overlapCount);
        }
      }
      lines.push(rowVals.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement("a");
    aEl.href = url;
    aEl.download = "audience_overlap_matrix.csv";
    document.body.appendChild(aEl);
    aEl.click();
    aEl.remove();
    URL.revokeObjectURL(url);
  }

  function downloadTemplateCsv() {
    const header = ["audience","size"];
    const sample = [
      ["Prospecting","500000"],
      ["Retargeting","120000"],
      ["Lookalike","300000"],
    ];
    const csv = [header, ...sample]
      .map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audience_overlap_input_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function insertExampleRaw() {
    setRaw("Audience, size\nProspecting, 500000\nRetargeting, 120000\nLookalike, 300000");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Audience Overlap Import</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Paste audience sizes from planners. Assumes a global pairwise overlap to estimate deduped reach.</p>

      <Card title="Import and Configure" className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-700 dark:text-zinc-300">Assumed pairwise overlap (% of smaller)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={assumedOverlapPct}
            onChange={(e) => setAssumedOverlapPct(parseFloat(e.target.value || "0"))}
            className="w-24 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-1 text-sm"
          />
          <Button size="sm" variant="secondary" onClick={downloadMatrixCsv}>Download Matrix CSV</Button>
          <Button size="sm" variant="secondary" onClick={downloadTemplateCsv}>Download Template CSV</Button>
          <Button size="sm" variant="secondary" onClick={insertExampleRaw}>Insert Example</Button>
          <Button size="sm" variant="primary" className="ml-auto" onClick={downloadCsv}>Download CSV</Button>
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black px-2 py-2 text-sm"
          placeholder={"Audience, size\nProspecting, 500000\nRetargeting, 120000\nLookalike, 300000"}
        />

        {audiences.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            No audiences yet — paste the template above or click Insert Example.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Audiences">
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-700 dark:text-zinc-300">
                  <th className="py-1 pr-3">Name</th>
                  <th className="py-1 pr-3">Size</th>
                </tr>
              </thead>
              <tbody>
                {audiences.map((a, i) => (
                  <tr key={i}>
                    <td className="py-1 pr-3">{a.name}</td>
                    <td className="py-1 pr-3">{a.size.toLocaleString()}</td>
                  </tr>
                ))}
                {audiences.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-2 text-zinc-500 dark:text-zinc-400">Paste audience names and sizes above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          <Card title="Summary">
            <ul className="mt-2 text-sm text-zinc-800 dark:text-zinc-200 space-y-1">
              <li>Total size (sum): {summary.totalSize.toLocaleString()}</li>
              <li>Duplicates approx (pairwise): {summary.duplicatesApprox.toLocaleString()}</li>
              <li>Union reach approx: {summary.unionApprox.toLocaleString()}</li>
              <li>Duplication rate: {summary.duplicationRate.toFixed(2)}%</li>
            </ul>
          </Card>
        </div>

        <Card title="Pairwise overlaps (assumed)">
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-700 dark:text-zinc-300">
                <th className="py-1 pr-3">Audience A</th>
                <th className="py-1 pr-3">Audience B</th>
                <th className="py-1 pr-3">Overlap</th>
              </tr>
            </thead>
            <tbody>
              {pairwise.map((p, i) => (
                <tr key={i}>
                  <td className="py-1 pr-3">{p.a.name}</td>
                  <td className="py-1 pr-3">{p.b.name}</td>
                  <td className="py-1 pr-3">{p.overlap.toLocaleString()}</td>
                </tr>
              ))}
              {pairwise.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-2 text-zinc-500 dark:text-zinc-400">Add two or more audiences to view overlaps.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </Card>

      <Card title="Tips and assumptions">
        <ul className="text-sm text-zinc-700 dark:text-zinc-300 list-disc pl-5 space-y-1">
          <li>Expected input has two columns: <code>Audience</code> and <code>size</code>.</li>
          <li>Overlap is applied pairwise using the smaller audience size.</li>
          <li>Union reach ≈ sum of sizes − duplicates approximation.</li>
          <li>Use &quot;Download Template CSV&quot; or &quot;Insert Example&quot; to get started quickly.</li>
        </ul>
      </Card>
    </div>
  );
}