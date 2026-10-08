import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, apiError, backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

type Context = { params: Promise<unknown> };

export async function GET(request: NextRequest, context: Context) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return apiError({ message: "Unauthorized" }, 401);
  const rawParams = await context.params;
  const id = isRecord(rawParams) && typeof rawParams.id === "string" ? rawParams.id : "";
  if (!id) return apiError({ message: "Audit log ID is required" }, 400);
  const query = request.nextUrl.searchParams.toString();
  const isXlsx = request.nextUrl.searchParams.get("format") === "xlsx";
  const response = await fetch(backendUrl() + "/admin/audit-logs/export/" + encodeURIComponent(id) + (query ? "?" + query : ""), { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
  if (!response.ok) return apiError(await readJson(response), response.status, "Unable to export audit log entry.");
  const payload = envelopeData(await readJson(response));
  if (!isRecord(payload) || typeof payload.data !== "string") return apiError({ message: "Audit entry export returned an invalid file." }, 502);
  return new NextResponse(Buffer.from(payload.data, "base64"), { headers: { "Content-Type": typeof payload.contentType === "string" ? payload.contentType : isXlsx ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv", "Content-Disposition": 'attachment; filename="' + (typeof payload.filename === "string" ? payload.filename : isXlsx ? "audit-entry.xlsx" : "audit-entry.csv") + '"' } });
}