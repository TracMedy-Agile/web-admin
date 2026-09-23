type JsonRecord = Record<string, unknown>;

export type AdminNotificationCampaign = {
  id: string;
  title: string;
  body: string;
  type: string;
  audienceScope: string;
  audienceLabel: string;
  recipientCount: number;
  channels: string[];
  status: string;
  scheduleType: string;
  scheduledFor: string | null;
  sentAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  deliverySummary: JsonRecord | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminNotificationCampaignPage = {
  data: AdminNotificationCampaign[];
  total: number;
  page: number;
  limit: number;
};

function backendUrl(): string {
  return process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function readJson(response: Response): Promise<unknown> {
  try { return await response.json(); } catch { return null; }
}

function envelopeData(value: unknown): unknown {
  return isRecord(value) && "data" in value ? value.data : value;
}

function normalizeCampaign(value: unknown): AdminNotificationCampaign | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const title = stringValue(value.title);
  const body = stringValue(value.body);
  const type = stringValue(value.type);
  const audienceScope = stringValue(value.audienceScope);
  const audienceLabel = stringValue(value.audienceLabel);
  const status = stringValue(value.status);
  const scheduleType = stringValue(value.scheduleType);
  const createdAt = stringValue(value.createdAt);
  const updatedAt = stringValue(value.updatedAt);
  if (!id || !title || !body || !type || !audienceScope || !audienceLabel || !status || !scheduleType || !createdAt || !updatedAt) return null;
  return { id, title, body, type, audienceScope, audienceLabel, recipientCount: numberValue(value.recipientCount), channels: Array.isArray(value.channels) ? value.channels.filter((channel): channel is string => typeof channel === "string") : [], status, scheduleType, scheduledFor: stringValue(value.scheduledFor), sentAt: stringValue(value.sentAt), cancelledAt: stringValue(value.cancelledAt), cancelReason: stringValue(value.cancelReason), deliverySummary: isRecord(value.deliverySummary) ? value.deliverySummary : null, createdAt, updatedAt };
}

function normalizePage(value: unknown): AdminNotificationCampaignPage | null {
  if (!isRecord(value) || !Array.isArray(value.data)) return null;
  return { data: value.data.map(normalizeCampaign).filter((campaign): campaign is AdminNotificationCampaign => campaign !== null), total: numberValue(value.total), page: numberValue(value.page) || 1, limit: numberValue(value.limit) || 20 };
}

export async function getAdminNotificationCampaigns(token: string): Promise<AdminNotificationCampaignPage | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/notifications/campaigns?limit=20", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizePage(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}
export type AdminNotificationCampaignCreateInput = {
  title: string;
  body: string;
  type: string;
  audienceScope: string;
  channels: string[];
  scheduleType?: "now" | "scheduled";
  scheduledFor?: string;
  timezone?: string;
  idempotencyKey?: string;
};

export async function createAdminNotificationCampaign(token: string, input: AdminNotificationCampaignCreateInput): Promise<AdminNotificationCampaign | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/notifications/campaigns", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
    if (!response.ok) return null;
    return normalizeCampaign(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function getAdminNotificationCampaign(token: string, campaignId: string): Promise<AdminNotificationCampaign | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/notifications/campaigns/" + encodeURIComponent(campaignId), { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizeCampaign(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}
export type AdminNotificationCampaignUpdateInput = {
  title?: string;
  body?: string;
  type?: string;
  channels?: string[];
  scheduledFor?: string;
};

export async function updateAdminNotificationCampaign(token: string, campaignId: string, input: AdminNotificationCampaignUpdateInput): Promise<AdminNotificationCampaign | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/notifications/campaigns/" + encodeURIComponent(campaignId), { method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
    if (!response.ok) return null;
    return normalizeCampaign(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function sendAdminNotificationCampaign(token: string, campaignId: string): Promise<string | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/notifications/campaigns/" + encodeURIComponent(campaignId) + "/send", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({}), cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return isRecord(payload) && typeof payload.message === "string" ? payload.message : "Notification campaign sent";
  } catch {
    return null;
  }
}
export async function cancelAdminNotificationCampaign(token: string, campaignId: string, reason: string): Promise<string | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/notifications/campaigns/" + encodeURIComponent(campaignId) + "/cancel", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ reason }), cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return isRecord(payload) && typeof payload.message === "string" ? payload.message : "Notification campaign cancelled";
  } catch {
    return null;
  }
}

export async function retryAdminNotificationCampaign(token: string, campaignId: string): Promise<string | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/notifications/campaigns/" + encodeURIComponent(campaignId) + "/retry", { method: "POST", headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return isRecord(payload) && typeof payload.message === "string" ? payload.message : "Notification campaign retry queued";
  } catch {
    return null;
  }
}
export type AdminNotificationAttempt = {
  id: string;
  channel: string;
  status: string;
  errorSafe: string | null;
  attemptedAt: string | null;
  createdAt: string;
};

export type AdminNotificationAttempts = {
  campaignId: string;
  summary: { byStatus: Record<string, number>; byChannel: Record<string, number> };
  deliverySummary: JsonRecord | null;
  data: AdminNotificationAttempt[];
};

function numberMap(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === "number" && Number.isFinite(item)).map(([key, item]) => [key, item as number]));
}

function normalizeAttempts(value: unknown): AdminNotificationAttempts | null {
  if (!isRecord(value) || !Array.isArray(value.data)) return null;
  const campaignId = stringValue(value.campaignId);
  if (!campaignId || !isRecord(value.summary)) return null;
  const data = value.data.flatMap((item): AdminNotificationAttempt[] => {
    if (!isRecord(item)) return [];
    const id = stringValue(item.id);
    const channel = stringValue(item.channel);
    const status = stringValue(item.status);
    const createdAt = stringValue(item.createdAt);
    if (!id || !channel || !status || !createdAt) return [];
    return [{ id, channel, status, errorSafe: stringValue(item.errorSafe), attemptedAt: stringValue(item.attemptedAt), createdAt }];
  });
  return { campaignId, summary: { byStatus: numberMap(value.summary.byStatus), byChannel: numberMap(value.summary.byChannel) }, deliverySummary: isRecord(value.deliverySummary) ? value.deliverySummary : null, data };
}

export async function getAdminNotificationAttempts(token: string, campaignId: string): Promise<AdminNotificationAttempts | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/notifications/campaigns/" + encodeURIComponent(campaignId) + "/attempts", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizeAttempts(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}