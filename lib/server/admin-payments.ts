import { backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export type AdminPaymentSummaryCard = {
  value: number;
  trendPercent: number | null;
  status: string | null;
  state: string | null;
};

export type AdminPlanBenefits = {
  aiDailyMessages?: number;
  caregiverLimit?: number;
  storageBytes?: number;
  exportTier?: "basic" | "professional";
  trendHistoryDays?: number | null;
  features?: string[];
};

export type AdminSubscriptionPlan = {
  id: string;
  name: string;
  tier: string;
  audience: string;
  priceLabel: string;
  status: string;
  subscribers: number | null;
  revenueLabel: string;
  features: string[];
  code?: string;
  priceKobo?: number;
  billingCadence?: "MONTHLY" | "YEARLY" | string;
  version?: number;
  revenueKobo?: number;
  benefits?: AdminPlanBenefits | null;
  effectiveAt?: string;
  archivedAt?: string | null;
};

export type AdminPaymentsOverview = {
  hasData: boolean;
  subscriberCount: number;
  revenueMtd: AdminPaymentSummaryCard;
  paymentModuleStatus: string;
  plans: AdminSubscriptionPlan[];
};

export type FacilityPlanSummary = {
  plan: "starter" | "professional" | "enterprise";
  label: string;
  facilities: number;
  monthlyFeeLabel?: string;
};

export type FacilityPlanFacility = {
  id: string;
  name: string;
  tracId: string;
  plan: "starter" | "professional" | "enterprise";
};

export type FacilityBillingHistoryEntry = {
  id: string;
  invoiceCode: string | null;
  amountKobo: number;
  status: string;
  dueAt?: string | null;
  paidAt?: string | null;
  description?: string | null;
};

export type FacilityPlanResponse = {
  facility: FacilityPlanFacility;
  billingHistory: FacilityBillingHistoryEntry[];
};

export type AdminTransaction = {
  id: string;
  gatewayReference: string;
  amountKobo: number;
  currency: string;
  status: string;
  gateway: string;
  kind: string;
  sourceId?: string | null;
  sourceType?: string | null;
  patientId?: string | null;
  facilityId?: string | null;
  createdAt: string;
};

export type AdminTransactionDetail = AdminTransaction & {
  payerTier?: string | null;
  verifiedAgainstGateway?: boolean;
  lastVerifiedAt?: string | null;
};

export type AdminTransactionsPage = {
  items: AdminTransaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type VerifyTransactionResult = {
  result: "verified" | "refused";
  refusals?: { code: string; message: string }[];
  gateway?: {
    status: string;
    reference: string;
    amountKobo: number;
    currency: string;
    paidAt: string | null;
    gatewayResponse: string | null;
  } | null;
  ledger?: AdminTransactionDetail | null;
  alreadyVerified?: boolean;
};

export type AdminOverdueInvoice = {
  id: string;
  invoiceCode: string | null;
  payerType: string;
  payerId: string;
  payerName?: string | null;
  amountKobo: number;
  balanceKobo: number;
  status: string;
  dueAt: string;
  paidAt?: string | null;
  description?: string | null;
  daysOverdue: number;
};

export type AdminOverduePage = {
  items: AdminOverdueInvoice[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type OverdueActionResult = {
  message: string;
  invoiceId: string;
  status: string;
  recipient?: string | null;
  channel?: string | null;
  delivery?: string | null;
};

export type AdminInvoiceView = {
  id: string;
  invoiceCode?: string | null;
  payerType: string;
  payerId: string;
  payerName?: string | null;
  amountKobo: number;
  currency: string;
  status: string;
  dueAt: string;
  paidAt?: string | null;
  paystackReference?: string | null;
  description?: string | null;
  createdAt: string;
  relatedTransactions: AdminTransaction[];
};

export type AdminPayout = {
  id: string;
  providerId: string;
  providerName?: string | null;
  providerRole?: string | null;
  grossKobo: number;
  commissionKobo: number;
  adjustmentsKobo: number;
  netKobo: number;
  status: string;
  holdingUntil?: string | null;
  paidAt?: string | null;
  reference?: string | null;
  sourceRequestId?: string | null;
  sourceInvoiceId?: string | null;
  transferReference?: string | null;
  failureReason?: string | null;
  createdAt: string;
};

export type AdminPayoutsPage = {
  items: AdminPayout[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  awaitingCompletion: number;
};

export type PayoutActionResult = {
  code: string;
  message: string;
  transferReference?: string | null;
  ledgerIntentOnly?: boolean;
};

export type RevenueSummary = {
  grossKobo: number;
  processingFeesKobo: number;
  netKobo: number;
  transactionCount: number;
  avgTransactionKobo: number;
  mtdKobo: number;
  mtdGrowthPercent: number | null;
  collectionRatePercent: number;
};

export type RevenueTrendPoint = {
  bucket: string;
  grossKobo: number;
  feesKobo: number;
  netKobo: number;
  count: number;
};

export type RevenueResponse = {
  summary: RevenueSummary;
  distribution: {
    byPlan: Record<string, number>;
    byPayer: { facility: number; patient: number };
  };
  trend: RevenueTrendPoint[];
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

function normalizeCard(value: unknown): AdminPaymentSummaryCard {
  const source = isRecord(value) ? value : {};
  return {
    value: numberValue(source.value) ?? 0,
    trendPercent: numberValue(source.trendPercent) ?? null,
    status: nullableStringValue(source.status),
    state: nullableStringValue(source.state),
  };
}

function paymentModuleStatus(value: unknown): string {
  if (!Array.isArray(value)) {
    return "not_configured";
  }

  const paymentModule = value.filter(isRecord).find((item) => item.module === "payments");
  return stringValue(paymentModule?.status) ?? "not_configured";
}

function normalizePlan(item: unknown): AdminSubscriptionPlan | null {
  if (!isRecord(item)) return null;
  const id = stringValue(item.id);
  const name = stringValue(item.name);
  if (!id || !name) return null;

  const features = Array.isArray(item.features)
    ? item.features.filter((f): f is string => typeof f === "string")
    : [];

  return {
    id,
    code: stringValue(item.code) ?? id,
    name,
    tier: stringValue(item.tier) ?? "PLUS",
    audience: stringValue(item.audience) ?? "patients",
    priceLabel: stringValue(item.priceLabel) ?? "--",
    priceKobo: numberValue(item.priceKobo) ?? 0,
    billingCadence: stringValue(item.billingCadence),
    version: numberValue(item.version),
    status: (stringValue(item.status) ?? "active").toLowerCase(),
    subscribers: numberValue(item.subscribers) ?? null,
    revenueLabel: stringValue(item.revenueLabel) ?? "--",
    revenueKobo: numberValue(item.revenueKobo),
    benefits: isRecord(item.benefits) ? (item.benefits as AdminPlanBenefits) : null,
    features,
    effectiveAt: stringValue(item.effectiveAt),
    archivedAt: nullableStringValue(item.archivedAt),
  };
}

function fallbackPlans(subscriberCount: number, revenueState: string | null): AdminSubscriptionPlan[] {
  const configured = revenueState !== "not_configured";
  return [
    {
      id: "starter",
      code: "starter",
      name: "Tracmedy Starter",
      tier: "starter",
      audience: "Small facilities",
      priceLabel: configured ? "Configured" : "Not configured",
      status: configured ? "active" : "not_configured",
      subscribers: null,
      revenueLabel: "--",
      features: ["Facility profile", "Connected patient baseline", "Care coordination access"],
    },
    {
      id: "professional",
      code: "professional",
      name: "Tracmedy Plus",
      tier: "professional",
      audience: "Growing clinical teams",
      priceLabel: configured ? "Configured" : "Not configured",
      status: configured ? "active" : "not_configured",
      subscribers: subscriberCount,
      revenueLabel: "--",
      features: ["Advanced patient monitoring", "Care team collaboration", "Priority support"],
    },
    {
      id: "enterprise",
      code: "enterprise",
      name: "Tracmedy Enterprise",
      tier: "enterprise",
      audience: "Hospital networks",
      priceLabel: configured ? "Configured" : "Not configured",
      status: configured ? "active" : "not_configured",
      subscribers: null,
      revenueLabel: "--",
      features: ["Multi-facility management", "Custom reporting", "Dedicated operations support"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 14B API Client Functions
// ---------------------------------------------------------------------------

export async function getAdminPlans(token: string): Promise<AdminSubscriptionPlan[] | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/plans", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !Array.isArray(payload.plans)) return null;

    const list = payload.plans.map(normalizePlan).filter((p): p is AdminSubscriptionPlan => p !== null);
    return list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

export async function updateAdminPlan(
  token: string,
  id: string,
  dto: { name?: string; priceKobo?: number; billingCadence?: "MONTHLY" | "YEARLY"; benefits?: AdminPlanBenefits | null }
): Promise<AdminSubscriptionPlan | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/plans/" + encodeURIComponent(id), {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return normalizePlan(payload);
  } catch {
    return null;
  }
}

export async function deactivateAdminPlan(token: string, id: string): Promise<AdminSubscriptionPlan | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/plans/" + encodeURIComponent(id) + "/deactivate", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return normalizePlan(payload);
  } catch {
    return null;
  }
}

export async function activateAdminPlan(token: string, id: string): Promise<AdminSubscriptionPlan | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/plans/" + encodeURIComponent(id) + "/activate", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return normalizePlan(payload);
  } catch {
    return null;
  }
}

export async function getFacilityPlans(token: string): Promise<FacilityPlanSummary[] | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/plans/facility", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !Array.isArray(payload.plans)) return null;

    return payload.plans.map((p) => {
      const item = isRecord(p) ? p : {};
      return {
        plan: (stringValue(item.plan) ?? "starter") as FacilityPlanSummary["plan"],
        label: stringValue(item.label) ?? "Starter",
        facilities: numberValue(item.facilities) ?? 0,
        monthlyFeeLabel: stringValue(item.monthlyFeeLabel),
      };
    });
  } catch {
    return null;
  }
}

export async function patchFacilityPlan(
  token: string,
  dto: { facilityId: string; plan: "starter" | "professional" | "enterprise"; note?: string }
): Promise<FacilityPlanResponse | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/plans/facility", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !isRecord(payload.facility)) return null;

    return payload as unknown as FacilityPlanResponse;
  } catch {
    return null;
  }
}

