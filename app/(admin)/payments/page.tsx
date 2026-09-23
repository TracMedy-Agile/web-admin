import Link from "next/link";
import { redirect } from "next/navigation";
import { CardIcon, CloseIcon } from "@/components/admin/AdminIcons";
import { getAdminSessionToken } from "@/lib/server/admin-overview";
import { getAdminPaymentsOverview, type AdminPaymentsOverview, type AdminSubscriptionPlan } from "@/lib/server/admin-payments";

type PaymentsSearchParams = { plan?: string; edit?: string; saved?: string; deactivate?: string; facility?: string; view?: string; filters?: string; transaction?: string; careEpisode?: string; verify?: string; reminder?: string; invoice?: string; escalate?: string; provider?: string; confirm?: string; hold?: string; release?: string; reverse?: string; status?: string; dateRange?: string };
type PaymentsPageProps = { searchParams: Promise<PaymentsSearchParams> };

function labelFromApiValue(value: string | null | undefined): string {
  if (!value || !value.trim()) return "Not configured";
  return value.split(/[_-]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function statusClass(value: string): string {
  if (value === "active" || value === "available") return "bg-admin-green-soft text-admin-success";
  if (value === "not_configured" || value === "monitoring_inactive") return "bg-admin-warning-soft text-admin-warning";
  return "bg-admin-neutral-soft text-admin-muted";
}

function formatCount(value: number | null): string {
  return value === null ? "--" : new Intl.NumberFormat("en-US").format(value);
}

function formatRevenue(value: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function MetricCard({ title, value, note, tone = "blue" }: { title: string; value: string; note: string; tone?: "blue" | "green" | "orange" }) {
  const iconClass = tone === "green" ? "bg-admin-green-soft text-admin-success" : tone === "orange" ? "bg-admin-warning-soft text-admin-warning" : "bg-admin-blue-soft text-admin-blue";
  return (
    <article className="admin-panel-shadow rounded-[8px] border border-admin-border bg-white px-5 py-5">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[13px] font-bold uppercase text-admin-muted">{title}</p><p className="mt-3 text-[27px] font-bold text-admin-ink">{value}</p><p className="mt-2 text-[13px] font-semibold text-admin-muted">{note}</p></div><span className={["grid h-12 w-12 place-items-center rounded-[8px]", iconClass].join(" ")}><CardIcon className="h-6 w-6" /></span></div>
    </article>
  );
}

function SubscriptionTable({ plans }: { plans: AdminSubscriptionPlan[] }) {
  return (
    <section className="overflow-hidden rounded-[10px] bg-white">
      <div className="border-b border-admin-border px-5 py-5"><h3 className="text-[18px] font-bold text-admin-ink">Subscription Plans</h3><p className="mt-1 text-[14px] font-medium text-admin-muted">Plan catalogue and current subscriber coverage</p></div>
      <div className="overflow-x-auto px-4"><table className="w-full min-w-[900px] border-collapse text-left text-[14px]"><thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted"><tr><th className="px-5 py-4">Plan</th><th className="px-5 py-4">Audience</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Subscribers</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody>{plans.map((plan) => <tr key={plan.id} className="border-b border-admin-border last:border-b-0"><td className="px-5 py-5"><p className="font-bold text-admin-ink">{plan.name}</p><p className="mt-1 text-[12px] font-semibold uppercase text-admin-muted">{plan.tier}</p></td><td className="px-5 py-5 text-admin-text">{plan.audience}</td><td className="px-5 py-5 font-semibold text-admin-ink">{plan.priceLabel}</td><td className="px-5 py-5 font-semibold text-admin-ink">{formatCount(plan.subscribers)}</td><td className="px-5 py-5"><span className={["rounded-full px-3 py-1.5 text-[12px] font-bold", statusClass(plan.status)].join(" ")}>{labelFromApiValue(plan.status)}</span></td><td className="px-5 py-5 text-right"><Link href={{ pathname: "/payments", query: { plan: plan.id } }} className="font-bold text-admin-blue hover:text-admin-blue-hover">View details</Link></td></tr>)}</tbody></table></div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) { return <div><dt className="text-[12px] font-bold uppercase text-admin-muted">{label}</dt><dd className="mt-1 text-[15px] font-semibold text-admin-ink">{value}</dd></div>; }
function AvailabilityRow({ label, available }: { label: string; available: boolean }) { return <div className="flex items-center justify-between gap-4 text-[14px]"><span className="font-semibold text-admin-ink">{label}</span><span className={["rounded-full px-3 py-1.5 text-[12px] font-bold", available ? "bg-admin-green-soft text-admin-success" : "bg-admin-neutral-soft text-admin-muted"].join(" ")}>{available ? "Connected" : "Unavailable"}</span></div>; }

function EditPlanPanel({ plan }: { plan: AdminSubscriptionPlan }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="edit-plan-title">
      <div className="mx-auto flex h-full w-full max-w-[680px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6">
          <div><p className="text-[13px] font-bold uppercase text-admin-muted">Edit subscription plan</p><h2 id="edit-plan-title" className="mt-2 text-[24px] font-bold text-admin-ink">{plan.name}</h2><p className="mt-2 text-[14px] font-medium text-admin-muted">Update the plan configuration for facilities on this tier.</p></div>
          <Link href={{ pathname: "/payments", query: { plan: plan.id } }} aria-label="Close edit plan" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted hover:text-admin-ink"><CloseIcon className="h-5 w-5" /></Link>
        </div>
        <form action="/payments" method="get" className="space-y-6 px-6 py-6">
          <input type="hidden" name="plan" value={plan.id} />
          <section className="grid gap-5 sm:grid-cols-2">
            <label className="text-[13px] font-bold text-admin-ink">Plan name<input name="name" defaultValue={plan.name} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label className="text-[13px] font-bold text-admin-ink">Plan tier<select name="tier" defaultValue={plan.tier} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink outline-none focus:border-admin-blue"><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></label>
            <label className="text-[13px] font-bold text-admin-ink sm:col-span-2">Audience<input name="audience" defaultValue={plan.audience} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label className="text-[13px] font-bold text-admin-ink">Billing price<input name="price" defaultValue={plan.priceLabel} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink outline-none focus:border-admin-blue" /></label>
            <label className="text-[13px] font-bold text-admin-ink">Status<select name="status" defaultValue={plan.status} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink outline-none focus:border-admin-blue"><option value="active">Active</option><option value="not_configured">Not configured</option></select></label>
          </section>
          <div className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-4 text-[13px] leading-5 text-admin-muted">Plan-management endpoints are not available in the current backend contract. This form is ready for the verified endpoint when it is shipped.</div>
          <div className="flex items-center justify-end gap-3 border-t border-admin-border pt-5"><Link href={{ pathname: "/payments", query: { plan: plan.id } }} className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted hover:text-admin-ink">Cancel</Link><button type="submit" name="saved" value="1" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white opacity-60" title="Waiting for the plan-management endpoint">Save plan changes</button></div>
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
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-warning-soft text-admin-warning"><CardIcon className="h-7 w-7" /></span>
          <h2 id="save-plan-title" className="mt-5 text-[22px] font-bold text-admin-ink">Save plan changes</h2>
          <p className="mt-3 text-[14px] leading-6 text-admin-muted">The {plan.name} changes are ready to save, but the plan-management endpoint is not available yet.</p>
          <div className="mt-5 rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-left text-[13px] font-semibold text-admin-muted">No data was changed. Connect the admin subscription endpoint before enabling persistence.</div>
          <div className="mt-6 flex justify-center gap-3"><Link href={{ pathname: "/payments", query: { plan: plan.id, edit: "1" } }} className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">Back to edit</Link><Link href={{ pathname: "/payments", query: { plan: plan.id } }} className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Close</Link></div>
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
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-red-soft text-admin-red"><CardIcon className="h-7 w-7" /></span>
          <h2 id="deactivate-plan-title" className="mt-5 text-[22px] font-bold text-admin-ink">Deactivate plan?</h2>
          <p className="mt-3 text-[14px] leading-6 text-admin-muted">Deactivating {plan.name} will stop new facilities from selecting this plan. Existing subscriptions are not changed.</p>
          <div className="mt-5 rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-left text-[13px] font-semibold text-admin-muted">Plan-management actions are not available in the current backend contract. No change has been made.</div>
          <div className="mt-6 flex justify-center gap-3"><Link href={{ pathname: "/payments", query: { plan: plan.id } }} className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">Cancel</Link><button type="button" disabled className="rounded-[8px] bg-admin-red px-5 py-3 text-[14px] font-bold text-white opacity-60" title="Waiting for the plan-management endpoint">Deactivate plan</button></div>
        </div>
      </div>
    </div>
  );
}

function FacilityPlanPanel({ overview, plan }: { overview: AdminPaymentsOverview; plan: AdminSubscriptionPlan }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="facility-plan-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Facility plan details</p><h2 id="facility-plan-title" className="mt-2 text-[24px] font-bold text-admin-ink">Selected facility</h2><p className="mt-2 text-[14px] font-medium text-admin-muted">Subscription assignment and billing readiness</p></div><Link href={{ pathname: "/payments", query: { plan: plan.id } }} aria-label="Close facility plan details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted hover:text-admin-ink"><CloseIcon className="h-5 w-5" /></Link></div>
        <div className="space-y-6 px-6 py-6">
          <section className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5"><div className="flex items-center justify-between gap-4"><div><p className="text-[12px] font-bold uppercase text-admin-muted">Current plan</p><p className="mt-2 text-[20px] font-bold text-admin-ink">{plan.name}</p></div><span className={["rounded-full px-3 py-1.5 text-[12px] font-bold", statusClass(plan.status)].join(" ")}>{labelFromApiValue(plan.status)}</span></div></section>
          <section><h3 className="text-[15px] font-bold uppercase text-admin-muted">Subscription information</h3><dl className="mt-4 grid gap-5 sm:grid-cols-2"><DetailItem label="Plan tier" value={labelFromApiValue(plan.tier)} /><DetailItem label="Audience" value={plan.audience} /><DetailItem label="Price" value={plan.priceLabel} /><DetailItem label="Subscribers on plan" value={formatCount(plan.subscribers)} /><DetailItem label="Revenue MTD" value={formatRevenue(overview.revenueMtd.value)} /><DetailItem label="Payment status" value={labelFromApiValue(overview.paymentModuleStatus)} /></dl></section>
          <section className="border-t border-admin-border pt-5"><h3 className="text-[15px] font-bold uppercase text-admin-muted">Billing history</h3><p className="mt-3 text-[14px] leading-6 text-admin-muted">No facility-level payment history is available until the admin payments endpoints are connected.</p></section>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ overview, plan }: { overview: AdminPaymentsOverview; plan: AdminSubscriptionPlan }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="subscription-detail-title"><div className="ml-auto flex h-full w-full max-w-[620px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Subscription details</p><h2 id="subscription-detail-title" className="mt-2 text-[24px] font-bold text-admin-ink">{plan.name}</h2><span className={["mt-3 inline-flex rounded-full px-3 py-1.5 text-[12px] font-bold", statusClass(plan.status)].join(" ")}>{labelFromApiValue(plan.status)}</span></div><div className="flex items-center gap-2"><Link href={{ pathname: "/payments", query: { plan: plan.id, facility: "1" } }} className="rounded-[8px] border border-admin-border px-3 py-2 text-[13px] font-bold text-admin-ink">Facility details</Link><Link href={{ pathname: "/payments", query: { plan: plan.id, deactivate: "1" } }} className="rounded-[8px] border border-admin-red/30 px-3 py-2 text-[13px] font-bold text-admin-red">Deactivate</Link><Link href={{ pathname: "/payments", query: { plan: plan.id, edit: "1" } }} aria-label="Edit subscription plan" className="rounded-[8px] bg-admin-blue px-4 py-2 text-[13px] font-bold text-white">Edit plan</Link><Link href="/payments" aria-label="Close subscription details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted hover:text-admin-ink"><CloseIcon className="h-5 w-5" /></Link></div></div><div className="space-y-6 px-6 py-6"><section><h3 className="text-[15px] font-bold uppercase text-admin-muted">Plan overview</h3><dl className="mt-4 grid gap-4 sm:grid-cols-2"><DetailItem label="Tier" value={labelFromApiValue(plan.tier)} /><DetailItem label="Audience" value={plan.audience} /><DetailItem label="Price" value={plan.priceLabel} /><DetailItem label="Subscribers" value={formatCount(plan.subscribers)} /></dl></section><section className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5"><h3 className="text-[15px] font-bold text-admin-ink">Billing configuration</h3><p className="mt-1 text-[14px] leading-6 text-admin-muted">Live pricing and payment collection are not configured in the current backend contract.</p><dl className="mt-4 grid gap-4 sm:grid-cols-2"><DetailItem label="Revenue MTD" value={formatRevenue(overview.revenueMtd.value)} /><DetailItem label="Payment module" value={labelFromApiValue(overview.paymentModuleStatus)} /></dl></section><section><h3 className="text-[15px] font-bold uppercase text-admin-muted">Included capabilities</h3><ul className="mt-4 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-3 text-[14px] font-semibold text-admin-ink"><span className="h-2 w-2 rounded-full bg-admin-blue" />{feature}</li>)}</ul></section><section className="border-t border-admin-border pt-5"><h3 className="text-[15px] font-bold uppercase text-admin-muted">Endpoint availability</h3><div className="mt-4 space-y-3"><AvailabilityRow label="Admin dashboard overview" available /><AvailabilityRow label="Dedicated admin subscriptions endpoint" available={false} /><AvailabilityRow label="Subscription management actions" available={false} /></div></section></div></div></div>
  );
}

