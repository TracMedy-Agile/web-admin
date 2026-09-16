import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, apiError, backendUrl, envelopeData, envelopeMessage, readJson } from "@/lib/server/auth-response";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return apiError({ message: "Unauthorized" }, 401);
  }

  let response: Response;
  try {
    response = await fetch(backendUrl() + "/admin/me", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach admin profile service.";
    return apiError({ message }, 502);
  }

  const payload = await readJson(response);
  if (!response.ok) {
    return apiError(payload, response.status, "Unable to load admin profile.");
  }

  return NextResponse.json({ message: envelopeMessage(payload, "Success"), data: envelopeData(payload) });
}
