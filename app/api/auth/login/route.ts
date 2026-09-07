import { NextResponse } from "next/server";
import { apiError, backendUrl, envelopeMessage, extractTokens, extractUser, readJson, setAuthCookies } from "@/lib/server/auth-response";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  let response: Response;
  try {
    response = await fetch(backendUrl() + "/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach authentication service.";
    return apiError({ message }, 502);
  }

  const payload = await readJson(response);
  if (!response.ok) {
    return apiError(payload, response.status, "Invalid admin credentials.");
  }

  const tokens = extractTokens(payload);
  if (!tokens) {
    return apiError({ message: "Admin login response did not include an access token." }, 502);
  }

  const nextResponse = NextResponse.json({ message: envelopeMessage(payload, "Success"), user: extractUser(payload) });
  setAuthCookies(nextResponse, tokens);
  return nextResponse;
}