function TransactionFiltersPanel() {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="transaction-filters-title">
      <div className="ml-auto flex h-full w-full max-w-[430px] flex-col rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Transactions</p><h2 id="transaction-filters-title" className="mt-2 text-[22px] font-bold text-admin-ink">Filter transactions</h2></div><Link href="/payments?view=transactions" aria-label="Close transaction filters" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></div>
        <form action="/payments" method="get" className="space-y-5 px-6 py-6"><input type="hidden" name="view" value="transactions" /><label className="block text-[13px] font-bold text-admin-ink">Status<select name="status" defaultValue="all" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink"><option value="all">All statuses</option><option value="successful">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option></select></label><label className="block text-[13px] font-bold text-admin-ink">Date range<select name="dateRange" defaultValue="30d" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] font-medium text-admin-ink"><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option></select></label><div className="rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-[13px] leading-5 text-admin-muted">Filters will apply when the admin transactions endpoint is connected.</div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href="/payments?view=transactions" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Apply filters</button></div></form>
      </div>
    </div>
  );
}

function TransactionDetailsPanel() {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="transaction-details-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Transaction details</p><h2 id="transaction-details-title" className="mt-2 text-[24px] font-bold text-admin-ink">Payment record</h2></div><Link href="/payments?view=transactions" aria-label="Close transaction details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></div>
        <div className="space-y-6 px-6 py-6"><div className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5"><p className="text-[12px] font-bold uppercase text-admin-muted">Status</p><p className="mt-2 text-[20px] font-bold text-admin-muted">Not available</p><p className="mt-2 text-[14px] leading-6 text-admin-muted">The transaction record could not be loaded because the admin transactions endpoint is not available yet.</p></div><dl className="grid gap-5 sm:grid-cols-2"><DetailItem label="Transaction ID" value="--" /><DetailItem label="Facility" value="--" /><DetailItem label="Amount" value="--" /><DetailItem label="Payment method" value="--" /><DetailItem label="Created" value="--" /><DetailItem label="Reference" value="--" /></dl><div className="flex flex-wrap gap-3 border-t border-admin-border pt-5"><Link href="/payments?view=transactions&transaction=preview&careEpisode=1" className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-blue">View care episodes</Link><Link href="/payments?view=transactions&transaction=preview&verify=1" className="rounded-[8px] bg-admin-blue px-4 py-3 text-[14px] font-bold text-white">Verify transaction</Link></div></div>
      </div>
    </div>
  );
}