export async function getAdminTransactions(
  token: string,
  query?: { status?: string; dateRange?: string; page?: number; limit?: number }
): Promise<AdminTransactionsPage | null> {
  try {
    const params = new URLSearchParams();
    if (query?.status && query.status !== "all") params.set("status", query.status);
    const range = query?.dateRange?.replace(/d$/, "");
    if (range === "7" || range === "30" || range === "90") params.set("range", range);
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    const response = await fetch(backendUrl() + "/admin/payments/transactions" + (qs ? "?" + qs : ""), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !Array.isArray(payload.items)) return null;

    return {
      items: payload.items.filter(isRecord).map((t) => ({
        id: stringValue(t.id) ?? "",
        gatewayReference: stringValue(t.gatewayReference) ?? "",
        amountKobo: numberValue(t.amountKobo) ?? 0,
        currency: stringValue(t.currency) ?? "NGN",
        status: stringValue(t.status) ?? "INITIALIZED",
        gateway: stringValue(t.gateway) ?? "paystack",
        kind: stringValue(t.kind) ?? "SUBSCRIPTION",
        sourceId: nullableStringValue(t.sourceId),
        sourceType: nullableStringValue(t.sourceType),
        patientId: nullableStringValue(t.patientId),
        facilityId: nullableStringValue(t.facilityId),
        createdAt: stringValue(t.createdAt) ?? new Date().toISOString(),
      })),
      total: numberValue(payload.total) ?? 0,
      page: numberValue(payload.page) ?? 1,
      limit: numberValue(payload.limit) ?? 20,
      pages: numberValue(payload.pages) ?? 1,
    };
  } catch {
    return null;
  }
}

