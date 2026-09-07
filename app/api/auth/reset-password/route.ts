import { NextResponse } from "next/server";
import { apiError, backendUrl, clearAuthCookies, envelopeData, envelopeMessage, readJson } from "@/lib/server/auth-response";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  let response: Response;
  try {
    response = await fetch(backendUrl() + "/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach password reset service.";
    return apiError({ message }, 502);
  }

  const payload = await readJson(response);
  if (!response.ok) {
    return apiError(payload, response.status, "Unable to update password.");
  }

  const nextResponse = NextResponse.json({ message: envelopeMessage(payload, "Success"), data: envelopeData(payload) });
  clearAuthCookies(nextResponse);
  return nextResponse;
}