function CareEpisodeDetailsPanel() {
  return (
    <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="care-episode-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Transaction details</p><h2 id="care-episode-title" className="mt-2 text-[24px] font-bold text-admin-ink">Care episodes</h2></div><Link href="/payments?view=transactions&transaction=preview" aria-label="Close care episode details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></div>
        <div className="space-y-6 px-6 py-6"><div className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5"><p className="text-[12px] font-bold uppercase text-admin-muted">Care episode payment allocation</p><p className="mt-2 text-[20px] font-bold text-admin-muted">Not available</p><p className="mt-2 text-[14px] leading-6 text-admin-muted">Care episode allocations will appear here when the transaction and care episode endpoints are connected.</p></div><dl className="grid gap-5 sm:grid-cols-2"><DetailItem label="Care episode ID" value="--" /><DetailItem label="Patient" value="--" /><DetailItem label="Episode type" value="--" /><DetailItem label="Allocated amount" value="--" /><DetailItem label="Payment status" value="--" /><DetailItem label="Created" value="--" /></dl></div>
      </div>
    </div>
  );
}

function VerifyTransactionPanel() {
  return (
    <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="verify-transaction-title">
      <div className="mx-auto flex min-h-full w-full max-w-[500px] items-center justify-center"><div className="w-full rounded-[10px] bg-white px-6 py-7 text-center shadow-2xl"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-warning-soft text-admin-warning"><CardIcon className="h-7 w-7" /></span><h2 id="verify-transaction-title" className="mt-5 text-[22px] font-bold text-admin-ink">Verify transaction</h2><p className="mt-3 text-[14px] leading-6 text-admin-muted">Transaction verification cannot be completed until a live payment record and verification endpoint are available.</p><div className="mt-5 rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-left text-[13px] font-semibold text-admin-muted">No transaction was verified or changed.</div><div className="mt-6 flex justify-center gap-3"><Link href="/payments?view=transactions&transaction=preview" className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">Back to details</Link><button type="button" disabled className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white opacity-60">Verify</button></div></div></div>
    </div>
  );
}

