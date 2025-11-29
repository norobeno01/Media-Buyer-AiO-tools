import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        data: [
          { id: "anthropic/claude-3.5-sonnet" },
          { id: "openai/gpt-4o-mini" },
          { id: "google/gemini-1.5-flash" },
          { id: "mistralai/mistral-large" },
        ],
        note: "Fallback list provided due to missing OPENROUTER_API_KEY",
      },
      { status: 200 }
    );
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
    return NextResponse.json(
      {
        data: [
          { id: "anthropic/claude-3.5-sonnet" },
          { id: "openai/gpt-4o-mini" },
          { id: "google/gemini-1.5-flash" },
          { id: "mistralai/mistral-large" },
        ],
        note: "Fallback list provided due to error",
      },
      { status: 200 }
    );
  }
}
