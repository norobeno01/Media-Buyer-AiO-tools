import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Title": "MBA Tools",
      },
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: res.ok ? 200 : res.status });
    } catch {
      return new NextResponse(text, {
        status: res.ok ? 200 : res.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to list models" }, { status: 502 });
  }
}