function TransactionsView({ showFilters, showDetails, showCareEpisode, showVerify }: { showFilters: boolean; showDetails: boolean; showCareEpisode: boolean; showVerify: boolean }) {
  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div><h2 className="text-[26px] font-bold text-admin-ink">Payments</h2><p className="mt-2 text-[16px] font-medium text-admin-muted">Review subscription and facility payment activity</p></div>
        <Link href="/payments" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-blue">Subscriptions</Link>
      </div>
      <div className="mt-8 flex gap-6 border-b border-admin-border text-[15px] font-bold"><Link href="/payments" className="pb-4 text-admin-muted">Subscriptions</Link><Link href="/payments?view=transactions" className="border-b-2 border-admin-blue pb-4 text-admin-blue">Transactions</Link></div>
      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total transactions" value="--" note="Transaction endpoint unavailable" />
        <MetricCard title="Successful" value="--" note="Awaiting live payment data" tone="green" />
        <MetricCard title="Pending" value="--" note="Awaiting live payment data" tone="orange" />
        <MetricCard title="Failed" value="--" note="Awaiting live payment data" />
      </section>
      <section className="mt-8 overflow-hidden rounded-[10px] bg-white">
        <div className="flex flex-col gap-4 border-b border-admin-border px-5 py-5 xl:flex-row xl:items-center xl:justify-between"><div><h3 className="text-[18px] font-bold text-admin-ink">Transactions</h3><p className="mt-1 text-[14px] font-medium text-admin-muted">Filter and inspect payment records</p></div><div className="flex flex-wrap gap-3"><Link href="/payments?view=transactions&filters=1" className="rounded-[8px] border border-admin-border px-4 py-2 text-[13px] font-bold text-admin-blue">Open filters</Link></div></div>
        <div className="grid min-h-[300px] place-items-center border-t border-admin-border px-6 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral"><CardIcon className="h-7 w-7" /></span><h4 className="mt-5 text-[20px] font-bold text-admin-ink">No transaction data available</h4><p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">The admin transactions endpoint is not available yet. Filters and transaction records will activate when payment data is connected.</p><Link href="/payments?view=transactions&transaction=preview" className="mt-5 inline-flex rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-blue">View transaction details</Link></div></div>
      </section>
{showFilters ? <TransactionFiltersPanel /> : null}{showDetails ? <TransactionDetailsPanel /> : null}{showCareEpisode ? <CareEpisodeDetailsPanel /> : null}{showVerify ? <VerifyTransactionPanel /> : null}    </main>
  );
}

