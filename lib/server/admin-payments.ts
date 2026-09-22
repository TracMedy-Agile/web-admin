import { backendUrl, envelopeData, isRecord, readJson } from "@/lib/server/auth-response";

export type AdminPaymentSummaryCard = {
  value: number;
  trendPercent: number | null;
  status: string | null;
  state: string | null;
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
};

export type AdminPaymentsOverview = {
  hasData: boolean;
  subscriberCount: number;
  revenueMtd: AdminPaymentSummaryCard;
  paymentModuleStatus: string;
  plans: AdminSubscriptionPlan[];
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

function plans(subscriberCount: number, revenueState: string | null): AdminSubscriptionPlan[] {
  const configured = revenueState !== "not_configured";
  return [
    {
      id: "starter",
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

export async function getAdminPaymentsOverview(token: string): Promise<AdminPaymentsOverview | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/dashboard/overview", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = envelopeData(await readJson(response));
    if (!isRecord(payload)) {
      return null;
    }

    const summary = isRecord(payload.summary) ? payload.summary : {};
    const subscribers = normalizeCard(summary.subscribers);
    const revenueMtd = normalizeCard(summary.revenueMtd);

    return {
      hasData: payload.hasData === true,
      subscriberCount: subscribers.value,
      revenueMtd,
      paymentModuleStatus: paymentModuleStatus(payload.moduleHealth),
      plans: plans(subscribers.value, revenueMtd.state),
    };
  } catch {
    return null;
  }
}
