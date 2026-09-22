import { backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export type AdminAiOverview = {
  totalProviders: number;
  enabledProviders: number;
  healthyProviders: number;
  totalServices: number;
  enabledServices: number;
  totalRuns: number;
  failedRuns: number;
  safeUnavailableRuns: number;
  avgLatencyMs: number;
  configured: boolean;
};

export type AdminAiProvider = {
  id: string;
  name: string;
  slug: string;
  connectionName: string;
  type: string;
  environment: string;
  enabled: boolean;
  status: string;
  models: string[];
  requestCount: number;
  failedCount: number;
  avgLatencyMs: number;
  references: number;
  lastHealthCheckAt: string | null;
  connectedAt: string | null;
};

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringArrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeOverview(value: unknown): AdminAiOverview | null {
  if (!isRecord(value)) return null;
  return {
    totalProviders: numberValue(value.totalProviders),
    enabledProviders: numberValue(value.enabledProviders),
    healthyProviders: numberValue(value.healthyProviders),
    totalServices: numberValue(value.totalServices),
    enabledServices: numberValue(value.enabledServices),
    totalRuns: numberValue(value.totalRuns),
    failedRuns: numberValue(value.failedRuns),
    safeUnavailableRuns: numberValue(value.safeUnavailableRuns),
    avgLatencyMs: numberValue(value.avgLatencyMs),
    configured: value.configured === true,
  };
}

function normalizeProvider(value: unknown): AdminAiProvider | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const name = stringValue(value.name);
  const slug = stringValue(value.slug);
  const connectionName = stringValue(value.connectionName);
  const type = stringValue(value.type);
  const environment = stringValue(value.environment);
  if (!id || !name || !slug || !connectionName || !type || !environment) return null;
  return {
    id,
    name,
    slug,
    connectionName,
    type,
    environment,
    enabled: value.enabled === true,
    status: stringValue(value.status) ?? "not_connected",
    models: stringArrayValue(value.models),
    requestCount: numberValue(value.requestCount),
    failedCount: numberValue(value.failedCount),
    avgLatencyMs: numberValue(value.avgLatencyMs),
    references: numberValue(value.references),
    lastHealthCheckAt: stringValue(value.lastHealthCheckAt),
    connectedAt: stringValue(value.connectedAt),
  };
}

export async function getAdminAiOverview(token: string): Promise<AdminAiOverview | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/overview", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizeOverview(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function getAdminAiProviders(token: string): Promise<AdminAiProvider[] | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/providers", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!Array.isArray(payload)) return null;
    return payload.map(normalizeProvider).filter((provider): provider is AdminAiProvider => provider !== null);
  } catch {
    return null;
  }
}

export type AdminAiProviderCreateInput = {
  name: string;
  slug: string;
  connectionName: string;
  type: "openai" | "anthropic" | "nvidia_nim" | "openrouter";
  credential: string;
  models?: string[];
};

export async function getAdminAiProvider(token: string, providerId: string): Promise<AdminAiProvider | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/providers/" + encodeURIComponent(providerId), { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizeProvider(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function createAdminAiProvider(token: string, input: AdminAiProviderCreateInput): Promise<AdminAiProvider | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/providers", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return normalizeProvider(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}
export type AdminAiProviderUpdateInput = {
  name?: string;
  connectionName?: string;
  environment?: "production" | "staging" | "test";
  credential?: string;
  models?: string[];
};

export async function updateAdminAiProvider(token: string, providerId: string, input: AdminAiProviderUpdateInput): Promise<AdminAiProvider | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/providers/" + encodeURIComponent(providerId), {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return normalizeProvider(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function deleteAdminAiProvider(token: string, providerId: string): Promise<string | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/providers/" + encodeURIComponent(providerId), {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return isRecord(payload) && typeof payload.message === "string" ? payload.message : "AI provider removed";
  } catch {
    return null;
  }
}
export type AdminAiProviderTestResult = {
  status: string;
  latencyMs: number;
  message: string;
  model: string | null;
};

export type AdminAiServiceConfig = {
  moduleKey: string;
  moduleLabel: string;
  surface: string;
  enabled: boolean;
  primaryProviderId: string | null;
  primaryProviderName: string | null;
  primaryModel: string | null;
  fallbackProviderId: string | null;
  fallbackProviderName: string | null;
  fallbackModel: string | null;
};

function normalizeProviderTest(value: unknown): AdminAiProviderTestResult | null {
  if (!isRecord(value)) return null;
  const status = stringValue(value.status);
  const message = stringValue(value.message);
  if (!status || !message) return null;
  return { status, latencyMs: numberValue(value.latencyMs), message, model: stringValue(value.model) };
}