function PaymentReminderPanel() {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="payment-reminder-title">
      <div className="mx-auto flex min-h-full w-full max-w-[520px] items-center justify-center"><div className="w-full rounded-[10px] bg-white px-6 py-7 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Overdue payments</p><h2 id="payment-reminder-title" className="mt-2 text-[22px] font-bold text-admin-ink">Send payment reminder</h2></div><Link href="/payments?view=overdue" aria-label="Close payment reminder" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></div><p className="mt-4 text-[14px] leading-6 text-admin-muted">No overdue payment record is selected. Reminders will be available when payment records and the reminder endpoint are connected.</p><label className="mt-5 block text-[13px] font-bold text-admin-ink">Message<textarea disabled rows={4} placeholder="Payment reminder message" className="mt-2 w-full resize-none rounded-[8px] border border-admin-border bg-admin-soft px-3 py-3 text-[14px] text-admin-muted outline-none" /></label><div className="mt-6 flex justify-end gap-3 border-t border-admin-border pt-5"><Link href="/payments?view=overdue" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="button" disabled className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white opacity-60">Send reminder</button></div></div></div>
    </div>
  );
}

function InvoicePanel({ showEscalate }: { showEscalate: boolean }) {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Payment invoice</p><h2 id="invoice-title" className="mt-2 text-[24px] font-bold text-admin-ink">Invoice</h2></div><Link href="/payments?view=overdue" aria-label="Close invoice" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></div>
        <div className="space-y-6 px-6 py-6"><div className="flex items-start justify-between gap-4 rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5"><div><p className="text-[12px] font-bold uppercase text-admin-muted">Invoice status</p><p className="mt-2 text-[20px] font-bold text-admin-muted">Not available</p></div><CardIcon className="h-7 w-7 text-admin-warning" /></div><dl className="grid gap-5 sm:grid-cols-2"><DetailItem label="Invoice number" value="--" /><DetailItem label="Facility" value="--" /><DetailItem label="Issue date" value="--" /><DetailItem label="Due date" value="--" /><DetailItem label="Amount due" value="--" /><DetailItem label="Balance" value="--" /></dl><div className="rounded-[8px] border border-admin-border px-5 py-4 text-[14px] leading-6 text-admin-muted">Invoice records and downloadable documents will appear after the admin invoice endpoint is connected.</div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href="/payments?view=overdue" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Close</Link><Link href="/payments?view=overdue&invoice=preview&escalate=1" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Escalate invoice</Link></div></div>
      </div>
      {showEscalate ? <EscalateInvoicePanel /> : null}
    </div>
  );
}

function EscalateInvoicePanel() {
  return (
    <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="escalate-invoice-title"><div className="mx-auto flex min-h-full w-full max-w-[500px] items-center justify-center"><div className="w-full rounded-[10px] bg-white px-6 py-7 text-center shadow-2xl"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-warning-soft text-admin-warning"><CardIcon className="h-7 w-7" /></span><h2 id="escalate-invoice-title" className="mt-5 text-[22px] font-bold text-admin-ink">Escalate invoice</h2><p className="mt-3 text-[14px] leading-6 text-admin-muted">This invoice cannot be escalated because no live invoice record or escalation endpoint is available.</p><div className="mt-5 rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-left text-[13px] font-semibold text-admin-muted">No escalation was created.</div><div className="mt-6 flex justify-center gap-3"><Link href="/payments?view=overdue&invoice=preview" className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">Back to invoice</Link><button type="button" disabled className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white opacity-60">Escalate</button></div></div></div></div>
  );
}

