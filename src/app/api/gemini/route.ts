import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, system, model: requestedModel } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const modelsToTry = requestedModel
      ? [requestedModel]
      : ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];

    const userText = system ? `${system}\n\n${prompt}` : prompt;
    const contents = [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ];

    let lastErrorText = "";
    let lastStatus = 0;
    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });
      if (res.ok) {
        const data = await res.json();
        const text =
          data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("\n") ?? "";
        return NextResponse.json({ text, model });
      } else {
        lastStatus = res.status;
        lastErrorText = await res.text();
        // Try next model
      }
    }

    return NextResponse.json(
      { error: lastErrorText || "Model call failed", status: lastStatus, model: modelsToTry[0] },
      { status: 502 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}