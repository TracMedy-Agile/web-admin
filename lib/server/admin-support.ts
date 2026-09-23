import { backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export type AdminSupportTicket = {
  id: string;
  ticketNumber: string;
  userId: string | null;
  category: string;
  subject: string | null;
  message: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  attachmentCount: number;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSupportTicketPage = {
  items: AdminSupportTicket[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type AdminSupportSummary = {
  total: number;
  active: number;
  new: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  unassignedActive: number;
  highPriorityActive: number;
};

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeTicket(value: unknown): AdminSupportTicket | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const ticketNumber = stringValue(value.ticketNumber);
  const category = stringValue(value.category);
  const message = stringValue(value.message);
  const status = stringValue(value.status);
  const priority = stringValue(value.priority);
  const createdAt = stringValue(value.createdAt);
  const updatedAt = stringValue(value.updatedAt);
  if (!id || !ticketNumber || !category || !message || !status || !priority || !createdAt || !updatedAt) return null;

  return {
    id,
    ticketNumber,
    userId: stringValue(value.userId),
    category,
    subject: stringValue(value.subject),
    message,
    status,
    priority,
    assignedToId: stringValue(value.assignedToId),
    attachmentCount: numberValue(value.attachmentCount),
    resolvedAt: stringValue(value.resolvedAt),
    closedAt: stringValue(value.closedAt),
    createdAt,
    updatedAt,
  };
}

export async function getAdminSupportTickets(token: string, query: { status?: string; priority?: string; search?: string; page?: string; limit?: string }): Promise<AdminSupportTicketPage | null> {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string" && value.trim()) params.set(key, value);
    }
    const suffix = params.toString() ? "?" + params.toString() : "";
    const response = await fetch(backendUrl() + "/admin/support" + suffix, {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    const source = Array.isArray(payload.data) ? payload.data : [];
    const items = source.map(normalizeTicket).filter((item): item is AdminSupportTicket => item !== null);
    return {
      items,
      total: numberValue(payload.total),
      page: numberValue(payload.page) || 1,
      limit: numberValue(payload.limit) || items.length,
      pages: numberValue(payload.pages) || 1,
    };
  } catch {
    return null;
  }
}

export async function getAdminSupportSummary(token: string): Promise<AdminSupportSummary | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/support/summary", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    return {
      total: numberValue(payload.total),
      active: numberValue(payload.active),
      new: numberValue(payload.new),
      open: numberValue(payload.open),
      inProgress: numberValue(payload.inProgress),
      resolved: numberValue(payload.resolved),
      closed: numberValue(payload.closed),
      unassignedActive: numberValue(payload.unassignedActive),
      highPriorityActive: numberValue(payload.highPriorityActive),
    };
  } catch {
    return null;
  }
}


export type AdminSupportAttachmentAccess = {
  id: string;
  fileName: string;
  mimeType: string;
  url: string;
  expiresAt: string;
};

function normalizeAttachmentAccess(value: unknown): AdminSupportAttachmentAccess | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const fileName = stringValue(value.fileName);
  const mimeType = stringValue(value.mimeType);
  const url = stringValue(value.url);
  const expiresAt = stringValue(value.expiresAt);
  if (!id || !fileName || !mimeType || !url || !expiresAt) return null;
  return { id, fileName, mimeType, url, expiresAt };
}

export async function getAdminSupportTicket(token: string, ticketId: string): Promise<AdminSupportTicket | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/support/" + encodeURIComponent(ticketId), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return normalizeTicket(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function getAdminSupportAttachmentUrl(token: string, ticketId: string, attachmentId: string): Promise<AdminSupportAttachmentAccess | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/support/" + encodeURIComponent(ticketId) + "/attachments/" + encodeURIComponent(attachmentId), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return normalizeAttachmentAccess(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export type AdminSupportStatusResult = {
  message: string;
};

export async function updateAdminSupportStatus(token: string, ticketId: string, status: "resolved", reason?: string): Promise<AdminSupportStatusResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/support/" + encodeURIComponent(ticketId) + "/status", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    const message = stringValue(payload.message);
    return message ? { message } : null;
  } catch {
    return null;
  }
}