function OverduePaymentsView({ showReminder, showInvoice, showEscalate }: { showReminder: boolean; showInvoice: boolean; showEscalate: boolean }) {
  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div><h2 className="text-[26px] font-bold text-admin-ink">Overdue Payments</h2><p className="mt-2 text-[16px] font-medium text-admin-muted">Track outstanding facility payment obligations</p></div><div className="flex gap-3"><Link href="/payments?view=transactions" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-blue">Transactions</Link><Link href="/payments?view=overdue&invoice=1" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-ink">View invoice</Link><Link href="/payments?view=overdue&reminder=1" className="rounded-[8px] bg-admin-blue px-4 py-3 text-[14px] font-bold text-white">Send reminder</Link></div></div>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard title="Overdue invoices" value="--" note="Payment endpoint unavailable" tone="orange" /><MetricCard title="Outstanding amount" value="--" note="Awaiting live payment data" /><MetricCard title="Due this week" value="--" note="Awaiting live payment data" /><MetricCard title="Reminders sent" value="--" note="Reminder endpoint unavailable" tone="green" /></section>
      <section className="mt-8 overflow-hidden rounded-[10px] bg-white"><div className="flex items-center justify-between gap-4 border-b border-admin-border px-5 py-5"><div><h3 className="text-[18px] font-bold text-admin-ink">Overdue invoices</h3><p className="mt-1 text-[14px] font-medium text-admin-muted">Review overdue payment records and contact facilities</p></div><div className="flex gap-2"><Link href="/payments?view=overdue&invoice=1" className="rounded-[8px] border border-admin-border px-4 py-2 text-[13px] font-bold text-admin-ink">Invoice</Link><Link href="/payments?view=overdue&reminder=1" className="rounded-[8px] border border-admin-border px-4 py-2 text-[13px] font-bold text-admin-blue">Payment reminder</Link></div></div><div className="grid min-h-[300px] place-items-center border-t border-admin-border px-6 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-warning-soft text-admin-warning"><CardIcon className="h-7 w-7" /></span><h4 className="mt-5 text-[20px] font-bold text-admin-ink">No overdue payments available</h4><p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">Overdue payment records will appear here when the admin payment endpoints are connected.</p></div></div></section>
      {showReminder ? <PaymentReminderPanel /> : null}{showInvoice ? <InvoicePanel showEscalate={showEscalate} /> : null}
    </main>
  );
}

function ProviderDetailsPanel() {
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="provider-details-title">
      <div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Provider payouts</p><h2 id="provider-details-title" className="mt-2 text-[24px] font-bold text-admin-ink">Provider details</h2></div><Link href="/payments?view=provider-payouts" aria-label="Close provider details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></div>
        <div className="space-y-6 px-6 py-6"><div className="rounded-[8px] border border-admin-border bg-admin-soft px-5 py-5"><p className="text-[12px] font-bold uppercase text-admin-muted">Provider record</p><p className="mt-2 text-[20px] font-bold text-admin-muted">Not available</p><p className="mt-2 text-[14px] leading-6 text-admin-muted">Provider payout details will appear here when the payout and provider endpoints are connected.</p></div><dl className="grid gap-5 sm:grid-cols-2"><DetailItem label="Provider name" value="--" /><DetailItem label="Provider ID" value="--" /><DetailItem label="Pending payout" value="--" /><DetailItem label="Paid to date" value="--" /><DetailItem label="Last payout" value="--" /><DetailItem label="Account status" value="--" /></dl><div className="border-t border-admin-border pt-5"><h3 className="text-[15px] font-bold uppercase text-admin-muted">Payout history</h3><p className="mt-3 text-[14px] leading-6 text-admin-muted">No provider payout history is available yet.</p></div></div>
      </div>
    </div>
  );
}