export async function getAdminTransaction(token: string, id: string): Promise<AdminTransactionDetail | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/transactions/" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;

    return {
      id: stringValue(payload.id) ?? id,
      gatewayReference: stringValue(payload.gatewayReference) ?? "",
      amountKobo: numberValue(payload.amountKobo) ?? 0,
      currency: stringValue(payload.currency) ?? "NGN",
      status: stringValue(payload.status) ?? "INITIALIZED",
      gateway: stringValue(payload.gateway) ?? "paystack",
      kind: stringValue(payload.kind) ?? "SUBSCRIPTION",
      sourceId: nullableStringValue(payload.sourceId),
      sourceType: nullableStringValue(payload.sourceType),
      patientId: nullableStringValue(payload.patientId),
      facilityId: nullableStringValue(payload.facilityId),
      createdAt: stringValue(payload.createdAt) ?? new Date().toISOString(),
      payerTier: nullableStringValue(payload.payerTier),
      verifiedAgainstGateway: Boolean(payload.verifiedAgainstGateway),
      lastVerifiedAt: nullableStringValue(payload.lastVerifiedAt),
    };
  } catch {
    return null;
  }
}

export async function verifyAdminTransaction(
  token: string,
  id: string,
  notes?: string
): Promise<VerifyTransactionResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/transactions/" + encodeURIComponent(id) + "/verify", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notes ? { notes } : {}),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;

    return payload as unknown as VerifyTransactionResult;
  } catch {
    return null;
  }
}

