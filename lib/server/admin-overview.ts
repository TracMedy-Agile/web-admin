import { cookies } from "next/headers";
import { ACCESS_COOKIE, backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export type SummaryCard = {
  value: number;
  trendPercent?: number | null;
  deltaLabel?: string | null;
  status?: string | null;
  state?: string | null;
};

export type AdminOverview = {
  hasData: boolean;
  summary?: {
    totalUsers?: SummaryCard;
    subscribers?: SummaryCard;
  };
  userDistribution?: {
    total: number;
    byRole: Array<{ key: string; count: number; percentage: number }>;
  };
};

export type AdminTopbarProfile = {
  fullName: string;
  initials: string;
  roleLabel: string;
};

export type AdminUsersSummary = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  inactiveUsers: number;
  plusUsers: number;
  freeUsers: number;
  subscriberGrowthPercent: number;
};

export type AdminUserStatus = "pending" | "active" | "locked" | "suspended";

export type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  status: AdminUserStatus;
  plan: string;
  dateJoined: string;
  lastActivityLabel: string;
  allowedActions: string[];
};

export type AdminUsersList = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: AdminUserRow[];
};

export type AdminUserDetail = {
  id: string;
  initials: string;
  avatarUrl: string;
  fullName: string;
  status: AdminUserStatus;
  plan: string;
  email: string;
  phoneNumber: string | null;
  tracmedyPatientId: string | null;
  lastPaymentDate: string | null;
  nextBillingDate: string | null;
  billingCycle: string | null;
  dateJoined: string;
  lastLoginAt: string | null;
  lastLoginLabel: string;
  allowedActions: string[];
};

export type AdminUserStatusAction = "activate" | "suspend";

export type AdminUserStatusResult = {
  id: string;
  status: AdminUserStatus;
};

export type AdminFacilitiesSummary = {
  total: number;
  active: number;
  suspended: number;
  inactive: number;
};

export type AdminFacilityStatus = "active" | "suspended" | "inactive";

export type AdminFacilityType = "hospital" | "clinic" | "pharmacy" | "laboratory" | "nursing_home";

export type AdminFacilityRegisterInput = {
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  type?: AdminFacilityType;
};

export type AdminFacilityResult = {
  id: string;
  tracId: string;
  status: AdminFacilityStatus;
};

export type AdminFacilityStatusAction = "activate" | "suspend";

export type AdminFacilityStatusResult = {
  id: string;
  status: AdminFacilityStatus;
};
export type AdminFacilityRow = {
  id: string;
  tracId: string;
  facilityName: string;
  email: string | null;
  locationLabel: string | null;
  status: AdminFacilityStatus;
  type: string;
  dateRegistered: string;
  allowedActions: string[];
};

export type AdminFacilitiesList = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: AdminFacilityRow[];
};

export type AdminFacilityDetail = {
  id: string;
  tracId: string;
  initials: string;
  facilityName: string;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  hospitalType: string;
  connectedPatientsCount: number;
  status: AdminFacilityStatus;
  contactPerson: {
    name: string | null;
    role: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
  subscription: {
    startDate: string | null;
    nextBillingDate: string | null;
    status: string | null;
  };
  recentPayments: {
    entries: Array<{ amount: string; date: string; status: string }>;
    count: number;
  };
  allowedActions: string[];
};
function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function nullableStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeCard(value: unknown): SummaryCard | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const cardValue = numberValue(value.value);
  if (cardValue === undefined) {
    return undefined;
  }

  return {
    value: cardValue,
    trendPercent: numberValue(value.trendPercent) ?? null,
    deltaLabel: stringValue(value.deltaLabel) ?? null,
    status: stringValue(value.status) ?? null,
    state: stringValue(value.state) ?? null,
  };
}

export async function getAdminSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? null;
}