function PayoutActionPanel({ action }: { action: "confirm" | "hold" | "release" | "reverse" }) {
  const isConfirm = action === "confirm";
  const isRelease = action === "release";
  const title = isConfirm ? "Confirm payout" : isRelease ? "Release payment" : action === "reverse" ? "Reverse payment" : "Hold payment";
  const description = isConfirm ? "This payout cannot be confirmed until a live provider payout record and confirmation endpoint are available." : isRelease ? "This payment cannot be released until a live provider payout record and release endpoint are available." : action === "reverse" ? "This payment cannot be reversed until a live provider payout record and reversal endpoint are available." : "This payout cannot be placed on hold until a live provider payout record and hold endpoint are available.";
  return (
    <div className="fixed inset-0 z-20 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="payout-action-title">
      <div className="mx-auto flex min-h-full w-full max-w-[500px] items-center justify-center"><div className="w-full rounded-[10px] bg-white px-6 py-7 text-center shadow-2xl"><span className={["mx-auto grid h-14 w-14 place-items-center rounded-full", isConfirm ? "bg-admin-green-soft text-admin-success" : "bg-admin-warning-soft text-admin-warning"].join(" ")}><CardIcon className="h-7 w-7" /></span><h2 id="payout-action-title" className="mt-5 text-[22px] font-bold text-admin-ink">{title}</h2><p className="mt-3 text-[14px] leading-6 text-admin-muted">{description}</p><div className="mt-5 rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-left text-[13px] font-semibold text-admin-muted">No payout status was changed.</div><div className="mt-6 flex justify-center gap-3"><Link href="/payments?view=provider-payouts" className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-ink">Cancel</Link><button type="button" disabled className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white opacity-60">{title}</button></div></div></div>
    </div>
  );
}

function ProviderPayoutsView({ showProvider, showConfirm, showHold, showRelease, showReverse }: { showProvider: boolean; showConfirm: boolean; showHold: boolean; showRelease: boolean; showReverse: boolean }) {
  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div><h2 className="text-[26px] font-bold text-admin-ink">Provider Payouts</h2><p className="mt-2 text-[16px] font-medium text-admin-muted">Review provider earnings and payout readiness</p></div><div className="flex gap-3"><Link href="/payments?view=provider-payouts&confirm=1" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-ink">Confirm payout</Link><Link href="/payments?view=provider-payouts&release=1" className="rounded-[8px] border border-admin-green/30 bg-white px-4 py-3 text-[14px] font-bold text-admin-success">Release payment</Link><Link href="/payments?view=provider-payouts&reverse=1" className="rounded-[8px] border border-admin-red/30 bg-white px-4 py-3 text-[14px] font-bold text-admin-red">Reverse payment</Link><Link href="/payments?view=provider-payouts&hold=1" className="rounded-[8px] border border-admin-warning/30 bg-white px-4 py-3 text-[14px] font-bold text-admin-warning">Hold payment</Link><Link href="/payments?view=provider-payouts&provider=preview" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-ink">Provider details</Link><Link href="/payments" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-blue">Subscriptions</Link></div></div>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard title="Total providers" value="--" note="Payout endpoint unavailable" /><MetricCard title="Pending payouts" value="--" note="Awaiting live payout data" tone="orange" /><MetricCard title="Paid this month" value="--" note="Awaiting live payout data" tone="green" /><MetricCard title="On hold" value="--" note="Awaiting live payout data" /></section>
      <section className="mt-8 overflow-hidden rounded-[10px] bg-white"><div className="flex items-center justify-between gap-4 border-b border-admin-border px-5 py-5"><div><h3 className="text-[18px] font-bold text-admin-ink">Provider payout queue</h3><p className="mt-1 text-[14px] font-medium text-admin-muted">Review payout status by provider</p></div><Link href="/payments?view=provider-payouts&provider=preview" className="rounded-[8px] border border-admin-border px-4 py-2 text-[13px] font-bold text-admin-blue">Open provider details</Link></div><div className="grid min-h-[300px] place-items-center border-t border-admin-border px-6 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral"><CardIcon className="h-7 w-7" /></span><h4 className="mt-5 text-[20px] font-bold text-admin-ink">No provider payouts available</h4><p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">Provider payout records will appear here when the admin payout endpoints are connected.</p></div></div></section>
      {showProvider ? <ProviderDetailsPanel /> : null}{showConfirm ? <PayoutActionPanel action="confirm" /> : null}{showHold ? <PayoutActionPanel action="hold" /> : null}{showRelease ? <PayoutActionPanel action="release" /> : null}{showReverse ? <PayoutActionPanel action="reverse" /> : null}
    </main>
  );
}

