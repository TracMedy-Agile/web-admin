import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, apiError, backendUrl, clearAuthCookies, envelopeData, envelopeMessage, readJson } from "@/lib/server/auth-response";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!token) {
    const response = apiError({ message: "Unauthorized" }, 401);
    clearAuthCookies(response);
    return response;
  }

  let response: Response;
  try {
    response = await fetch(backendUrl() + "/auth/logout-all", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach session service.";
    return apiError({ message }, 502);
  }

  const payload = await readJson(response);
  if (!response.ok) {
    const nextResponse = apiError(payload, response.status, "Unable to revoke active sessions.");
    if (response.status === 401) {
      clearAuthCookies(nextResponse);
    }
    return nextResponse;
  }

  const nextResponse = NextResponse.json({ message: envelopeMessage(payload, "Success"), data: envelopeData(payload) });
  clearAuthCookies(nextResponse);
  return nextResponse;
}