async function fetchAdminJson(path: string, token: string): Promise<unknown> {
  const response = await fetch(backendUrl() + path, {
    method: "GET",
    headers: { Authorization: "Bearer " + token },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return envelopeData(await readJson(response));
}

export async function getAdminOverview(token: string): Promise<AdminOverview | null> {
  try {
    const payload = await fetchAdminJson("/admin/dashboard/overview", token);
    if (!isRecord(payload)) {
      return null;
    }

    const summary = isRecord(payload.summary) ? payload.summary : {};
    const distribution = isRecord(payload.userDistribution) ? payload.userDistribution : null;
    const byRoleSource = distribution && Array.isArray(distribution.byRole) ? distribution.byRole : [];

    return {
      hasData: payload.hasData === true,
      summary: {
        totalUsers: normalizeCard(summary.totalUsers),
        subscribers: normalizeCard(summary.subscribers),
      },
      userDistribution: distribution
        ? {
            total: numberValue(distribution.total) ?? 0,
            byRole: byRoleSource.filter(isRecord).map((item) => ({
              key: stringValue(item.key) ?? "unknown",
              count: numberValue(item.count) ?? 0,
              percentage: numberValue(item.percentage) ?? 0,
            })),
          }
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function getAdminTopbarProfile(token: string): Promise<AdminTopbarProfile | null> {
  try {
    const payload = await fetchAdminJson("/admin/me", token);
    if (!isRecord(payload)) {
      return null;
    }

    return {
      fullName: stringValue(payload.fullName) ?? "Roland Richard",
      initials: stringValue(payload.initials) ?? "RR",
      roleLabel: stringValue(payload.subRole) ?? "Super Admin",
    };
  } catch {
    return null;
  }
}


export async function getAdminUsersSummary(token: string): Promise<AdminUsersSummary | null> {
  try {
    const payload = await fetchAdminJson("/admin/users/summary", token);
    if (!isRecord(payload)) {
      return null;
    }

    return {
      totalUsers: numberValue(payload.totalUsers) ?? 0,
      activeUsers: numberValue(payload.activeUsers) ?? 0,
      suspendedUsers: numberValue(payload.suspendedUsers) ?? 0,
      inactiveUsers: numberValue(payload.inactiveUsers) ?? 0,
      plusUsers: numberValue(payload.plusUsers) ?? 0,
      freeUsers: numberValue(payload.freeUsers) ?? 0,
      subscriberGrowthPercent: numberValue(payload.subscriberGrowthPercent) ?? 0,
    };
  } catch {
    return null;
  }
}


function adminFacilityStatusValue(value: unknown): AdminFacilityStatus {
  return value === "active" || value === "suspended" || value === "inactive" ? value : "inactive";
}

function normalizeAdminFacilityRow(value: unknown): AdminFacilityRow | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const tracId = stringValue(value.tracId);
  const facilityName = stringValue(value.facilityName);
  const type = stringValue(value.type);
  const dateRegistered = stringValue(value.dateRegistered);
  if (!id || !tracId || !facilityName || !type || !dateRegistered) {
    return null;
  }

  return {
    id,
    tracId,
    facilityName,
    email: nullableStringValue(value.email),
    locationLabel: nullableStringValue(value.locationLabel),
    status: adminFacilityStatusValue(value.status),
    type,
    dateRegistered,
    allowedActions: stringArrayValue(value.allowedActions),
  };
}

function normalizePaymentEntry(value: unknown): { amount: string; date: string; status: string } | null {
  if (!isRecord(value)) {
    return null;
  }

  const amountValue = value.amount;
  const amount = typeof amountValue === "number" && Number.isFinite(amountValue) ? amountValue.toString() : stringValue(amountValue);
  const date = stringValue(value.date) ?? stringValue(value.createdAt);
  const status = stringValue(value.status);
  if (!amount || !date || !status) {
    return null;
  }

  return { amount, date, status };
}

function normalizeAdminFacilityDetail(value: unknown): AdminFacilityDetail | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const tracId = stringValue(value.tracId);
  const initials = stringValue(value.initials);
  const facilityName = stringValue(value.facilityName);
  const hospitalType = stringValue(value.hospitalType);
  if (!id || !tracId || !initials || !facilityName || !hospitalType) {
    return null;
  }

  const contactSource = isRecord(value.contactPerson) ? value.contactPerson : {};
  const subscriptionSource = isRecord(value.subscription) ? value.subscription : {};
  const paymentsSource = isRecord(value.recentPayments) ? value.recentPayments : {};
  const paymentEntries = Array.isArray(paymentsSource.entries) ? paymentsSource.entries.map(normalizePaymentEntry).filter((entry): entry is { amount: string; date: string; status: string } => entry !== null) : [];

  return {
    id,
    tracId,
    initials,
    facilityName,
    email: nullableStringValue(value.email),
    phoneNumber: nullableStringValue(value.phoneNumber),
    address: nullableStringValue(value.address),
    hospitalType,
    connectedPatientsCount: numberValue(value.connectedPatientsCount) ?? 0,
    status: adminFacilityStatusValue(value.status),
    contactPerson: {
      name: nullableStringValue(contactSource.name),
      role: nullableStringValue(contactSource.role),
      email: nullableStringValue(contactSource.email),
      phoneNumber: nullableStringValue(contactSource.phoneNumber),
    },
    subscription: {
      startDate: nullableStringValue(subscriptionSource.startDate),
      nextBillingDate: nullableStringValue(subscriptionSource.nextBillingDate),
      status: nullableStringValue(subscriptionSource.status),
    },
    recentPayments: {
      entries: paymentEntries,
      count: numberValue(paymentsSource.count) ?? paymentEntries.length,
    },
    allowedActions: stringArrayValue(value.allowedActions),
  };
}
function normalizeAdminFacilityStatusResult(value: unknown): AdminFacilityStatusResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  if (!id) {
    return null;
  }

  return { id, status: adminFacilityStatusValue(value.status) };
}

function normalizeAdminFacilityResult(value: unknown): AdminFacilityResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const tracId = stringValue(value.tracId);
  if (!id || !tracId) {
    return null;
  }

  return { id, tracId, status: adminFacilityStatusValue(value.status) };
}

export async function registerAdminFacility(token: string, input: AdminFacilityRegisterInput): Promise<AdminFacilityResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/facilities", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return normalizeAdminFacilityResult(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}
export async function getAdminFacilitiesSummary(token: string): Promise<AdminFacilitiesSummary | null> {
  try {
    const payload = await fetchAdminJson("/admin/facilities/summary", token);
    if (!isRecord(payload)) {
      return null;
    }

    return {
      total: numberValue(payload.total) ?? 0,
      active: numberValue(payload.active) ?? 0,
      suspended: numberValue(payload.suspended) ?? 0,
      inactive: numberValue(payload.inactive) ?? 0,
    };
  } catch {
    return null;
  }
}

export async function updateAdminFacilityStatus(token: string, facilityId: string, action: AdminFacilityStatusAction): Promise<AdminFacilityStatusResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/facilities/" + encodeURIComponent(facilityId) + "/status", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return normalizeAdminFacilityStatusResult(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function getAdminFacilityDetail(token: string, facilityId: string): Promise<AdminFacilityDetail | null> {
  try {
    const payload = await fetchAdminJson("/admin/facilities/" + encodeURIComponent(facilityId), token);
    return normalizeAdminFacilityDetail(payload);
  } catch {
    return null;
  }
}