function RevenueAnalyticsView({ overview }: { overview: AdminPaymentsOverview | null }) {
  const revenue = overview?.revenueMtd.value ?? 0;
  return (
    <main className="px-6 py-7 lg:px-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div><h2 className="text-[26px] font-bold text-admin-ink">Revenue Analytics</h2><p className="mt-2 text-[16px] font-medium text-admin-muted">Monitor payment performance across the platform</p></div><div className="flex gap-3"><Link href="/payments?view=transactions" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-blue">Transactions</Link><Link href="/payments" className="rounded-[8px] border border-admin-border bg-white px-4 py-3 text-[14px] font-bold text-admin-ink">Subscriptions</Link></div></div>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard title="Revenue MTD" value={formatRevenue(revenue)} note={overview?.revenueMtd.state === "not_configured" ? "Billing not configured" : "Current month"} tone="green" /><MetricCard title="Growth" value="--" note="Analytics endpoint unavailable" /><MetricCard title="Average transaction" value="--" note="Awaiting transaction data" tone="orange" /><MetricCard title="Collection rate" value="--" note="Awaiting payment data" /></section>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]"><section className="overflow-hidden rounded-[10px] bg-white"><div className="border-b border-admin-border px-5 py-5"><h3 className="text-[18px] font-bold text-admin-ink">Revenue trend</h3><p className="mt-1 text-[14px] font-medium text-admin-muted">Monthly revenue performance</p></div><div className="grid min-h-[300px] place-items-center px-6 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral"><CardIcon className="h-7 w-7" /></span><h4 className="mt-5 text-[20px] font-bold text-admin-ink">Analytics data unavailable</h4><p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">Revenue trends will appear here when the admin analytics and transactions endpoints are connected.</p></div></div></section><section className="overflow-hidden rounded-[10px] bg-white"><div className="border-b border-admin-border px-5 py-5"><h3 className="text-[18px] font-bold text-admin-ink">Revenue by plan</h3><p className="mt-1 text-[14px] font-medium text-admin-muted">Plan-level contribution</p></div><div className="divide-y divide-admin-border"><div className="flex items-center justify-between px-5 py-5"><span className="text-[14px] font-semibold text-admin-ink">Tracmedy Starter</span><span className="text-[14px] font-bold text-admin-muted">--</span></div><div className="flex items-center justify-between px-5 py-5"><span className="text-[14px] font-semibold text-admin-ink">Tracmedy Plus</span><span className="text-[14px] font-bold text-admin-muted">--</span></div><div className="flex items-center justify-between px-5 py-5"><span className="text-[14px] font-semibold text-admin-ink">Tracmedy Enterprise</span><span className="text-[14px] font-bold text-admin-muted">--</span></div></div></section></div>
    </main>
  );
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const params = await searchParams;
  const overview = await getAdminPaymentsOverview(token);
  if (params.view === "transactions") return <TransactionsView showFilters={params.filters === "1"} showDetails={params.transaction === "preview"} showCareEpisode={params.careEpisode === "1"} showVerify={params.verify === "1"} />;
  if (params.view === "overdue") return <OverduePaymentsView showReminder={params.reminder === "1"} showInvoice={params.invoice === "1"} showEscalate={params.escalate === "1"} />;
  if (params.view === "provider-payouts") return <ProviderPayoutsView showProvider={params.provider === "preview"} showConfirm={params.confirm === "1"} showHold={params.hold === "1"} showRelease={params.release === "1"} showReverse={params.reverse === "1"} />;
  if (params.view === "revenue-analytics") return <RevenueAnalyticsView overview={overview} />;
  const selectedPlanId = params.plan;
  const selectedPlan = overview?.plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const showEdit = params.edit === "1";
  const showSaved = params.saved === "1";
  const showDeactivate = params.deactivate === "1";
  const showFacility = params.facility === "1";
  const data: AdminPaymentsOverview = overview ?? { hasData: false, subscriberCount: 0, revenueMtd: { value: 0, trendPercent: null, status: "not_configured", state: "not_configured" }, paymentModuleStatus: "not_configured", plans: [] };

  return <main className="relative px-6 py-7 lg:px-8"><div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div><h2 className="text-[26px] font-bold text-admin-ink">Payments</h2><p className="mt-2 text-[16px] font-medium text-admin-muted">Manage subscription plans and payment configuration</p></div><span className={["inline-flex h-11 items-center rounded-[8px] px-4 text-[13px] font-bold", statusClass(data.paymentModuleStatus)].join(" ")}>Module: {labelFromApiValue(data.paymentModuleStatus)}</span></div><section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard title="Active subscribers" value={formatCount(data.subscriberCount)} note="Professional and enterprise facilities" /><MetricCard title="Revenue MTD" value={formatRevenue(data.revenueMtd.value)} note={data.revenueMtd.state === "not_configured" ? "Billing not configured" : "Current month"} tone="green" /><MetricCard title="Plans" value={formatCount(data.plans.length)} note="Available plan catalogue" tone="orange" /><MetricCard title="Payment module" value={labelFromApiValue(data.paymentModuleStatus)} note="Backend integration status" /></section><div className="mt-8"><SubscriptionTable plans={data.plans} /></div>{selectedPlan && showEdit ? <EditPlanPanel plan={selectedPlan} /> : selectedPlan && showSaved ? <SavePlanPanel plan={selectedPlan} /> : selectedPlan && showDeactivate ? <DeactivatePlanPanel plan={selectedPlan} /> : selectedPlan && showFacility ? <FacilityPlanPanel overview={data} plan={selectedPlan} /> : selectedPlan ? <DetailPanel overview={data} plan={selectedPlan} /> : null}</main>;
}



















