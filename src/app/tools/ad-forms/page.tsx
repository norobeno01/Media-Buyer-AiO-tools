"use client";

import { useMemo, useState } from "react";
import HelpTip from "@/components/ui/HelpTip";

type Platform = "Google Display" | "Facebook" | "Instagram" | "TikTok" | "YouTube";
type Ratio = "1:1" | "4:5" | "9:16" | "16:9" | "1.91:1";

function ratioToPadding(r: Ratio) {
  // Convert aspect ratio to padding-top percentage for a responsive box
  const [w, h] = r.split(":").map(Number);
  return (h / w) * 100;
}

export default function AdFormsPage() {
  const [platform, setPlatform] = useState<Platform>("Facebook");
  const [ratio, setRatio] = useState<Ratio>("1:1");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [brand, setBrand] = useState<string>("StridePro");
  const [headline, setHeadline] = useState<string>("Comfort all day");
  const [primary, setPrimary] = useState<string>("Meet the running shoes built for marathon comfort and daily wear.");
  const [cta, setCta] = useState<string>("Shop Now");
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.92);
  type FontChoice = "System Sans" | "Roboto" | "Georgia" | "Times New Roman" | "Impact";
  const [fontChoice, setFontChoice] = useState<FontChoice>("System Sans");
  const fontFamily = useMemo(() => {
    const map: Record<FontChoice, string> = {
      "System Sans": "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      Roboto: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif",
      Georgia: "Georgia, 'Times New Roman', serif",
      "Times New Roman": "'Times New Roman', Georgia, serif",
      Impact: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
    };
    return map[fontChoice];
  }, [fontChoice]);

  const specHint = useMemo(() => {
    switch (platform) {
      case "Google Display":
        return "Common sizes: 300x250, 336x280, 728x90, 300x600. Keep text minimal and high-contrast.";
      case "Facebook":
        return "Recommended: 1:1 or 4:5. Minimal text on image; follow 20% text guidance.";
      case "Instagram":
        return "Recommended: 1:1 or 4:5. Use bold visuals; keep copy concise.";
      case "TikTok":
        return "Recommended: 9:16. Vertical video or image; strong hook + CTA.";
      case "YouTube":
        return "Recommended: 16:9 for thumbnails. High contrast; readable headline.";
    }
  }, [platform]);

  const buildSpecText = () => {
    return [
      `Platform: ${platform}`,
      `Aspect Ratio: ${ratio}`,
      `Brand: ${brand}`,
      `Headline: ${headline}`,
      `Primary: ${primary}`,
      `CTA: ${cta}`,
      `Disclaimer: ${disclaimer || "(none)"}`,
      `Image URL: ${imageUrl || "(none)"}`,
      `Overlay Opacity: ${Math.round(overlayOpacity * 100)}%`,
      `Font: ${fontChoice}`,
    ].join("\n");
  };
  const copySpec = () => navigator.clipboard.writeText(buildSpecText());
  const downloadSpec = () => {
    const blob = new Blob([buildSpecText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-spec-${ratio.replace(":","x")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function pickCanvasSize(r: Ratio) {
    switch (r) {
      case "1:1":
        return { w: 1080, h: 1080 };
      case "4:5":
        return { w: 1080, h: 1350 };
      case "9:16":
        return { w: 1080, h: 1920 };
      case "16:9":
        return { w: 1920, h: 1080 };
      case "1.91:1":
        return { w: 1200, h: 628 };
      default:
        return { w: 1080, h: 1080 };
    }
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function drawImageCover(ctx: CanvasRenderingContext2D, src: string, w: number, h: number) {
    const img = await loadImage(src);
    const iw = img.width;
    const ih = img.height;
    const scale = Math.max(w / iw, h / ih);
    const dw = Math.floor(iw * scale);
    const dh = Math.floor(ih * scale);
    const dx = Math.floor((w - dw) / 2);
    const dy = Math.floor((h - dh) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(/\s+/);
    let line = "";
    const lines: string[] = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line ? line + " " + words[n] : words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return y + lines.length * lineHeight;
  }

  async function exportPng() {
    const { w, h } = pickCanvasSize(ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Image cover
    if (imageUrl) {
      try {
        await drawImageCover(ctx, imageUrl, w, h);
      } catch {
        // If image fails, leave plain background
      }
    } else {
      ctx.fillStyle = "#f4f4f5"; // zinc-100
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#71717a"; // zinc-500
    ctx.font = `16px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.fillText("Image preview", w / 2, h / 2);
      ctx.textAlign = "left";
    }

    // Bottom panel
    const panelHeight = Math.round(h * 0.32);
    ctx.fillStyle = `rgba(255,255,255,${overlayOpacity})`;
    ctx.fillRect(0, h - panelHeight, w, panelHeight);

    const pad = 32;
    let cy = h - panelHeight + pad;
    const maxTextWidth = w - pad * 2;

    // Brand
    ctx.fillStyle = "#71717a"; // zinc-500
    ctx.font = `600 20px ${fontFamily}`;
    ctx.fillText(brand, pad, cy);
    cy += 30;

    // Headline
    ctx.fillStyle = "#0a0a0a"; // near black
    ctx.font = `700 36px ${fontFamily}`;
    cy = wrapText(ctx, headline, pad, cy, maxTextWidth, 42);

    // Primary
    ctx.fillStyle = "#27272a"; // zinc-700
    ctx.font = `400 24px ${fontFamily}`;
    cy = wrapText(ctx, primary, pad, cy + 6, maxTextWidth, 32);

    // CTA and Disclaimer row
    ctx.fillStyle = "#2563eb"; // blue-600
    ctx.font = `700 26px ${fontFamily}`;
    ctx.fillText(cta, pad, h - pad);
    if (disclaimer) {
      ctx.fillStyle = "#71717a"; // zinc-500
    ctx.font = `400 18px ${fontFamily}`;
      ctx.textAlign = "right";
      ctx.fillText(disclaimer, w - pad, h - pad);
      ctx.textAlign = "left";
    }

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-${ratio.replace(":","x")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Creative</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Ad Forms Editor</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Prebuilt forms for display and social ads. Choose platform and ratio, fill fields, and copy specs. Includes a simple visual preview box.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Ad Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Google Display</option>
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>TikTok</option>
                  <option>YouTube</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{specHint}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Aspect Ratio</label>
                <select value={ratio} onChange={(e) => setRatio(e.target.value as Ratio)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>1:1</option>
                  <option>4:5</option>
                  <option>9:16</option>
                  <option>16:9</option>
                  <option>1.91:1</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Image URL (optional)</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                {!imageUrl && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Tip: Use a public image URL to render the preview and the exported PNG.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Overlay Opacity</label>
                <input type="range" min={0.6} max={1} step={0.02} value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} className="w-full" />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{Math.round(overlayOpacity * 100)}%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Text Font</label>
                <select value={fontChoice} onChange={(e) => setFontChoice(e.target.value as FontChoice)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>System Sans</option>
                  <option>Roboto</option>
                  <option>Georgia</option>
                  <option>Times New Roman</option>
                  <option>Impact</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Ad Copy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Brand</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Headline</label>
                <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Primary Text</label>
                <textarea value={primary} onChange={(e) => setPrimary(e.target.value)} rows={4} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">CTA</label>
                  <input value={cta} onChange={(e) => setCta(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Disclaimer</label>
                  <input value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Preview</h2>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 overflow-hidden">
              <div className="relative w-full" style={{ paddingTop: `${ratioToPadding(ratio)}%` }}>
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="ad image" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-sm text-zinc-400 dark:text-zinc-500">Image preview</div>
                    )}
                  </div>
                  <div className="p-4 border-t border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity})`, fontFamily }}>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{brand}</div>
                    <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{headline}</div>
                    <div className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">{primary}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{cta}</span>
                      {disclaimer && <span className="text-xs text-zinc-500 dark:text-zinc-400">{disclaimer}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Actions</h2>
            <div className="space-y-3">
              <button onClick={copySpec} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Copy Spec</button>
              <button onClick={downloadSpec} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Download Spec</button>
              <button onClick={exportPng} className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors">Export PNG</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}