function normalizeService(value: unknown): AdminAiServiceConfig | null {
  if (!isRecord(value)) return null;
  const moduleKey = stringValue(value.moduleKey);
  const moduleLabel = stringValue(value.moduleLabel);
  const surface = stringValue(value.surface);
  if (!moduleKey || !moduleLabel || !surface) return null;
  return {
    moduleKey,
    moduleLabel,
    surface,
    enabled: value.enabled === true,
    primaryProviderId: stringValue(value.primaryProviderId),
    primaryProviderName: stringValue(value.primaryProviderName),
    primaryModel: stringValue(value.primaryModel),
    fallbackProviderId: stringValue(value.fallbackProviderId),
    fallbackProviderName: stringValue(value.fallbackProviderName),
    fallbackModel: stringValue(value.fallbackModel),
  };
}

export async function testAdminAiProvider(token: string, providerId: string): Promise<AdminAiProviderTestResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/providers/" + encodeURIComponent(providerId) + "/test", { method: "POST", headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizeProviderTest(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function getAdminAiServices(token: string): Promise<AdminAiServiceConfig[] | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/services", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!Array.isArray(payload)) return null;
    return payload.map(normalizeService).filter((service): service is AdminAiServiceConfig => service !== null);
  } catch {
    return null;
  }
}
export type AdminAiServiceUpdateInput = {
  enabled?: boolean;
  primaryProviderId?: string;
  primaryModel?: string;
  fallbackProviderId?: string;
  fallbackModel?: string;
};

export type AdminAiRun = {
  id: string;
  runId: string;
  moduleKey: string;
  surface: string;
  status: string;
  generatedAt: string | null;
  providerName: string | null;
  modelName: string | null;
  latencyMs: number;
  errorMessage: string | null;
  createdAt: string | null;
};

export type AdminAiRunsPage = {
  data: AdminAiRun[];
  total: number;
  page: number;
  limit: number;
};

function normalizeRun(value: unknown): AdminAiRun | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const runId = stringValue(value.runId);
  const moduleKey = stringValue(value.moduleKey);
  const surface = stringValue(value.surface);
  const status = stringValue(value.status);
  if (!id || !runId || !moduleKey || !surface || !status) return null;
  return { id, runId, moduleKey, surface, status, generatedAt: stringValue(value.generatedAt), providerName: stringValue(value.providerName), modelName: stringValue(value.modelName), latencyMs: numberValue(value.latencyMs), errorMessage: stringValue(value.errorMessage), createdAt: stringValue(value.createdAt) };
}

function normalizeRuns(value: unknown): AdminAiRunsPage | null {
  if (!isRecord(value) || !Array.isArray(value.data)) return null;
  return { data: value.data.map(normalizeRun).filter((run): run is AdminAiRun => run !== null), total: numberValue(value.total), page: numberValue(value.page) || 1, limit: numberValue(value.limit) || 20 };
}

export async function updateAdminAiService(token: string, moduleKey: string, input: AdminAiServiceUpdateInput): Promise<AdminAiServiceConfig | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/services/" + encodeURIComponent(moduleKey), { method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
    if (!response.ok) return null;
    return normalizeService(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function getAdminAiRuns(token: string): Promise<AdminAiRunsPage | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/runs?limit=20", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizeRuns(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}
export type AdminAiActivity = {
  id: string;
  service: string;
  status: string;
  requestedModel: string | null;
  actualModel: string | null;
  provider: string | null;
  latencyMs: number;
  failureReason: string | null;
  createdAt: string | null;
};

export type AdminAiActivityPage = {
  data: AdminAiActivity[];
  total: number;
  page: number;
  limit: number;
};

function normalizeActivity(value: unknown): AdminAiActivity | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const service = stringValue(value.service);
  const status = stringValue(value.status);
  if (!id || !service || !status) return null;
  return { id, service, status, requestedModel: stringValue(value.requestedModel), actualModel: stringValue(value.actualModel), provider: stringValue(value.provider), latencyMs: numberValue(value.latencyMs), failureReason: stringValue(value.failureReason), createdAt: stringValue(value.createdAt) };
}

function normalizeActivityPage(value: unknown): AdminAiActivityPage | null {
  if (!isRecord(value) || !Array.isArray(value.data)) return null;
  return { data: value.data.map(normalizeActivity).filter((item): item is AdminAiActivity => item !== null), total: numberValue(value.total), page: numberValue(value.page) || 1, limit: numberValue(value.limit) || 20 };
}

export async function getAdminAiRun(token: string, runId: string): Promise<AdminAiRun | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/runs/" + encodeURIComponent(runId), { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizeRun(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}

export async function getAdminAiActivity(token: string): Promise<AdminAiActivityPage | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/ai/activity?limit=20", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    return normalizeActivityPage(envelopeData(await readJson(response)));
  } catch {
    return null;
  }
}