export async function getAdminFacilitiesList(token: string, query: { page?: string; pageSize?: string; search?: string; status?: string; dateFrom?: string; dateTo?: string }): Promise<AdminFacilitiesList | null> {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value);
      }
    }

    const suffix = params.toString() ? "?" + params.toString() : "";
    const payload = await fetchAdminJson("/admin/facilities" + suffix, token);
    if (!isRecord(payload)) {
      return null;
    }

    const rows = Array.isArray(payload.items) ? payload.items.map(normalizeAdminFacilityRow).filter((row): row is AdminFacilityRow => row !== null) : [];

    return {
      page: numberValue(payload.page) ?? 1,
      pageSize: numberValue(payload.pageSize) ?? rows.length,
      totalItems: numberValue(payload.totalItems) ?? rows.length,
      totalPages: numberValue(payload.totalPages) ?? 1,
      items: rows,
    };
  } catch {
    return null;
  }
}
function adminUserStatusValue(value: unknown): AdminUserStatus {
  return value === "active" || value === "suspended" || value === "locked" || value === "pending" ? value : "pending";
}

function normalizeAdminUserRow(value: unknown): AdminUserRow | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const fullName = stringValue(value.fullName);
  const email = stringValue(value.email);
  const dateJoined = stringValue(value.dateJoined);
  const lastActivityLabel = stringValue(value.lastActivityLabel);
  if (!id || !fullName || !email || !dateJoined || !lastActivityLabel) {
    return null;
  }

  return {
    id,
    fullName,
    email,
    status: adminUserStatusValue(value.status),
    plan: stringValue(value.plan) ?? "FREE",
    dateJoined,
    lastActivityLabel,
    allowedActions: stringArrayValue(value.allowedActions),
  };
}

