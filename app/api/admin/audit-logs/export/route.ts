import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, apiError, backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export async function GET(request: NextRequest) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return apiError({ message: "Unauthorized" }, 401);
  const query = request.nextUrl.searchParams.toString();
  const response = await fetch(backendUrl() + "/admin/audit-logs/export" + (query ? "?" + query : ""), { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
  if (!response.ok) return apiError(await readJson(response), response.status, "Unable to export audit logs.");
  const payload = envelopeData(await readJson(response));
  if (!isRecord(payload) || typeof payload.data !== "string") return apiError({ message: "Audit export returned an invalid file." }, 502);
  return new NextResponse(Buffer.from(payload.data, "base64"), { headers: { "Content-Type": typeof payload.contentType === "string" ? payload.contentType : "text/csv", "Content-Disposition": 'attachment; filename="' + (typeof payload.filename === "string" ? payload.filename : "audit-logs.csv") + '"' } });
}