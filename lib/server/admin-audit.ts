import { backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export const AUDIT_MODULES = ["auth", "users", "patients", "facilities", "home_care", "medications", "care_episodes", "payments", "clinical_monitoring", "ai_operations", "notifications", "support", "roles", "audit_log", "settings"] as const;

export type AdminAuditLog = {
  id: string; facilityId: string | null; actorId: string | null; actorName: string | null;
  actorRole: string | null; module: string; action: string; targetEntity: unknown;
  ipAddress: string | null; metadata: unknown; createdAt: string;
};
export type AdminAuditPage = { data: AdminAuditLog[]; total: number; page: number; limit: number; pages: number };
export type AdminAuditQuery = { module?: string; actorId?: string; action?: string; from?: string; to?: string; facilityId?: string; page?: number; limit?: number };

const textValue = (value: unknown): string | null => typeof value === "string" && value.trim() ? value : null;
function normalize(value: unknown): AdminAuditLog | null {
  if (!isRecord(value)) return null;
  const id = textValue(value.id), moduleName = textValue(value.module), action = textValue(value.action), createdAt = textValue(value.createdAt);
  if (!id || !moduleName || !action || !createdAt) return null;
  return { id, module: moduleName, action, createdAt, facilityId: textValue(value.facilityId), actorId: textValue(value.actorId), actorName: textValue(value.actorName), actorRole: textValue(value.actorRole), targetEntity: value.targetEntity ?? null, ipAddress: textValue(value.ipAddress), metadata: value.metadata ?? null };
}
export async function getAdminAuditLogs(token: string, query: AdminAuditQuery = {}): Promise<AdminAuditPage | null> {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== "") params.set(key, String(value));
    const response = await fetch(backendUrl() + "/admin/audit-logs?" + params.toString(), { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !Array.isArray(payload.data)) return null;
    const data = payload.data.map(normalize).filter((item): item is AdminAuditLog => item !== null);
    const total = typeof payload.total === "number" ? payload.total : data.length;
    const page = typeof payload.page === "number" ? payload.page : query.page ?? 1;
    const limit = typeof payload.limit === "number" ? payload.limit : query.limit ?? 20;
    return { data, total, page, limit, pages: typeof payload.pages === "number" ? payload.pages : Math.max(1, Math.ceil(total / limit)) };
  } catch { return null; }
}
export async function getAdminAuditLog(token: string, id: string): Promise<AdminAuditLog | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/audit-logs/" + encodeURIComponent(id), { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalize(envelopeData(await readJson(response)));
  } catch { return null; }
}