function normalizeAdminUserDetail(value: unknown): AdminUserDetail | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.userId);
  const initials = stringValue(value.initials);
  const fullName = stringValue(value.fullName);
  const email = stringValue(value.email);
  const dateJoined = stringValue(value.dateJoined);
  const lastLoginLabel = stringValue(value.lastLoginLabel);
  if (!id || !initials || !fullName || !email || !dateJoined || !lastLoginLabel) {
    return null;
  }

  return {
    id,
    initials,
    avatarUrl: stringValue(value.avatarUrl) ?? "",
    fullName,
    status: adminUserStatusValue(value.status),
    plan: stringValue(value.plan) ?? "FREE",
    email,
    phoneNumber: nullableStringValue(value.phoneNumber),
    tracmedyPatientId: nullableStringValue(value.tracmedyPatientId),
    lastPaymentDate: nullableStringValue(value.lastPaymentDate),
    nextBillingDate: nullableStringValue(value.nextBillingDate),
    billingCycle: nullableStringValue(value.billingCycle),
    dateJoined,
    lastLoginAt: nullableStringValue(value.lastLoginAt),
    lastLoginLabel,
    allowedActions: stringArrayValue(value.allowedActions),
  };
}

function normalizeAdminUserStatusResult(value: unknown): AdminUserStatusResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  if (!id) {
    return null;
  }

  return { id, status: adminUserStatusValue(value.status) };
}

export async function getAdminUsersList(token: string, query: { page?: string; pageSize?: string; search?: string; status?: string; dateFrom?: string; dateTo?: string }): Promise<AdminUsersList | null> {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value);
      }
    }

    const suffix = params.toString() ? "?" + params.toString() : "";
    const payload = await fetchAdminJson("/admin/users" + suffix, token);
    if (!isRecord(payload)) {
      return null;
    }

    const rows = Array.isArray(payload.items) ? payload.items.map(normalizeAdminUserRow).filter((row): row is AdminUserRow => row !== null) : [];

    return {
      page: numberValue(payload.page) ?? 1,
      pageSize: numberValue(payload.pageSize) ?? rows.length,
      totalItems: numberValue(payload.totalItems) ?? rows.length,
      totalPages: numberValue(payload.totalPages) ?? 1,
      items: rows,
    };
  } catch {
    return null;
  }
}

export async function getAdminUserDetail(token: string, userId: string): Promise<AdminUserDetail | null> {
  try {
    const payload = await fetchAdminJson("/admin/users/" + encodeURIComponent(userId), token);
    return normalizeAdminUserDetail(payload);
  } catch {
    return null;
  }
}

export async function updateAdminUserStatus(token: string, userId: string, action: AdminUserStatusAction): Promise<AdminUserStatusResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/users/" + encodeURIComponent(userId) + "/status", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return normalizeAdminUserStatusResult(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}
