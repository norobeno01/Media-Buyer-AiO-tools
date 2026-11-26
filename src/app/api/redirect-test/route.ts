import { NextRequest } from "next/server";
import { traceRedirects } from "@/lib/safeFetch";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return Response.json({ error: "Missing url" }, { status: 400 });
  }
  try {
    return Response.json(await traceRedirects(url));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed";
    const blocked = /allowed|Invalid URL/.test(message);
    return Response.json({ error: blocked ? message : "Request failed" }, { status: blocked ? 400 : 500 });
  }
}