export async function getAdminOverdueInvoices(
  token: string,
  query?: { page?: number; limit?: number }
): Promise<AdminOverduePage | null> {
  try {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    const response = await fetch(backendUrl() + "/admin/payments/overdue" + (qs ? "?" + qs : ""), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !Array.isArray(payload.items)) return null;

    return {
      items: payload.items.filter(isRecord).map((inv) => ({
        id: stringValue(inv.id) ?? "",
        invoiceCode: nullableStringValue(inv.invoiceCode),
        payerType: stringValue(inv.payerType) ?? "FACILITY",
        payerId: stringValue(inv.payerId) ?? "",
        payerName: nullableStringValue(inv.payerName),
        amountKobo: numberValue(inv.amountKobo) ?? 0,
        balanceKobo: numberValue(inv.balanceKobo) ?? 0,
        status: stringValue(inv.status) ?? "OVERDUE",
        dueAt: stringValue(inv.dueAt) ?? new Date().toISOString(),
        paidAt: nullableStringValue(inv.paidAt),
        description: nullableStringValue(inv.description),
        daysOverdue: numberValue(inv.daysOverdue) ?? 0,
      })),
      total: numberValue(payload.total) ?? 0,
      page: numberValue(payload.page) ?? 1,
      limit: numberValue(payload.limit) ?? 20,
      pages: numberValue(payload.pages) ?? 1,
    };
  } catch {
    return null;
  }
}

export async function sendOverdueReminder(
  token: string,
  invoiceId: string,
  message?: string
): Promise<OverdueActionResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/overdue/" + encodeURIComponent(invoiceId) + "/reminder", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message ? { message } : {}),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    return payload as unknown as OverdueActionResult;
  } catch {
    return null;
  }
}

export async function escalateOverdueInvoice(
  token: string,
  invoiceId: string,
  reason?: string
): Promise<OverdueActionResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/overdue/" + encodeURIComponent(invoiceId) + "/escalate", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reason ? { reason } : {}),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    return payload as unknown as OverdueActionResult;
  } catch {
    return null;
  }
}

export async function getAdminInvoice(token: string, invoiceId: string): Promise<AdminInvoiceView | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/overdue/" + encodeURIComponent(invoiceId) + "/invoice", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    return payload as unknown as AdminInvoiceView;
  } catch {
    return null;
  }
}

