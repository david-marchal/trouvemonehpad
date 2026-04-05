import { NextResponse } from "next/server";

export function jsonUtf8(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }

  return new NextResponse(JSON.stringify(data), {
    ...init,
    headers,
  });
}
