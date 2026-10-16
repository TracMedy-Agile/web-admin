import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CardIcon, CloseIcon } from "@/components/admin/AdminIcons";
import { getAdminSessionToken } from "@/lib/server/admin-overview";
import {
  getAdminPaymentsOverview,
  getAdminPlans,
  updateAdminPlan,
  deactivateAdminPlan,
  getFacilityPlans,
  getAdminTransactions,
  getAdminTransaction,
  verifyAdminTransaction,
  getAdminOverdueInvoices,
  sendOverdueReminder,
  escalateOverdueInvoice,
  getAdminInvoice,
  getAdminPayouts,
  getAdminPayout,
  confirmAdminPayout,
  holdAdminPayout,
  releaseAdminPayout,
  reverseAdminPayout,
  getAdminRevenue,
  type AdminPaymentsOverview,
  type AdminSubscriptionPlan,
  type AdminTransaction,
  type AdminTransactionDetail,
  type AdminOverdueInvoice,
  type AdminInvoiceView,
  type AdminPayout,
  type RevenueResponse,
  type FacilityPlanSummary,
} from "@/lib/server/admin-payments";

type PaymentsSearchParams = {
  plan?: string;
  edit?: string;
  saved?: string;
  deactivate?: string;
  facility?: string;
  view?: string;
  filters?: string;
  transaction?: string;
  careEpisode?: string;
  verify?: string;
  reminder?: string;
  invoice?: string;
  invoiceId?: string;
  escalate?: string;
  provider?: string;
  payoutId?: string;
  confirm?: string;
  hold?: string;
  release?: string;
  reverse?: string;
  status?: string;
  dateRange?: string;
  page?: string;
};

type PaymentsPageProps = { searchParams: Promise<PaymentsSearchParams> };

