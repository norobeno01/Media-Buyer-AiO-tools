import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        models: [
          { name: "models/gemini-1.5-flash-latest" },
          { name: "models/gemini-1.5-pro-latest" },
        ],
        note: "Fallback list provided due to missing GEMINI_API_KEY",
      },
      { status: 200 }
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: res.ok ? 200 : res.status });
    } catch {
      // Fallback to raw text if not JSON
      return new NextResponse(text, {
        status: res.ok ? 200 : res.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        models: [
          { name: "models/gemini-1.5-flash-latest" },
          { name: "models/gemini-1.5-pro-latest" },
        ],
        note: "Fallback list provided due to error",
      },
      { status: 200 }
    );
  }
}
