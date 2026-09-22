import { backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export type AdminClinicalSummaryCard = {
  value: number;
  trendPercent: number | null;
  deltaLabel: string | null;
  status: string | null;
  state: string | null;
};

export type AdminClinicalActivityPoint = {
  label: string;
  users: number;
  facilities: number;
  revenue: number;
};

export type AdminClinicalDistributionItem = {
  key: string;
  count: number;
  percentage: number;
};

export type AdminClinicalModuleHealth = {
  module: string;
  label: string;
  successRate: number | null;
  uptimePercent: number | null;
  status: string;
  lastIncidentAt: string | null;
};

export type AdminClinicalTopFacility = {
  rank: number;
  facilityId: string;
  name: string;
  activePatients: number;
  efficiencyTrendPercent: number | null;
};

export type AdminClinicalRecentActivity = {
  id: string;
  eventCode: string | null;
  type: string;
  label: string;
  subjectId: string | null;
  subjectType: string | null;
  timestamp: string;
  severity: string;
};

export type AdminClinicalMonitoringOverview = {
  hasData: boolean;
  range: string | null;
  summary: {
    totalUsers: AdminClinicalSummaryCard;
    facilities: AdminClinicalSummaryCard;
    subscribers: AdminClinicalSummaryCard;
    revenueMtd: AdminClinicalSummaryCard;
  };
  activitySeries: {
    metric: string;
    points: AdminClinicalActivityPoint[];
  };
  userDistribution: {
    total: number;
    byRole: AdminClinicalDistributionItem[];
  };
  moduleHealth: AdminClinicalModuleHealth[];
  topFacilities: AdminClinicalTopFacility[];
  recentActivity: AdminClinicalRecentActivity[];
};

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function nullableStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeSummaryCard(value: unknown): AdminClinicalSummaryCard {
  const source = isRecord(value) ? value : {};
  return {
    value: numberValue(source.value) ?? 0,
    trendPercent: numberValue(source.trendPercent) ?? null,
    deltaLabel: nullableStringValue(source.deltaLabel),
    status: nullableStringValue(source.status),
    state: stringValue(source.state) ?? null,
  };
}

function normalizeActivityPoint(value: unknown): AdminClinicalActivityPoint | null {
  if (!isRecord(value)) {
    return null;
  }

  const label = stringValue(value.label);
  if (!label) {
    return null;
  }

  return {
    label,
    users: numberValue(value.users) ?? 0,
    facilities: numberValue(value.facilities) ?? 0,
    revenue: numberValue(value.revenue) ?? 0,
  };
}

function normalizeDistributionItem(value: unknown): AdminClinicalDistributionItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const key = stringValue(value.key);
  if (!key) {
    return null;
  }

  return {
    key,
    count: numberValue(value.count) ?? 0,
    percentage: numberValue(value.percentage) ?? 0,
  };
}

function normalizeModuleHealth(value: unknown): AdminClinicalModuleHealth | null {
  if (!isRecord(value)) {
    return null;
  }

  const moduleKey = stringValue(value.module);
  const label = stringValue(value.label);
  const status = stringValue(value.status);
  if (!moduleKey || !label || !status) {
    return null;
  }

  return {
    module: moduleKey,
    label,
    successRate: numberValue(value.successRate) ?? null,
    uptimePercent: numberValue(value.uptimePercent) ?? null,
    status,
    lastIncidentAt: nullableStringValue(value.lastIncidentAt),
  };
}

function normalizeTopFacility(value: unknown): AdminClinicalTopFacility | null {
  if (!isRecord(value)) {
    return null;
  }

  const facilityId = stringValue(value.facilityId);
  const name = stringValue(value.name);
  if (!facilityId || !name) {
    return null;
  }

  return {
    rank: numberValue(value.rank) ?? 0,
    facilityId,
    name,
    activePatients: numberValue(value.activePatients) ?? 0,
    efficiencyTrendPercent: numberValue(value.efficiencyTrendPercent) ?? null,
  };
}

function normalizeRecentActivity(value: unknown): AdminClinicalRecentActivity | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = stringValue(value.id);
  const type = stringValue(value.type);
  const label = stringValue(value.label);
  const timestamp = stringValue(value.timestamp);
  if (!id || !type || !label || !timestamp) {
    return null;
  }

  return {
    id,
    eventCode: nullableStringValue(value.eventCode),
    type,
    label,
    subjectId: nullableStringValue(value.subjectId),
    subjectType: nullableStringValue(value.subjectType),
    timestamp,
    severity: stringValue(value.severity) ?? "info",
  };
}

function normalizeOverview(value: unknown): AdminClinicalMonitoringOverview | null {
  if (!isRecord(value)) {
    return null;
  }

  const summary = isRecord(value.summary) ? value.summary : {};
  const activitySeries = isRecord(value.activitySeries) ? value.activitySeries : {};
  const distribution = isRecord(value.userDistribution) ? value.userDistribution : {};

  return {
    hasData: value.hasData === true,
    range: nullableStringValue(value.range),
    summary: {
      totalUsers: normalizeSummaryCard(summary.totalUsers),
      facilities: normalizeSummaryCard(summary.facilities),
      subscribers: normalizeSummaryCard(summary.subscribers),
      revenueMtd: normalizeSummaryCard(summary.revenueMtd),
    },
    activitySeries: {
      metric: stringValue(activitySeries.metric) ?? "user_growth",
      points: Array.isArray(activitySeries.points) ? activitySeries.points.map(normalizeActivityPoint).filter((point): point is AdminClinicalActivityPoint => point !== null) : [],
    },
    userDistribution: {
      total: numberValue(distribution.total) ?? 0,
      byRole: Array.isArray(distribution.byRole) ? distribution.byRole.map(normalizeDistributionItem).filter((item): item is AdminClinicalDistributionItem => item !== null) : [],
    },
    moduleHealth: Array.isArray(value.moduleHealth) ? value.moduleHealth.map(normalizeModuleHealth).filter((item): item is AdminClinicalModuleHealth => item !== null) : [],
    topFacilities: Array.isArray(value.topFacilities) ? value.topFacilities.map(normalizeTopFacility).filter((item): item is AdminClinicalTopFacility => item !== null) : [],
    recentActivity: Array.isArray(value.recentActivity) ? value.recentActivity.map(normalizeRecentActivity).filter((item): item is AdminClinicalRecentActivity => item !== null) : [],
  };
}

export async function getAdminClinicalMonitoringOverview(token: string, query: { range?: string; metric?: string }): Promise<AdminClinicalMonitoringOverview | null> {
  try {
    const params = new URLSearchParams();
    if (query.range) {
      params.set("range", query.range);
    }
    if (query.metric) {
      params.set("metric", query.metric);
    }

    const suffix = params.toString() ? "?" + params.toString() : "";
    const response = await fetch(backendUrl() + "/admin/dashboard/overview" + suffix, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return normalizeOverview(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}