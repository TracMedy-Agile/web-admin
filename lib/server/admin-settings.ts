import { backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export type AdminSettings = {
  data: Record<string, Record<string, unknown>>;
  editableSections: string[];
};

export type AdminSettingChange = {
  section: string;
  key: string;
  value: unknown;
  reason?: string;
};

function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function getAdminSettings(token: string): Promise<AdminSettings | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/settings", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !isRecord(payload.data) || !Array.isArray(payload.editableSections)) return null;
    return { data: payload.data as Record<string, Record<string, unknown>>, editableSections: payload.editableSections.filter((item): item is string => typeof item === "string") };
  } catch { return null; }
}

export async function updateAdminSettings(token: string, changes: AdminSettingChange[]): Promise<string | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/settings", { method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ changes }), cache: "no-store" });
    const payload = await readJson(response);
    if (!response.ok) return null;
    const data = envelopeData(payload);
    return isRecord(data) ? text(data.message) : null;
  } catch { return null; }
}
export type AdminPolicyRevision = {
  id: string;
  section: string;
  settingKey: string;
  previousValue: unknown;
  newValue: unknown;
  reason: string | null;
  changedById: string | null;
  changedAt: string;
};

function normalizeRevision(value: unknown): AdminPolicyRevision | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  const section = text(value.section);
  const settingKey = text(value.settingKey);
  const changedAt = text(value.changedAt);
  if (!id || !section || !settingKey || !changedAt) return null;
  return { id, section, settingKey, previousValue: value.previousValue ?? null, newValue: value.newValue ?? null, reason: text(value.reason), changedById: text(value.changedById), changedAt };
}

export async function getAdminSettingRevisions(token: string, section?: string): Promise<{ data: AdminPolicyRevision[]; total: number; page: number; pages: number } | null> {
  try {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    if (section) params.set("section", section);
    const response = await fetch(backendUrl() + "/admin/settings/revisions?" + params.toString(), { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !Array.isArray(payload.data)) return null;
    const data = payload.data.map(normalizeRevision).filter((item): item is AdminPolicyRevision => item !== null);
    return { data, total: typeof payload.total === "number" ? payload.total : data.length, page: typeof payload.page === "number" ? payload.page : 1, pages: typeof payload.pages === "number" ? payload.pages : 1 };
  } catch { return null; }
}