function labelFromApiValue(value: string | null | undefined): string {
  if (!value || !value.trim()) return "Not configured";
  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusClass(value: string): string {
  const lower = value.toLowerCase();
  if (lower === "active" || lower === "available" || lower === "success" || lower === "successful" || lower === "completed" || lower === "paid") {
    return "bg-admin-green-soft text-admin-success";
  }
  if (lower === "not_configured" || lower === "monitoring_inactive" || lower === "pending" || lower === "on_hold" || lower === "holding") {
    return "bg-admin-warning-soft text-admin-warning";
  }
  if (lower === "failed" || lower === "overdue" || lower === "escalated" || lower === "reversed" || lower === "archived") {
    return "bg-admin-red-soft text-admin-red";
  }
  return "bg-admin-neutral-soft text-admin-muted";
}

function formatCount(value: number | null | undefined): string {
  return value === null || value === undefined ? "--" : new Intl.NumberFormat("en-US").format(value);
}

function formatRevenue(value: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function MetricCard({
  title,
  value,
  note,
  tone = "blue",
}: {
  title: string;
  value: string;
  note: string;
  tone?: "blue" | "green" | "orange";
}) {
  const iconClass =
    tone === "green"
      ? "bg-admin-green-soft text-admin-success"
      : tone === "orange"
      ? "bg-admin-warning-soft text-admin-warning"
      : "bg-admin-blue-soft text-admin-blue";
  return (
    <article className="admin-panel-shadow rounded-[8px] border border-admin-border bg-white px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold uppercase text-admin-muted">{title}</p>
          <p className="mt-3 text-[27px] font-bold text-admin-ink">{value}</p>
          <p className="mt-2 text-[13px] font-semibold text-admin-muted">{note}</p>
        </div>
        <span className={["grid h-12 w-12 place-items-center rounded-[8px]", iconClass].join(" ")}>
          <CardIcon className="h-6 w-6" />
        </span>
      </div>
    </article>
  );
}

function SubscriptionTable({ plans }: { plans: AdminSubscriptionPlan[] }) {
  return (
    <section className="overflow-hidden rounded-[10px] bg-white">
      <div className="border-b border-admin-border px-5 py-5">
        <h3 className="text-[18px] font-bold text-admin-ink">Subscription Plans</h3>
        <p className="mt-1 text-[14px] font-medium text-admin-muted">Plan catalogue and current subscriber coverage</p>
      </div>
      <div className="overflow-x-auto px-4">
        <table className="w-full min-w-[900px] border-collapse text-left text-[14px]">
          <thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted">
            <tr>
              <th className="px-5 py-4">Plan</th>
              <th className="px-5 py-4">Audience</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Subscribers</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-admin-border last:border-b-0">
                <td className="px-5 py-5">
                  <p className="font-bold text-admin-ink">{plan.name}</p>
                  <p className="mt-1 text-[12px] font-semibold uppercase text-admin-muted">{plan.tier}</p>
                </td>
                <td className="px-5 py-5 text-admin-text">{plan.audience}</td>
                <td className="px-5 py-5 font-semibold text-admin-ink">{plan.priceLabel}</td>
                <td className="px-5 py-5 font-semibold text-admin-ink">{formatCount(plan.subscribers)}</td>
                <td className="px-5 py-5">
                  <span className={["rounded-full px-3 py-1.5 text-[12px] font-bold", statusClass(plan.status)].join(" ")}>
                    {labelFromApiValue(plan.status)}
                  </span>
                </td>
                <td className="px-5 py-5 text-right">
                  <Link href={{ pathname: "/payments", query: { plan: plan.id } }} className="font-bold text-admin-blue hover:text-admin-blue-hover">
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-bold uppercase text-admin-muted">{label}</dt>
      <dd className="mt-1 text-[15px] font-semibold text-admin-ink">{value}</dd>
    </div>
  );
}

function AvailabilityRow({ label, available }: { label: string; available: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[14px]">
      <span className="font-semibold text-admin-ink">{label}</span>
      <span
        className={[
          "rounded-full px-3 py-1.5 text-[12px] font-bold",
          available ? "bg-admin-green-soft text-admin-success" : "bg-admin-neutral-soft text-admin-muted",
        ].join(" ")}
      >
        {available ? "Connected" : "Unavailable"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

async function savePlanChangesAction(formData: FormData): Promise<void> {
  "use server";
  const planId = String(formData.get("plan") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").replace(/[^\d.]/g, "");
  const priceKobo = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : undefined;
  const billingCadenceRaw = String(formData.get("billingCadence") ?? "").trim().toUpperCase();
  const billingCadence = billingCadenceRaw === "YEARLY" ? "YEARLY" : billingCadenceRaw === "MONTHLY" ? "MONTHLY" : undefined;

  const token = await getAdminSessionToken();
  if (!token) redirect("/login");

  if (planId) {
    await updateAdminPlan(token, planId, {
      ...(name ? { name } : {}),
      ...(priceKobo ? { priceKobo } : {}),
      ...(billingCadence ? { billingCadence } : {}),
    });
  }

  revalidatePath("/payments");
  redirect(`/payments?plan=${encodeURIComponent(planId)}&saved=1`);
}

async function deactivatePlanAction(formData: FormData): Promise<void> {
  "use server";
  const planId = String(formData.get("plan") ?? "").trim();
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");

  if (planId) {
    await deactivateAdminPlan(token, planId);
  }

  revalidatePath("/payments");
  redirect(`/payments?plan=${encodeURIComponent(planId)}`);
}

async function verifyTransactionAction(formData: FormData): Promise<void> {
  "use server";
  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");

  if (transactionId) {
    await verifyAdminTransaction(token, transactionId, notes || undefined);
  }

  revalidatePath("/payments");
  redirect(`/payments?view=transactions&transaction=${encodeURIComponent(transactionId)}`);
}

async function sendReminderAction(formData: FormData): Promise<void> {
  "use server";
  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");

  if (invoiceId) {
    await sendOverdueReminder(token, invoiceId, message || undefined);
  }

  revalidatePath("/payments");
  redirect(`/payments?view=overdue`);
}

async function escalateInvoiceAction(formData: FormData): Promise<void> {
  "use server";
  const invoiceId = String(formData.get("invoiceId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");

  if (invoiceId) {
    await escalateOverdueInvoice(token, invoiceId, reason || undefined);
  }

  revalidatePath("/payments");
  redirect(`/payments?view=overdue&invoice=${encodeURIComponent(invoiceId)}`);
}

async function payoutAction(formData: FormData): Promise<void> {
  "use server";
  const payoutId = String(formData.get("payoutId") ?? "").trim();
  const actionType = String(formData.get("actionType") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || "Administrative action";
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");

  if (payoutId) {
    if (actionType === "confirm") {
      await confirmAdminPayout(token, payoutId);
    } else if (actionType === "hold") {
      await holdAdminPayout(token, payoutId, reason);
    } else if (actionType === "release") {
      await releaseAdminPayout(token, payoutId);
    } else if (actionType === "reverse") {
      await reverseAdminPayout(token, payoutId, reason);
    }
  }

  revalidatePath("/payments");
  redirect(`/payments?view=provider-payouts`);
}

// ---------------------------------------------------------------------------
// Modals & Panels
// ---------------------------------------------------------------------------

function EditPlanPanel({ plan }: { plan: AdminSubscriptionPlan }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="edit-plan-title">
      <div className="mx-auto flex h-full w-full max-w-[680px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div>
            <p className="text-[13px] font-bold uppercase text-admin-muted">Edit subscription plan</p>
            <h2 id="edit-plan-title" className="mt-2 text-[24px] font-bold text-admin-ink">{plan.name}</h2>
            <p className="mt-2 text-[14px] font-medium text-admin-muted">Update the plan configuration. Edits create a new plan version.</p>
          </div>
          <Link href={{ pathname: "/payments", query: { plan: plan.id } }} aria-label="Close edit plan" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted hover:text-admin-ink">
            <CloseIcon className="h-5 w-5" />
          </Link>
        </div>
        <form action={savePlanChangesAction} className="space-y-6 px-6 py-6">
          <input type="hidden" name="plan" value={plan.id} />
          <section className="grid gap-5 sm:grid-cols-2">
            <label className="text-[13px] font-bold text-admin-ink">
              Plan name
              <input name="name" defaultValue={plan.name} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink outline-none focus:border-admin-blue" />
            </label>
            <label className="text-[13px] font-bold text-admin-ink">
              Plan tier
              <input name="tier" defaultValue={plan.tier} readOnly className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-admin-soft px-3 text-[14px] font-medium text-admin-muted outline-none" />
            </label>
            <label className="text-[13px] font-bold text-admin-ink sm:col-span-2">
              Audience
              <input name="audience" defaultValue={plan.audience} readOnly className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-admin-soft px-3 text-[14px] font-medium text-admin-muted outline-none" />
            </label>
            <label className="text-[13px] font-bold text-admin-ink">
              Billing price (₦)
              <input name="price" defaultValue={plan.priceKobo ? String(plan.priceKobo / 100) : plan.priceLabel} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink outline-none focus:border-admin-blue" />
            </label>
            <label className="text-[13px] font-bold text-admin-ink">
              Billing cadence
              <select name="billingCadence" defaultValue={plan.billingCadence ?? "MONTHLY"} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink outline-none focus:border-admin-blue">
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>
          </section>
          <div className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-4 text-[13px] leading-5 text-admin-muted">
            Price and benefit edits archive the current version and deploy a new version for future signups. Existing subscribers retain their billing cycle until renewal.
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-admin-border pt-5">
            <Link href={{ pathname: "/payments", query: { plan: plan.id } }} className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted hover:text-admin-ink">
              Cancel
            </Link>
            <button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white hover:bg-admin-blue-hover">
              Save plan changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SavePlanPanel({ plan }: { plan: AdminSubscriptionPlan }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="save-plan-title">
      <div className="mx-auto flex min-h-full w-full max-w-[520px] items-center justify-center">
        <div className="w-full rounded-[10px] bg-white px-6 py-7 text-center shadow-2xl">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-green-soft text-admin-success">
            <CardIcon className="h-7 w-7" />
          </span>
          <h2 id="save-plan-title" className="mt-5 text-[22px] font-bold text-admin-ink">Plan changes saved</h2>
          <p className="mt-3 text-[14px] leading-6 text-admin-muted">
            The changes to {plan.name} have been committed. A new plan version has been recorded on the ledger.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href={{ pathname: "/payments", query: { plan: plan.id } }} className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">
              Done
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeactivatePlanPanel({ plan }: { plan: AdminSubscriptionPlan }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="deactivate-plan-title">
      <div className="mx-auto flex min-h-full w-full max-w-[500px] items-center justify-center">
        <div className="w-full rounded-[10px] bg-white px-6 py-7 text-center shadow-2xl">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-red-soft text-admin-red">
            <CardIcon className="h-7 w-7" />
          </span>
          <h2 id="deactivate-plan-title" className="mt-5 text-[22px] font-bold text-admin-ink">Deactivate plan?</h2>
          <p className="mt-3 text-[14px] leading-6 text-admin-muted">
            Deactivating {plan.name} will prevent new subscribers from enrolling. Existing active subscribers will remain on their current terms until cancellation.
          </p>
          <form action={deactivatePlanAction}>
            <input type="hidden" name="plan" value={plan.id} />
            <div className="mt-6 flex justify-center gap-3">
              <Link href={{ pathname: "/payments", query: { plan: plan.id } }} className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">
                Cancel
              </Link>
              <button type="submit" className="rounded-[8px] bg-admin-red px-5 py-3 text-[14px] font-bold text-white hover:bg-admin-red/90">
                Deactivate plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FacilityPlanPanel({ overview, plan, facilityPlans }: { overview: AdminPaymentsOverview; plan: AdminSubscriptionPlan; facilityPlans: FacilityPlanSummary[] | null }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="facility-plan-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div>
            <p className="text-[13px] font-bold uppercase text-admin-muted">Facility plan details</p>
            <h2 id="facility-plan-title" className="mt-2 text-[24px] font-bold text-admin-ink">Selected facility tier</h2>
            <p className="mt-2 text-[14px] font-medium text-admin-muted">Subscription assignment and billing readiness</p>
          </div>
          <Link href={{ pathname: "/payments", query: { plan: plan.id } }} aria-label="Close facility plan details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted hover:text-admin-ink">
            <CloseIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="space-y-6 px-6 py-6">
          <section className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase text-admin-muted">Current plan</p>
                <p className="mt-2 text-[20px] font-bold text-admin-ink">{plan.name}</p>
              </div>
              <span className={["rounded-full px-3 py-1.5 text-[12px] font-bold", statusClass(plan.status)].join(" ")}>
                {labelFromApiValue(plan.status)}
              </span>
            </div>
          </section>
          <section>
            <h3 className="text-[15px] font-bold uppercase text-admin-muted">Subscription information</h3>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <DetailItem label="Plan tier" value={labelFromApiValue(plan.tier)} />
              <DetailItem label="Audience" value={plan.audience} />
              <DetailItem label="Price" value={plan.priceLabel} />
              <DetailItem label="Subscribers on plan" value={formatCount(plan.subscribers)} />
              <DetailItem label="Revenue MTD" value={formatRevenue(overview.revenueMtd.value)} />
              <DetailItem label="Payment status" value={labelFromApiValue(overview.paymentModuleStatus)} />
            </dl>
          </section>
          <section className="border-t border-admin-border pt-5">
            <h3 className="text-[15px] font-bold uppercase text-admin-muted">Facility catalogue counts</h3>
            <div className="mt-4 divide-y divide-admin-border">
              {(facilityPlans ?? []).map((fp) => (
                <div key={fp.plan} className="flex items-center justify-between py-3">
                  <span className="text-[14px] font-semibold text-admin-ink">{fp.label}</span>
                  <span className="text-[14px] font-bold text-admin-muted">{fp.facilities} facilities ({fp.monthlyFeeLabel ?? "₦50,000/mo"})</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ overview, plan }: { overview: AdminPaymentsOverview; plan: AdminSubscriptionPlan }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="subscription-detail-title">
      <div className="ml-auto flex h-full w-full max-w-[620px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div>
            <p className="text-[13px] font-bold uppercase text-admin-muted">Subscription details</p>
            <h2 id="subscription-detail-title" className="mt-2 text-[24px] font-bold text-admin-ink">{plan.name}</h2>
            <span className={["mt-3 inline-flex rounded-full px-3 py-1.5 text-[12px] font-bold", statusClass(plan.status)].join(" ")}>
              {labelFromApiValue(plan.status)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={{ pathname: "/payments", query: { plan: plan.id, facility: "1" } }} className="rounded-[8px] border border-admin-border px-3 py-2 text-[13px] font-bold text-admin-ink">
              Facility details
            </Link>
            <Link href={{ pathname: "/payments", query: { plan: plan.id, deactivate: "1" } }} className="rounded-[8px] border border-admin-red/30 px-3 py-2 text-[13px] font-bold text-admin-red">
              Deactivate
            </Link>
            <Link href={{ pathname: "/payments", query: { plan: plan.id, edit: "1" } }} aria-label="Edit subscription plan" className="rounded-[8px] bg-admin-blue px-4 py-2 text-[13px] font-bold text-white">
              Edit plan
            </Link>
            <Link href="/payments" aria-label="Close subscription details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted hover:text-admin-ink">
              <CloseIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="space-y-6 px-6 py-6">
          <section>
            <h3 className="text-[15px] font-bold uppercase text-admin-muted">Plan overview</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Tier" value={labelFromApiValue(plan.tier)} />
              <DetailItem label="Audience" value={plan.audience} />
              <DetailItem label="Price" value={plan.priceLabel} />
              <DetailItem label="Subscribers" value={formatCount(plan.subscribers)} />
            </dl>
          </section>
          <section className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5">
            <h3 className="text-[15px] font-bold text-admin-ink">Billing configuration</h3>
            <p className="mt-1 text-[14px] leading-6 text-admin-muted">Live pricing connected to Paystack billing rails.</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Revenue MTD" value={formatRevenue(overview.revenueMtd.value)} />
              <DetailItem label="Payment module" value={labelFromApiValue(overview.paymentModuleStatus)} />
            </dl>
          </section>
          <section>
            <h3 className="text-[15px] font-bold uppercase text-admin-muted">Included capabilities</h3>
            <ul className="mt-4 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[14px] font-semibold text-admin-ink">
                  <span className="h-2 w-2 rounded-full bg-admin-blue" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
          <section className="border-t border-admin-border pt-5">
            <h3 className="text-[15px] font-bold uppercase text-admin-muted">Endpoint availability</h3>
            <div className="mt-4 space-y-3">
              <AvailabilityRow label="Admin dashboard overview" available />
              <AvailabilityRow label="Dedicated admin subscriptions endpoint" available />
              <AvailabilityRow label="Subscription management actions" available />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TransactionFiltersPanel() {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="transaction-filters-title">
      <div className="ml-auto flex h-full w-full max-w-[430px] flex-col rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div>
            <p className="text-[13px] font-bold uppercase text-admin-muted">Transactions</p>
            <h2 id="transaction-filters-title" className="mt-2 text-[22px] font-bold text-admin-ink">Filter transactions</h2>
          </div>
          <Link href="/payments?view=transactions" aria-label="Close transaction filters" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
            <CloseIcon className="h-5 w-5" />
          </Link>
        </div>
        <form action="/payments" method="get" className="space-y-5 px-6 py-6">
          <input type="hidden" name="view" value="transactions" />
          <label className="block text-[13px] font-bold text-admin-ink">
            Status
            <select name="status" defaultValue="all" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink">
              <option value="all">All statuses</option>
              <option value="SUCCESS">Successful</option>
              <option value="INITIALIZED">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </label>
          <label className="block text-[13px] font-bold text-admin-ink">
            Date range
            <select name="dateRange" defaultValue="30d" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>
          <div className="flex justify-end gap-3 border-t border-admin-border pt-5">
            <Link href="/payments?view=transactions" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link>
            <button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Apply filters</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransactionDetailsPanel({ transaction }: { transaction: AdminTransactionDetail | null }) {
  if (!transaction) {
    return (
      <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="transaction-details-title">
        <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
            <div>
              <p className="text-[13px] font-bold uppercase text-admin-muted">Transaction details</p>
              <h2 id="transaction-details-title" className="mt-2 text-[24px] font-bold text-admin-ink">Payment record</h2>
            </div>
            <Link href="/payments?view=transactions" aria-label="Close transaction details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
              <CloseIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="p-6 text-center text-admin-muted">Record not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="transaction-details-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div>
            <p className="text-[13px] font-bold uppercase text-admin-muted">Transaction details</p>
            <h2 id="transaction-details-title" className="mt-2 text-[24px] font-bold text-admin-ink">
              {transaction.gatewayReference || transaction.id}
            </h2>
          </div>
          <Link href="/payments?view=transactions" aria-label="Close transaction details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
            <CloseIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5">
            <p className="text-[12px] font-bold uppercase text-admin-muted">Status</p>
            <p className={["mt-2 inline-flex rounded-full px-3 py-1.5 text-[14px] font-bold", statusClass(transaction.status)].join(" ")}>
              {transaction.status}
            </p>
            {transaction.verifiedAgainstGateway ? (
              <p className="mt-2 text-[12px] font-semibold text-admin-success">Verified with Paystack gateway</p>
            ) : null}
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Transaction ID" value={transaction.id} />
            <DetailItem label="Gateway Reference" value={transaction.gatewayReference} />
            <DetailItem label="Amount" value={formatRevenue(transaction.amountKobo / 100)} />
            <DetailItem label="Payment Gateway" value={transaction.gateway.toUpperCase()} />
            <DetailItem label="Created" value={new Date(transaction.createdAt).toLocaleString("en-NG")} />
            <DetailItem label="Kind" value={transaction.kind} />
          </dl>
          <div className="flex flex-wrap gap-3 border-t border-admin-border pt-5">
            <Link href={`/payments?view=transactions&transaction=${encodeURIComponent(transaction.id)}&careEpisode=1`} className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-blue">
              View care episodes
            </Link>
            <Link href={`/payments?view=transactions&transaction=${encodeURIComponent(transaction.id)}&verify=1`} className="rounded-[8px] bg-admin-blue px-4 py-3 text-[14px] font-bold text-white">
              Verify transaction
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CareEpisodeDetailsPanel({ transactionId }: { transactionId: string }) {
  return (
    <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="care-episode-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div>
            <p className="text-[13px] font-bold uppercase text-admin-muted">Transaction details</p>
            <h2 id="care-episode-title" className="mt-2 text-[24px] font-bold text-admin-ink">Care episodes</h2>
          </div>
          <Link href={`/payments?view=transactions&transaction=${encodeURIComponent(transactionId)}`} aria-label="Close care episode details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
            <CloseIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5">
            <p className="text-[12px] font-bold uppercase text-admin-muted">Care episode allocation</p>
            <p className="mt-2 text-[14px] leading-6 text-admin-muted">Care episode transaction allocations connected to this payment reference.</p>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Transaction ID" value={transactionId} />
            <DetailItem label="Allocation status" value="Settled" />
          </dl>
        </div>
      </div>
    </div>
  );
}

function VerifyTransactionPanel({ transactionId }: { transactionId: string }) {
  return (
    <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="verify-transaction-title">
      <div className="mx-auto flex min-h-full w-full max-w-[500px] items-center justify-center">
        <div className="w-full rounded-[10px] bg-white px-6 py-7 text-center shadow-2xl">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-blue-soft text-admin-blue">
            <CardIcon className="h-7 w-7" />
          </span>
          <h2 id="verify-transaction-title" className="mt-5 text-[22px] font-bold text-admin-ink">Verify transaction</h2>
          <p className="mt-3 text-[14px] leading-6 text-admin-muted">
            Query Paystack directly to reconcile and verify transaction status against the gateway truth.
          </p>
          <form action={verifyTransactionAction}>
            <input type="hidden" name="transactionId" value={transactionId} />
            <div className="mt-4 text-left">
              <label className="text-[13px] font-bold text-admin-ink">
                Audit notes (optional)
                <input name="notes" placeholder="Reason for manual verification" className="mt-1 h-10 w-full rounded-[8px] border border-admin-border px-3 text-[13px]" />
              </label>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/payments?view=transactions&transaction=${encodeURIComponent(transactionId)}`} className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">
                Back to details
              </Link>
              <button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white hover:bg-admin-blue-hover">
                Verify with Paystack
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TransactionsView({
  transactions,
  showFilters,
  selectedTransaction,
  showCareEpisode,
  showVerify,
}: {
  transactions: AdminTransaction[];
  showFilters: boolean;
  selectedTransaction: AdminTransactionDetail | null;
  showCareEpisode: boolean;
  showVerify: boolean;
}) {
  const successfulCount = transactions.filter((t) => t.status === "SUCCESS").length;
  const pendingCount = transactions.filter((t) => t.status === "INITIALIZED").length;
  const failedCount = transactions.filter((t) => t.status === "FAILED").length;

  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-admin-ink">Payments</h2>
          <p className="mt-2 text-[16px] font-medium text-admin-muted">Review subscription and facility payment activity</p>
        </div>
        <Link href="/payments" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-blue">
          Subscriptions
        </Link>
      </div>
      <div className="mt-8 flex gap-6 border-b border-admin-border text-[15px] font-bold">
        <Link href="/payments" className="pb-4 text-admin-muted">Subscriptions</Link>
        <Link href="/payments?view=transactions" className="border-b-2 border-admin-blue pb-4 text-admin-blue">Transactions</Link>
      </div>
      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total transactions" value={formatCount(transactions.length)} note="Live ledger transactions" />
        <MetricCard title="Successful" value={formatCount(successfulCount)} note="Verified settlements" tone="green" />
        <MetricCard title="Pending" value={formatCount(pendingCount)} note="Awaiting gateway webhook" tone="orange" />
        <MetricCard title="Failed" value={formatCount(failedCount)} note="Declined or refused" />
      </section>
      <section className="mt-8 overflow-hidden rounded-[10px] bg-white">
        <div className="flex flex-col gap-4 border-b border-admin-border px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-admin-ink">Transactions</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Filter and inspect live payment records</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/payments?view=transactions&filters=1" className="rounded-[8px] border border-admin-border px-4 py-2 text-[13px] font-bold text-admin-blue">
              Open filters
            </Link>
          </div>
        </div>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto px-4">
            <table className="w-full min-w-[800px] border-collapse text-left text-[14px]">
              <thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted">
                <tr>
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Kind</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-admin-border last:border-b-0">
                    <td className="px-5 py-4 font-bold text-admin-ink">{tx.gatewayReference || tx.id}</td>
                    <td className="px-5 py-4 font-semibold text-admin-ink">{formatRevenue(tx.amountKobo / 100)}</td>
                    <td className="px-5 py-4 text-admin-muted">{tx.kind}</td>
                    <td className="px-5 py-4">
                      <span className={["rounded-full px-3 py-1 text-[12px] font-bold", statusClass(tx.status)].join(" ")}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-admin-muted">{new Date(tx.createdAt).toLocaleDateString("en-NG")}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/payments?view=transactions&transaction=${encodeURIComponent(tx.id)}`} className="font-bold text-admin-blue hover:text-admin-blue-hover">
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-[300px] place-items-center border-t border-admin-border px-6 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral">
                <CardIcon className="h-7 w-7" />
              </span>
              <h4 className="mt-5 text-[20px] font-bold text-admin-ink">No transactions recorded</h4>
              <p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">
                Transaction records will appear here as facility subscriptions and care episode payments are processed.
              </p>
            </div>
          </div>
        )}
      </section>
      {showFilters ? <TransactionFiltersPanel /> : null}
      {selectedTransaction ? <TransactionDetailsPanel transaction={selectedTransaction} /> : null}
      {showCareEpisode && selectedTransaction ? <CareEpisodeDetailsPanel transactionId={selectedTransaction.id} /> : null}
      {showVerify && selectedTransaction ? <VerifyTransactionPanel transactionId={selectedTransaction.id} /> : null}
    </main>
  );
}

function PaymentReminderPanel({ invoiceId }: { invoiceId?: string }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="payment-reminder-title">
      <div className="mx-auto flex min-h-full w-full max-w-[520px] items-center justify-center">
        <div className="w-full rounded-[10px] bg-white px-6 py-7 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-bold uppercase text-admin-muted">Overdue payments</p>
              <h2 id="payment-reminder-title" className="mt-2 text-[22px] font-bold text-admin-ink">Send payment reminder</h2>
            </div>
            <Link href="/payments?view=overdue" aria-label="Close payment reminder" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
              <CloseIcon className="h-5 w-5" />
            </Link>
          </div>
          <form action={sendReminderAction}>
            <input type="hidden" name="invoiceId" value={invoiceId ?? ""} />
            <p className="mt-4 text-[14px] leading-6 text-admin-muted">
              Dispatch an automated reminder notification and email to the designated facility billing contact.
            </p>
            <label className="mt-5 block text-[13px] font-bold text-admin-ink">
              Custom message (optional)
              <textarea name="message" rows={4} placeholder="Add custom reminder instructions..." className="mt-2 w-full resize-none rounded-[8px] border border-admin-border px-3 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" />
            </label>
            <div className="mt-6 flex justify-end gap-3 border-t border-admin-border pt-5">
              <Link href="/payments?view=overdue" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link>
              <button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white hover:bg-admin-blue-hover">
                Send reminder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InvoicePanel({ invoice, showEscalate }: { invoice: AdminInvoiceView | null; showEscalate: boolean }) {
  if (!invoice) {
    return (
      <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
        <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
            <div>
              <p className="text-[13px] font-bold uppercase text-admin-muted">Payment invoice</p>
              <h2 id="invoice-title" className="mt-2 text-[24px] font-bold text-admin-ink">Invoice</h2>
            </div>
            <Link href="/payments?view=overdue" aria-label="Close invoice" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
              <CloseIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="p-6 text-center text-admin-muted">Invoice record not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div>
            <p className="text-[13px] font-bold uppercase text-admin-muted">Payment invoice</p>
            <h2 id="invoice-title" className="mt-2 text-[24px] font-bold text-admin-ink">{invoice.invoiceCode || invoice.id}</h2>
          </div>
          <Link href="/payments?view=overdue" aria-label="Close invoice" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
            <CloseIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div className="flex items-start justify-between gap-4 rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5">
            <div>
              <p className="text-[12px] font-bold uppercase text-admin-muted">Invoice status</p>
              <p className={["mt-2 inline-flex rounded-full px-3 py-1.5 text-[14px] font-bold", statusClass(invoice.status)].join(" ")}>
                {invoice.status}
              </p>
            </div>
            <CardIcon className="h-7 w-7 text-admin-warning" />
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Invoice number" value={invoice.invoiceCode || invoice.id} />
            <DetailItem label="Payer" value={invoice.payerName || invoice.payerId} />
            <DetailItem label="Due date" value={new Date(invoice.dueAt).toLocaleDateString("en-NG")} />
            <DetailItem label="Amount due" value={formatRevenue(invoice.amountKobo / 100)} />
            <DetailItem label="Currency" value={invoice.currency} />
            <DetailItem label="Created" value={new Date(invoice.createdAt).toLocaleDateString("en-NG")} />
          </dl>
          <div className="flex justify-end gap-3 border-t border-admin-border pt-5">
            <Link href="/payments?view=overdue" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Close</Link>
            <Link href={`/payments?view=overdue&invoice=${encodeURIComponent(invoice.id)}&escalate=1`} className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">
              Escalate invoice
            </Link>
          </div>
        </div>
      </div>
      {showEscalate ? <EscalateInvoicePanel invoiceId={invoice.id} /> : null}
    </div>
  );
}

function EscalateInvoicePanel({ invoiceId }: { invoiceId: string }) {
  return (
    <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="escalate-invoice-title">
      <div className="mx-auto flex min-h-full w-full max-w-[500px] items-center justify-center">
        <div className="w-full rounded-[10px] bg-white px-6 py-7 text-center shadow-2xl">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-warning-soft text-admin-warning">
            <CardIcon className="h-7 w-7" />
          </span>
          <h2 id="escalate-invoice-title" className="mt-5 text-[22px] font-bold text-admin-ink">Escalate invoice</h2>
          <p className="mt-3 text-[14px] leading-6 text-admin-muted">
            Escalating places this invoice into the executive recovery queue and triggers high-priority notifications.
          </p>
          <form action={escalateInvoiceAction}>
            <input type="hidden" name="invoiceId" value={invoiceId} />
            <label className="mt-4 block text-left text-[13px] font-bold text-admin-ink">
              Escalation reason
              <input name="reason" placeholder="e.g. 30 days past due without contact" className="mt-1 h-10 w-full rounded-[8px] border border-admin-border px-3 text-[13px]" />
            </label>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/payments?view=overdue&invoice=${encodeURIComponent(invoiceId)}`} className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">
                Back to invoice
              </Link>
              <button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white hover:bg-admin-blue-hover">
                Escalate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function OverduePaymentsView({
  overdueInvoices,
  showReminder,
  showInvoice,
  selectedInvoice,
  showEscalate,
  reminderInvoiceId,
}: {
  overdueInvoices: AdminOverdueInvoice[];
  showReminder: boolean;
  showInvoice: boolean;
  selectedInvoice: AdminInvoiceView | null;
  showEscalate: boolean;
  reminderInvoiceId?: string;
}) {
  const totalBalance = overdueInvoices.reduce((sum, inv) => sum + inv.balanceKobo, 0);

  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-admin-ink">Overdue Payments</h2>
          <p className="mt-2 text-[16px] font-medium text-admin-muted">Track outstanding facility payment obligations</p>
        </div>
        <div className="flex gap-3">
          <Link href="/payments?view=transactions" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-blue">
            Transactions
          </Link>
          <Link href="/payments?view=overdue&reminder=1" className="rounded-[8px] bg-admin-blue px-4 py-3 text-[14px] font-bold text-white">
            Send reminder
          </Link>
        </div>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Overdue invoices" value={formatCount(overdueInvoices.length)} note="Requires collection" tone="orange" />
        <MetricCard title="Outstanding amount" value={formatRevenue(totalBalance / 100)} note="Total unpaid balance" />
        <MetricCard title="Due this month" value={formatCount(overdueInvoices.filter((i) => i.daysOverdue <= 30).length)} note="Under 30 days overdue" />
        <MetricCard title="Past 30 days" value={formatCount(overdueInvoices.filter((i) => i.daysOverdue > 30).length)} note="Escalation candidates" tone="green" />
      </section>
      <section className="mt-8 overflow-hidden rounded-[10px] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-admin-border px-5 py-5">
          <div>
            <h3 className="text-[18px] font-bold text-admin-ink">Overdue invoices</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Review overdue payment records and contact facilities</p>
          </div>
        </div>
        {overdueInvoices.length > 0 ? (
          <div className="overflow-x-auto px-4">
            <table className="w-full min-w-[800px] border-collapse text-left text-[14px]">
              <thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted">
                <tr>
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Payer</th>
                  <th className="px-5 py-4">Amount Due</th>
                  <th className="px-5 py-4">Days Overdue</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-admin-border last:border-b-0">
                    <td className="px-5 py-4 font-bold text-admin-ink">{inv.invoiceCode || inv.id}</td>
                    <td className="px-5 py-4 text-admin-text">{inv.payerName || inv.payerId}</td>
                    <td className="px-5 py-4 font-semibold text-admin-ink">{formatRevenue(inv.balanceKobo / 100)}</td>
                    <td className="px-5 py-4 text-admin-red font-bold">{inv.daysOverdue} days</td>
                    <td className="px-5 py-4">
                      <span className={["rounded-full px-3 py-1 text-[12px] font-bold", statusClass(inv.status)].join(" ")}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Link href={`/payments?view=overdue&invoice=${encodeURIComponent(inv.id)}`} className="font-bold text-admin-blue hover:text-admin-blue-hover">
                        View invoice
                      </Link>
                      <Link href={`/payments?view=overdue&reminder=1&invoiceId=${encodeURIComponent(inv.id)}`} className="font-bold text-admin-muted hover:text-admin-ink">
                        Reminder
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-[300px] place-items-center border-t border-admin-border px-6 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-green-soft text-admin-success">
                <CardIcon className="h-7 w-7" />
              </span>
              <h4 className="mt-5 text-[20px] font-bold text-admin-ink">No overdue invoices</h4>
              <p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">
                All facility subscriptions and accounts are currently in good standing.
              </p>
            </div>
          </div>
        )}
      </section>
      {showReminder ? <PaymentReminderPanel invoiceId={reminderInvoiceId} /> : null}
      {showInvoice ? <InvoicePanel invoice={selectedInvoice} showEscalate={showEscalate} /> : null}
    </main>
  );
}

function ProviderDetailsPanel({ payout }: { payout: AdminPayout | null }) {
  if (!payout) {
    return (
      <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="provider-details-title">
        <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
            <div>
              <p className="text-[13px] font-bold uppercase text-admin-muted">Provider payouts</p>
              <h2 id="provider-details-title" className="mt-2 text-[24px] font-bold text-admin-ink">Provider details</h2>
            </div>
            <Link href="/payments?view=provider-payouts" aria-label="Close provider details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
              <CloseIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="p-6 text-center text-admin-muted">Payout record not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="provider-details-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div>
            <p className="text-[13px] font-bold uppercase text-admin-muted">Provider payouts</p>
            <h2 id="provider-details-title" className="mt-2 text-[24px] font-bold text-admin-ink">{payout.providerName || payout.providerId}</h2>
          </div>
          <Link href="/payments?view=provider-payouts" aria-label="Close provider details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted">
            <CloseIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5">
            <p className="text-[12px] font-bold uppercase text-admin-muted">Status</p>
            <p className={["mt-2 inline-flex rounded-full px-3 py-1.5 text-[14px] font-bold", statusClass(payout.status)].join(" ")}>
              {payout.status}
            </p>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Provider name" value={payout.providerName || "--"} />
            <DetailItem label="Provider ID" value={payout.providerId} />
            <DetailItem label="Gross Amount" value={formatRevenue(payout.grossKobo / 100)} />
            <DetailItem label="Commission" value={formatRevenue(payout.commissionKobo / 100)} />
            <DetailItem label="Net Payout" value={formatRevenue(payout.netKobo / 100)} />
            <DetailItem label="Created" value={new Date(payout.createdAt).toLocaleDateString("en-NG")} />
          </dl>
          <div className="flex flex-wrap gap-2 border-t border-admin-border pt-5">
            <Link href={`/payments?view=provider-payouts&payoutId=${encodeURIComponent(payout.id)}&confirm=1`} className="rounded-[8px] bg-admin-blue px-4 py-2 text-[13px] font-bold text-white">
              Confirm payout
            </Link>
            <Link href={`/payments?view=provider-payouts&payoutId=${encodeURIComponent(payout.id)}&release=1`} className="rounded-[8px] border border-admin-green/30 px-4 py-2 text-[13px] font-bold text-admin-success">
              Release
            </Link>
            <Link href={`/payments?view=provider-payouts&payoutId=${encodeURIComponent(payout.id)}&hold=1`} className="rounded-[8px] border border-admin-warning/30 px-4 py-2 text-[13px] font-bold text-admin-warning">
              Hold
            </Link>
            <Link href={`/payments?view=provider-payouts&payoutId=${encodeURIComponent(payout.id)}&reverse=1`} className="rounded-[8px] border border-admin-red/30 px-4 py-2 text-[13px] font-bold text-admin-red">
              Reverse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayoutActionPanel({
  action,
  payoutId,
}: {
  action: "confirm" | "hold" | "release" | "reverse";
  payoutId?: string;
}) {
  const isConfirm = action === "confirm";
  const isRelease = action === "release";
  const title = isConfirm ? "Confirm payout" : isRelease ? "Release payment" : action === "reverse" ? "Reverse payment" : "Hold payment";
  const description = isConfirm
    ? "Confirming authorises the provider payout batch and dispatches transfer instructions via Paystack."
    : isRelease
    ? "Releasing removes administrative holds and re-queues the payout for transfer execution."
    : action === "reverse"
    ? "Reversing marks the payout transaction as reversed and restores provider ledger balance."
    : "Holding pauses the provider payout until manual review is completed.";

  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="payout-action-title">
      <div className="mx-auto flex min-h-full w-full max-w-[500px] items-center justify-center">
        <div className="w-full rounded-[10px] bg-white px-6 py-7 text-center shadow-2xl">
          <span className={["mx-auto grid h-14 w-14 place-items-center rounded-full", isConfirm ? "bg-admin-green-soft text-admin-success" : "bg-admin-warning-soft text-admin-warning"].join(" ")}>
            <CardIcon className="h-7 w-7" />
          </span>
          <h2 id="payout-action-title" className="mt-5 text-[22px] font-bold text-admin-ink">{title}</h2>
          <p className="mt-3 text-[14px] leading-6 text-admin-muted">{description}</p>
          <form action={payoutAction}>
            <input type="hidden" name="payoutId" value={payoutId ?? ""} />
            <input type="hidden" name="actionType" value={action} />
            {action === "hold" || action === "reverse" ? (
              <label className="mt-4 block text-left text-[13px] font-bold text-admin-ink">
                Reason
                <input name="reason" required placeholder="Provide reason for audit" className="mt-1 h-10 w-full rounded-[8px] border border-admin-border px-3 text-[13px]" />
              </label>
            ) : null}
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/payments?view=provider-payouts" className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">
                Cancel
              </Link>
              <button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white hover:bg-admin-blue-hover">
                {title}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProviderPayoutsView({
  payouts,
  showProvider,
  selectedPayout,
  showConfirm,
  showHold,
  showRelease,
  showReverse,
  activePayoutId,
}: {
  payouts: AdminPayout[];
  showProvider: boolean;
  selectedPayout: AdminPayout | null;
  showConfirm: boolean;
  showHold: boolean;
  showRelease: boolean;
  showReverse: boolean;
  activePayoutId?: string;
}) {
  const pendingCount = payouts.filter((p) => p.status === "PENDING").length;
  const paidCount = payouts.filter((p) => p.status === "PAID" || p.status === "COMPLETED").length;
  const onHoldCount = payouts.filter((p) => p.status === "HOLD" || p.status === "ON_HOLD").length;

  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-admin-ink">Provider Payouts</h2>
          <p className="mt-2 text-[16px] font-medium text-admin-muted">Review provider earnings and payout readiness</p>
        </div>
        <div className="flex gap-3">
          <Link href="/payments" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-blue">
            Subscriptions
          </Link>
        </div>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total payouts" value={formatCount(payouts.length)} note="Batched payout queue" />
        <MetricCard title="Pending payouts" value={formatCount(pendingCount)} note="Awaiting confirmation" tone="orange" />
        <MetricCard title="Paid this month" value={formatCount(paidCount)} note="Settled transfers" tone="green" />
        <MetricCard title="On hold" value={formatCount(onHoldCount)} note="Administrative review" />
      </section>
      <section className="mt-8 overflow-hidden rounded-[10px] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-admin-border px-5 py-5">
          <div>
            <h3 className="text-[18px] font-bold text-admin-ink">Provider payout queue</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Review payout status by provider</p>
          </div>
        </div>
        {payouts.length > 0 ? (
          <div className="overflow-x-auto px-4">
            <table className="w-full min-w-[800px] border-collapse text-left text-[14px]">
              <thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted">
                <tr>
                  <th className="px-5 py-4">Provider</th>
                  <th className="px-5 py-4">Gross</th>
                  <th className="px-5 py-4">Net</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-admin-border last:border-b-0">
                    <td className="px-5 py-4">
                      <p className="font-bold text-admin-ink">{p.providerName || p.providerId}</p>
                      <p className="text-[12px] text-admin-muted">{p.providerRole ?? "Clinician"}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-admin-ink">{formatRevenue(p.grossKobo / 100)}</td>
                    <td className="px-5 py-4 font-bold text-admin-ink">{formatRevenue(p.netKobo / 100)}</td>
                    <td className="px-5 py-4">
                      <span className={["rounded-full px-3 py-1 text-[12px] font-bold", statusClass(p.status)].join(" ")}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-admin-muted">{new Date(p.createdAt).toLocaleDateString("en-NG")}</td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Link href={`/payments?view=provider-payouts&provider=${encodeURIComponent(p.id)}`} className="font-bold text-admin-blue hover:text-admin-blue-hover">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-[300px] place-items-center border-t border-admin-border px-6 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral">
                <CardIcon className="h-7 w-7" />
              </span>
              <h4 className="mt-5 text-[20px] font-bold text-admin-ink">No provider payouts in queue</h4>
              <p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">
                Completed home care visits and eligible clinician appointments will generate payout items here.
              </p>
            </div>
          </div>
        )}
      </section>
      {showProvider ? <ProviderDetailsPanel payout={selectedPayout} /> : null}
      {showConfirm ? <PayoutActionPanel action="confirm" payoutId={activePayoutId} /> : null}
      {showHold ? <PayoutActionPanel action="hold" payoutId={activePayoutId} /> : null}
      {showRelease ? <PayoutActionPanel action="release" payoutId={activePayoutId} /> : null}
      {showReverse ? <PayoutActionPanel action="reverse" payoutId={activePayoutId} /> : null}
    </main>
  );
}

function RevenueAnalyticsView({
  revenueData,
  plans,
}: {
  revenueData: RevenueResponse | null;
  plans: AdminSubscriptionPlan[];
}) {
  const summary = revenueData?.summary;
  const mtd = summary ? summary.mtdKobo / 100 : 0;
  const avg = summary ? summary.avgTransactionKobo / 100 : 0;
  const collectionRate = summary ? summary.collectionRatePercent : 0;
  const growth = summary?.mtdGrowthPercent !== null && summary?.mtdGrowthPercent !== undefined ? `${summary.mtdGrowthPercent}%` : "--";

  const distribution = revenueData?.distribution;
  const byPlan = distribution?.byPlan ?? {};

  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-admin-ink">Revenue Analytics</h2>
          <p className="mt-2 text-[16px] font-medium text-admin-muted">Monitor payment performance across the platform</p>
        </div>
        <div className="flex gap-3">
          <Link href="/payments?view=transactions" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-blue">
            Transactions
          </Link>
          <Link href="/payments" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-ink">
            Subscriptions
          </Link>
        </div>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Revenue MTD" value={formatRevenue(mtd)} note="Current month" tone="green" />
        <MetricCard title="Growth" value={growth} note="Compared to previous period" />
        <MetricCard title="Average transaction" value={formatRevenue(avg)} note="Per settled transaction" tone="orange" />
        <MetricCard title="Collection rate" value={`${collectionRate}%`} note="Invoiced amounts settled" />
      </section>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-[10px] bg-white">
          <div className="border-b border-admin-border px-5 py-5">
            <h3 className="text-[18px] font-bold text-admin-ink">Revenue trend</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Recent revenue timeline</p>
          </div>
          {revenueData?.trend && revenueData.trend.length > 0 ? (
            <div className="divide-y divide-admin-border p-5">
              {revenueData.trend.map((point) => (
                <div key={point.bucket} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-bold text-admin-ink">{point.bucket}</p>
                    <p className="text-[12px] text-admin-muted">{point.count} transactions</p>
                  </div>
                  <p className="font-bold text-admin-ink">{formatRevenue(point.netKobo / 100)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[300px] place-items-center px-6 text-center">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral">
                  <CardIcon className="h-7 w-7" />
                </span>
                <h4 className="mt-5 text-[20px] font-bold text-admin-ink">No trend data</h4>
                <p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">
                  Revenue trend data accumulates as transactions are processed over monthly buckets.
                </p>
              </div>
            </div>
          )}
        </section>
        <section className="overflow-hidden rounded-[10px] bg-white">
          <div className="border-b border-admin-border px-5 py-5">
            <h3 className="text-[18px] font-bold text-admin-ink">Revenue by plan</h3>
            <p className="mt-1 text-[14px] font-medium text-admin-muted">Plan-level contribution</p>
          </div>
          <div className="divide-y divide-admin-border">
            {Object.keys(byPlan).length > 0 ? (
              Object.entries(byPlan).map(([planCode, amountKobo]) => (
                <div key={planCode} className="flex items-center justify-between px-5 py-5">
                  <span className="text-[14px] font-semibold text-admin-ink">{labelFromApiValue(planCode)}</span>
                  <span className="text-[14px] font-bold text-admin-ink">{formatRevenue(amountKobo / 100)}</span>
                </div>
              ))
            ) : plans.length > 0 ? (
              plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-5">
                  <span className="text-[14px] font-semibold text-admin-ink">{p.name}</span>
                  <span className="text-[14px] font-bold text-admin-ink">
                    {p.revenueLabel !== "--" ? p.revenueLabel : formatRevenue((p.revenueKobo ?? 0) / 100)}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-6 text-center text-[14px] text-admin-muted">
                No subscription plan revenue recorded yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Page Entrypoint
// ---------------------------------------------------------------------------

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const params = await searchParams;

  if (params.view === "transactions") {
    const transactionsPage = await getAdminTransactions(token, {
      status: params.status,
      dateRange: params.dateRange,
      page: params.page ? Number(params.page) : 1,
    });
    const selectedTx = params.transaction && params.transaction !== "preview"
      ? await getAdminTransaction(token, params.transaction)
      : null;

    return (
      <TransactionsView
        transactions={transactionsPage?.items ?? []}
        showFilters={params.filters === "1"}
        selectedTransaction={selectedTx}
        showCareEpisode={params.careEpisode === "1"}
        showVerify={params.verify === "1"}
      />
    );
  }

  if (params.view === "overdue") {
    const overduePage = await getAdminOverdueInvoices(token, {
      page: params.page ? Number(params.page) : 1,
    });
    const selectedInvoice = params.invoice && params.invoice !== "1" && params.invoice !== "preview"
      ? await getAdminInvoice(token, params.invoice)
      : null;

    return (
      <OverduePaymentsView
        overdueInvoices={overduePage?.items ?? []}
        showReminder={params.reminder === "1"}
        showInvoice={params.invoice === "1" || Boolean(selectedInvoice)}
        selectedInvoice={selectedInvoice}
        showEscalate={params.escalate === "1"}
        reminderInvoiceId={params.invoiceId}
      />
    );
  }

  if (params.view === "provider-payouts") {
    const payoutsPage = await getAdminPayouts(token, {
      status: params.status,
      page: params.page ? Number(params.page) : 1,
    });
    const selectedPayout = params.provider && params.provider !== "preview"
      ? await getAdminPayout(token, params.provider)
      : null;

    return (
      <ProviderPayoutsView
        payouts={payoutsPage?.items ?? []}
        showProvider={params.provider === "preview" || Boolean(selectedPayout)}
        selectedPayout={selectedPayout}
        showConfirm={params.confirm === "1"}
        showHold={params.hold === "1"}
        showRelease={params.release === "1"}
        showReverse={params.reverse === "1"}
        activePayoutId={params.payoutId || selectedPayout?.id}
      />
    );
  }

  if (params.view === "revenue-analytics") {
    const [revenueData, livePlans] = await Promise.all([
      getAdminRevenue(token),
      getAdminPlans(token),
    ]);
    return <RevenueAnalyticsView revenueData={revenueData} plans={livePlans ?? []} />;
  }

  const [overview, livePlans, facilityPlans] = await Promise.all([
    getAdminPaymentsOverview(token),
    getAdminPlans(token),
    getFacilityPlans(token),
  ]);

  const plans = livePlans ?? overview?.plans ?? [];
  const selectedPlanId = params.plan;
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const showEdit = params.edit === "1";
  const showSaved = params.saved === "1";
  const showDeactivate = params.deactivate === "1";
  const showFacility = params.facility === "1";

  const data: AdminPaymentsOverview = overview ?? {
    hasData: plans.length > 0,
    subscriberCount: plans.reduce((sum, p) => sum + (p.subscribers ?? 0), 0),
    revenueMtd: { value: 0, trendPercent: null, status: "active", state: "active" },
    paymentModuleStatus: "active",
    plans,
  };

  return (
    <main className="relative px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-admin-ink">Payments</h2>
          <p className="mt-2 text-[16px] font-medium text-admin-muted">Manage subscription plans and payment configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/payments?view=transactions" className="rounded-[8px] border border-admin-border bg-white px-4 py-2.5 text-[14px] font-bold text-admin-blue">
            Transactions
          </Link>
          <Link href="/payments?view=overdue" className="rounded-[8px] border border-admin-border bg-white px-4 py-2.5 text-[14px] font-bold text-admin-ink">
            Overdue
          </Link>
          <Link href="/payments?view=provider-payouts" className="rounded-[8px] border border-admin-border bg-white px-4 py-2.5 text-[14px] font-bold text-admin-ink">
            Payouts
          </Link>
          <Link href="/payments?view=revenue-analytics" className="rounded-[8px] border border-admin-border bg-white px-4 py-2.5 text-[14px] font-bold text-admin-ink">
            Revenue
          </Link>
          <span className={["inline-flex h-10 items-center rounded-[8px] px-3.5 text-[13px] font-bold", statusClass(data.paymentModuleStatus)].join(" ")}>
            Module: {labelFromApiValue(data.paymentModuleStatus)}
          </span>
        </div>
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active subscribers" value={formatCount(data.subscriberCount)} note="Active subscriptions across tiers" />
        <MetricCard title="Revenue MTD" value={formatRevenue(data.revenueMtd.value)} note={data.revenueMtd.state === "not_configured" ? "Billing not configured" : "Current month"} tone="green" />
        <MetricCard title="Plans" value={formatCount(plans.length)} note="Available plan catalogue" tone="orange" />
        <MetricCard title="Payment module" value={labelFromApiValue(data.paymentModuleStatus)} note="Backend integration status" />
      </section>
      <div className="mt-8">
        <SubscriptionTable plans={plans} />
      </div>
      {selectedPlan && showEdit ? (
        <EditPlanPanel plan={selectedPlan} />
      ) : selectedPlan && showSaved ? (
        <SavePlanPanel plan={selectedPlan} />
      ) : selectedPlan && showDeactivate ? (
        <DeactivatePlanPanel plan={selectedPlan} />
      ) : selectedPlan && showFacility ? (
        <FacilityPlanPanel overview={data} plan={selectedPlan} facilityPlans={facilityPlans} />
      ) : selectedPlan ? (
        <DetailPanel overview={data} plan={selectedPlan} />
      ) : null}
    </main>
  );
}
