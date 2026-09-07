import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, apiError, backendUrl, envelopeData, readJson } from "@/lib/server/auth-response";

function csvFromPayload(payload: unknown): string | null {
  const data = envelopeData(payload);
  return typeof data === "string" ? data : null;
}

function csvFromText(text: string): string {
  try {
    const parsed = JSON.parse(text) as unknown;
    return csvFromPayload(parsed) ?? text;
  } catch {
    return text;
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return apiError({ message: "Unauthorized" }, 401);
  }

  const query = request.nextUrl.searchParams.toString();
  const url = backendUrl() + "/admin/users/export" + (query ? "?" + query : "");

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach users export service.";
    return apiError({ message }, 502);
  }

  if (!response.ok) {
    return apiError(await readJson(response), response.status, "Unable to export users.");
  }

  const csv = csvFromText(await response.text());

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tracmedy-users.csv"',
    },
  });
}
