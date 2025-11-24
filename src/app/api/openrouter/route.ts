import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, system, model } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
    }

    const chosenModel = typeof model === "string" && model.length ? model : undefined;
    const messages: Array<{ role: string; content: string }> = [];
    if (system) messages.push({ role: "system", content: String(system) });
    messages.push({ role: "user", content: String(prompt || "") });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Title": "MBA Tools",
      },
      body: JSON.stringify({
        model: chosenModel,
        messages,
      }),
    });

    const textBody = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: textBody || "OpenRouter call failed", status: res.status }, { status: 502 });
    }
    let json: any = {};
    try { json = JSON.parse(textBody); } catch {}
    const content = json?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ text: content });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}