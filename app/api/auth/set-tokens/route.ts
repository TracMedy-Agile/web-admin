import { NextResponse } from "next/server";
import { apiError, clearAuthCookies, extractTokens, setAuthCookies } from "@/lib/server/auth-response";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const tokens = extractTokens(body);

  if (!tokens) {
    return apiError({ message: "Valid admin tokens are required." }, 400);
  }

  const response = NextResponse.json({ ok: true });
  setAuthCookies(response, tokens);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