export async function getAdminPayouts(
  token: string,
  query?: { status?: string; page?: number; limit?: number }
): Promise<AdminPayoutsPage | null> {
  try {
    const params = new URLSearchParams();
    if (query?.status && query.status !== "all") params.set("status", query.status);
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    const response = await fetch(backendUrl() + "/admin/payments/payouts" + (qs ? "?" + qs : ""), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !Array.isArray(payload.items)) return null;

    return {
      items: payload.items.filter(isRecord).map((p) => ({
        id: stringValue(p.id) ?? "",
        providerId: stringValue(p.providerId) ?? "",
        providerName: nullableStringValue(p.providerName),
        providerRole: nullableStringValue(p.providerRole),
        grossKobo: numberValue(p.grossKobo) ?? 0,
        commissionKobo: numberValue(p.commissionKobo) ?? 0,
        adjustmentsKobo: numberValue(p.adjustmentsKobo) ?? 0,
        netKobo: numberValue(p.netKobo) ?? 0,
        status: stringValue(p.status) ?? "PENDING",
        holdingUntil: nullableStringValue(p.holdingUntil),
        paidAt: nullableStringValue(p.paidAt),
        reference: nullableStringValue(p.reference),
        sourceRequestId: nullableStringValue(p.sourceRequestId),
        sourceInvoiceId: nullableStringValue(p.sourceInvoiceId),
        transferReference: nullableStringValue(p.transferReference),
        failureReason: nullableStringValue(p.failureReason),
        createdAt: stringValue(p.createdAt) ?? new Date().toISOString(),
      })),
      total: numberValue(payload.total) ?? 0,
      page: numberValue(payload.page) ?? 1,
      limit: numberValue(payload.limit) ?? 20,
      pages: numberValue(payload.pages) ?? 1,
      awaitingCompletion: numberValue(payload.awaitingCompletion) ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getAdminPayout(token: string, id: string): Promise<AdminPayout | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/payouts/" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;

    return {
      id: stringValue(payload.id) ?? id,
      providerId: stringValue(payload.providerId) ?? "",
      providerName: nullableStringValue(payload.providerName),
      providerRole: nullableStringValue(payload.providerRole),
      grossKobo: numberValue(payload.grossKobo) ?? 0,
      commissionKobo: numberValue(payload.commissionKobo) ?? 0,
      adjustmentsKobo: numberValue(payload.adjustmentsKobo) ?? 0,
      netKobo: numberValue(payload.netKobo) ?? 0,
      status: stringValue(payload.status) ?? "PENDING",
      holdingUntil: nullableStringValue(payload.holdingUntil),
      paidAt: nullableStringValue(payload.paidAt),
      reference: nullableStringValue(payload.reference),
      sourceRequestId: nullableStringValue(payload.sourceRequestId),
      sourceInvoiceId: nullableStringValue(payload.sourceInvoiceId),
      transferReference: nullableStringValue(payload.transferReference),
      failureReason: nullableStringValue(payload.failureReason),
      createdAt: stringValue(payload.createdAt) ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function confirmAdminPayout(token: string, id: string): Promise<PayoutActionResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/payouts/" + encodeURIComponent(id) + "/confirm", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    return payload as unknown as PayoutActionResult;
  } catch {
    return null;
  }
}

export async function holdAdminPayout(token: string, id: string, reason: string): Promise<PayoutActionResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/payouts/" + encodeURIComponent(id) + "/hold", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    return payload as unknown as PayoutActionResult;
  } catch {
    return null;
  }
}

export async function releaseAdminPayout(token: string, id: string): Promise<PayoutActionResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/payouts/" + encodeURIComponent(id) + "/release", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    return payload as unknown as PayoutActionResult;
  } catch {
    return null;
  }
}

export async function reverseAdminPayout(token: string, id: string, reason: string): Promise<PayoutActionResult | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/payouts/" + encodeURIComponent(id) + "/reverse", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) return null;
    return payload as unknown as PayoutActionResult;
  } catch {
    return null;
  }
}

export async function getAdminRevenue(token: string): Promise<RevenueResponse | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/payments/revenue", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload) || !isRecord(payload.summary)) return null;

    const s = payload.summary as Record<string, unknown>;
    const summary: RevenueSummary = {
      grossKobo: numberValue(s.grossKobo) ?? 0,
      processingFeesKobo: numberValue(s.processingFeesKobo) ?? 0,
      netKobo: numberValue(s.netKobo) ?? 0,
      transactionCount: numberValue(s.transactionCount) ?? 0,
      avgTransactionKobo: numberValue(s.avgTransactionKobo) ?? 0,
      mtdKobo: numberValue(s.mtdKobo) ?? 0,
      mtdGrowthPercent: numberValue(s.mtdGrowthPercent) ?? null,
      collectionRatePercent: numberValue(s.collectionRatePercent) ?? 0,
    };

    const dist = isRecord(payload.distribution) ? payload.distribution : {};
    const byPlan = isRecord(dist.byPlan) ? (dist.byPlan as Record<string, number>) : {};
    const byPayerRecord = isRecord(dist.byPayer) ? dist.byPayer : {};
    const byPayer = {
      facility: numberValue(byPayerRecord.facility) ?? 0,
      patient: numberValue(byPayerRecord.patient) ?? 0,
    };

    const trend = Array.isArray(payload.trend)
      ? payload.trend.filter(isRecord).map((t) => ({
          bucket: stringValue(t.bucket) ?? "",
          grossKobo: numberValue(t.grossKobo) ?? 0,
          feesKobo: numberValue(t.feesKobo) ?? 0,
          netKobo: numberValue(t.netKobo) ?? 0,
          count: numberValue(t.count) ?? 0,
        }))
      : [];

    return { summary, distribution: { byPlan, byPayer }, trend };
  } catch {
    return null;
  }
}

export async function getAdminPaymentsOverview(token: string): Promise<AdminPaymentsOverview | null> {
  try {
    const [overviewRes, livePlans, liveRevenue] = await Promise.all([
      fetch(backendUrl() + "/admin/dashboard/overview", {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
        cache: "no-store",
      }).catch(() => null),
      getAdminPlans(token).catch(() => null),
      getAdminRevenue(token).catch(() => null),
    ]);

    if (!overviewRes || !overviewRes.ok) {
      if (livePlans && livePlans.length > 0) {
        const liveMtd = liveRevenue?.summary ? liveRevenue.summary.mtdKobo / 100 : 0;
        return {
          hasData: true,
          subscriberCount: livePlans.reduce((sum, p) => sum + (p.subscribers ?? 0), 0),
          revenueMtd: {
            value: liveMtd,
            trendPercent: liveRevenue?.summary?.mtdGrowthPercent ?? null,
            status: "active",
            state: "active",
          },
          paymentModuleStatus: "active",
          plans: livePlans,
        };
      }
      return null;
    }

    const payload = envelopeData(await readJson(overviewRes));
    if (!isRecord(payload)) {
      return null;
    }

    const summary = isRecord(payload.summary) ? payload.summary : {};
    const subscribers = normalizeCard(summary.subscribers);
    const revenueMtd = normalizeCard(summary.revenueMtd);

    if (liveRevenue?.summary) {
      revenueMtd.value = liveRevenue.summary.mtdKobo / 100;
      revenueMtd.trendPercent = liveRevenue.summary.mtdGrowthPercent ?? revenueMtd.trendPercent;
      revenueMtd.state = "active";
      revenueMtd.status = "active";
    }

    const plans = (livePlans && livePlans.length > 0)
      ? livePlans
      : fallbackPlans(subscribers.value, revenueMtd.state);

    const subscriberCount = (livePlans && livePlans.length > 0)
      ? livePlans.reduce((sum, p) => sum + (p.subscribers ?? 0), 0)
      : subscribers.value;

    return {
      hasData: payload.hasData === true,
      subscriberCount,
      revenueMtd,
      paymentModuleStatus: paymentModuleStatus(payload.moduleHealth),
      plans,
    };
  } catch {
    return null;
  }
}
