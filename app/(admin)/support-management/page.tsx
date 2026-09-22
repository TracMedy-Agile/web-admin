import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardIcon, CloseIcon, EyeActionIcon, FilterIcon, ReceiptIcon, SearchIcon, UserCheckIcon } from "@/components/admin/AdminIcons";
import { getAdminSessionToken } from "@/lib/server/admin-overview";
import { getAdminSupportAttachmentUrl, getAdminSupportSummary, getAdminSupportTicket, getAdminSupportTickets, type AdminSupportAttachmentAccess, type AdminSupportSummary, type AdminSupportTicket, updateAdminSupportStatus } from "@/lib/server/admin-support";

type SupportSearchParams = {
  filters?: string;
  status?: string;
  priority?: string;
  category?: string;
  empty?: string;
  ticket?: string;
  attachment?: string;
  attachmentId?: string;
  resolve?: string;
  error?: string;
  updated?: string;
  search?: string;
  page?: string;
};

type SupportPageProps = {
  searchParams: Promise<SupportSearchParams>;
};

type SupportTicket = {
  id: string;
  ticketNumber: string;
  requester: string;
  source: string;
  message: string;
  subject: string;
  category: string;
  status: "New" | "Open" | "In progress" | "Resolved" | "Closed";
  createdAt: string;
  priority: "High" | "Medium" | "Low";
  attachmentCount: number;
};

function formatTicketStatus(value: string): SupportTicket["status"] {
  if (value === "in_progress") return "In progress";
  if (value === "new") return "New";
  if (value === "open") return "Open";
  if (value === "resolved") return "Resolved";
  if (value === "closed") return "Closed";
  return "New";
}

function formatTicketPriority(value: string): SupportTicket["priority"] {
  return value === "high" || value === "urgent" ? "High" : value === "normal" ? "Medium" : "Low";
}

function toSupportTicket(ticket: AdminSupportTicket): SupportTicket {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    requester: ticket.userId ?? "--",
    source: "Support queue",
    message: ticket.message,
    subject: ticket.subject ?? ticket.category,
    category: ticket.category,
    status: formatTicketStatus(ticket.status),
    createdAt: new Date(ticket.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
    priority: formatTicketPriority(ticket.priority),
    attachmentCount: ticket.attachmentCount,
  };
}
function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warning" | "success" | "danger" | "info" }) {
  const className = tone === "warning" ? "bg-admin-warning-soft text-admin-warning" : tone === "success" ? "bg-admin-green-soft text-admin-success" : tone === "danger" ? "bg-admin-red-soft text-admin-red" : tone === "info" ? "bg-admin-blue-soft text-admin-blue" : "bg-admin-neutral-soft text-admin-muted";
  return <span className={["inline-flex rounded-full px-3 py-1.5 text-[12px] font-bold", className].join(" ")}>{children}</span>;
}

function MetricCard({ title, value, note, tone = "blue" }: { title: string; value: string; note: string; tone?: "blue" | "green" | "orange" }) {
  const iconClass = tone === "green" ? "bg-admin-green-soft text-admin-success" : tone === "orange" ? "bg-admin-warning-soft text-admin-warning" : "bg-admin-blue-soft text-admin-blue";
  const Icon = title === "New submissions" ? ClipboardIcon : title === "In progress" ? BriefcaseIcon : title === "Awaiting user" ? UserCheckIcon : ReceiptIcon;
  const noteTone = tone === "green" ? "success" : tone === "orange" ? "warning" : "info";
  return <article className="admin-panel-shadow rounded-[8px] border border-admin-border bg-white px-5 py-5"><span className={["grid h-12 w-12 place-items-center rounded-[8px]", iconClass].join(" ")}><Icon className="h-6 w-6" /></span><p className="mt-6 text-[13px] font-bold uppercase text-admin-muted">{title}</p><div className="mt-3 flex items-center justify-between gap-3"><p className="text-[27px] font-bold text-admin-ink">{value}</p><StatusPill tone={noteTone}>{note}</StatusPill></div></article>;
}

function FiltersPanel() {
  return <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="support-filters-title"><div className="ml-auto flex h-full w-full max-w-[500px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl"><header className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Support requests</p><h2 id="support-filters-title" className="mt-2 text-[24px] font-bold text-admin-ink">Filters</h2><p className="mt-1 text-[14px] font-medium text-admin-muted">Narrow the support request queue.</p></div><Link href="/support-management" aria-label="Close filters" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></header><div className="space-y-5 px-6 py-6"><div className="rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-[13px] leading-5 text-admin-muted">Status and priority filters are supported by the admin support list endpoint. This preview does not apply filter changes yet.</div><label className="block"><span className="text-[14px] font-bold text-admin-ink">Status</span><select disabled defaultValue="" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-admin-soft px-3 text-[14px] text-admin-muted"><option value="">All statuses</option><option>Open</option><option>In progress</option><option>Resolved</option></select></label><label className="block"><span className="text-[14px] font-bold text-admin-ink">Category</span><select disabled defaultValue="" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-admin-soft px-3 text-[14px] text-admin-muted"><option value="">All categories</option><option>Account access</option><option>Billing</option><option>Facility management</option><option>Team access</option></select></label><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="text-[14px] font-bold text-admin-ink">From date</span><input disabled type="date" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-admin-soft px-3 text-[14px] text-admin-muted" /></label><label className="block"><span className="text-[14px] font-bold text-admin-ink">To date</span><input disabled type="date" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border bg-admin-soft px-3 text-[14px] text-admin-muted" /></label></div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href="/support-management" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Clear filters</Link><button type="button" disabled className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white opacity-60">Apply filters</button></div></div></div></div>;
}

function SupportUnavailableState() {
  return <div className="grid min-h-[320px] place-items-center px-6 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-warning-soft text-admin-warning"><ClipboardIcon className="h-7 w-7" /></span><h4 className="mt-5 text-[20px] font-bold text-admin-ink">Support requests unavailable</h4><p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">The support queue could not be loaded from the admin endpoint.</p></div></div>;
}
function EmptyRequestsState() {
  return <div className="grid min-h-[320px] place-items-center px-6 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-admin-neutral-soft text-admin-neutral"><ClipboardIcon className="h-7 w-7" /></span><h4 className="mt-5 text-[20px] font-bold text-admin-ink">No support requests found</h4><p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">There are no support requests matching the current view.</p></div></div>;
}

function AttachmentPreviewPanel({ ticket, access }: { ticket: SupportTicket; access: AdminSupportAttachmentAccess | null }) {
  return <div className="fixed inset-0 z-40 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="attachment-preview-title"><div className="mx-auto flex min-h-full w-full max-w-[760px] items-center justify-center"><div className="w-full overflow-hidden rounded-[10px] bg-white shadow-2xl"><header className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Support attachment</p><h2 id="attachment-preview-title" className="mt-2 text-[24px] font-bold text-admin-ink">Attachment preview</h2><p className="mt-1 text-[14px] font-medium text-admin-muted">{ticket.ticketNumber} - {ticket.subject}</p></div><Link href={"/support-management?ticket=" + ticket.id} aria-label="Close attachment preview" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></header><div className="space-y-5 px-6 py-6"><div className="grid min-h-[300px] place-items-center rounded-[8px] border border-dashed border-admin-border bg-admin-soft px-6 text-center"><div><ClipboardIcon className="mx-auto h-10 w-10 text-admin-neutral" /><p className="mt-4 text-[16px] font-bold text-admin-ink">{access ? "Attachment ready" : "Attachment unavailable"}</p><p className="mt-2 max-w-md text-[14px] leading-6 text-admin-muted">{access ? access.mimeType + " is available through a signed URL." : ticket.attachmentCount > 0 ? "Provide the attachmentId query parameter to load the signed attachment URL." : "This request has no attachment recorded by the admin support API."}</p></div></div><div className="flex flex-wrap items-center justify-between gap-4 border-t border-admin-border pt-5"><div><p className="text-[12px] font-bold uppercase text-admin-muted">File</p><p className="mt-1 text-[14px] font-semibold text-admin-ink">{access ? access.fileName : "No attachment selected"}</p></div>{access ? <a href={access.url} target="_blank" rel="noreferrer" className="rounded-[8px] bg-admin-blue px-4 py-3 text-[14px] font-bold text-white">Open attachment</a> : <button type="button" disabled className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-muted opacity-60">Open attachment</button>}</div></div></div></div></div>;
}function SupportRequestDetailsPanel({ ticket }: { ticket: SupportTicket }) {
  return <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="support-detail-title"><div className="ml-auto flex h-full w-full max-w-[600px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl"><header className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Admin support request</p><h2 id="support-detail-title" className="mt-2 text-[24px] font-bold text-admin-ink">{ticket.ticketNumber}</h2><p className="mt-1 text-[14px] font-medium text-admin-muted">{ticket.subject}</p></div><Link href="/support-management" aria-label="Close support request details" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></header><div className="space-y-6 px-6 py-6"><div className="rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-[13px] leading-5 text-admin-muted">Ticket details are loaded from the admin support detail endpoint.</div><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-[12px] font-bold uppercase text-admin-muted">Requester</dt><dd className="mt-1 text-[15px] font-bold text-admin-ink">{ticket.requester}</dd></div><div><dt className="text-[12px] font-bold uppercase text-admin-muted">Source</dt><dd className="mt-1 text-[15px] font-semibold text-admin-ink">{ticket.source}</dd></div><div><dt className="text-[12px] font-bold uppercase text-admin-muted">Category</dt><dd className="mt-1 text-[15px] font-semibold text-admin-ink">{ticket.category}</dd></div><div><dt className="text-[12px] font-bold uppercase text-admin-muted">Created</dt><dd className="mt-1 text-[15px] font-semibold text-admin-ink">{ticket.createdAt}</dd></div><div><dt className="text-[12px] font-bold uppercase text-admin-muted">Priority</dt><dd className="mt-2"><StatusPill tone={ticket.priority === "High" ? "danger" : ticket.priority === "Medium" ? "warning" : "neutral"}>{ticket.priority}</StatusPill></dd></div><div><dt className="text-[12px] font-bold uppercase text-admin-muted">Status</dt><dd className="mt-2"><StatusPill tone={ticket.status === "Resolved" ? "success" : ticket.status === "In progress" ? "warning" : "danger"}>{ticket.status}</StatusPill></dd></div></dl><div className="border-t border-admin-border pt-5"><p className="text-[12px] font-bold uppercase text-admin-muted">Request description</p><p className="mt-2 text-[14px] leading-6 text-admin-ink">{ticket.message}</p></div><div className="flex flex-wrap justify-end gap-3 border-t border-admin-border pt-5"><Link href={"/support-management?ticket=" + ticket.id + "&attachment=1"} className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-blue">Preview attachment</Link><button type="button" disabled className="rounded-[8px] border border-admin-border px-4 py-3 text-[14px] font-bold text-admin-muted opacity-60">Assign request</button><Link href={"/support-management?ticket=" + ticket.id + "&resolve=1"} className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Resolve request</Link></div></div></div></div>;
}async function resolveSupportTicketAction(formData: FormData): Promise<void> {
  "use server";

  const ticketId = formData.get("ticketId");
  const reasonValue = formData.get("reason");
  const reason = typeof reasonValue === "string" ? reasonValue.trim() : "";
  if (typeof ticketId !== "string" || !ticketId.trim()) return;

  const token = await getAdminSessionToken();
  if (!token) redirect("/login");

  const result = await updateAdminSupportStatus(token, ticketId, "resolved", reason || undefined);
  if (!result) {
    redirect("/support-management?ticket=" + encodeURIComponent(ticketId) + "&resolve=1&error=1");
  }

  revalidatePath("/support-management");
  redirect("/support-management?ticket=" + encodeURIComponent(ticketId) + "&updated=1");
}
function ResolveTicketPanel({ ticket, error, updated }: { ticket: SupportTicket; error: boolean; updated: boolean }) {
  return <div className="fixed inset-0 z-40 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="resolve-ticket-title"><div className="mx-auto flex min-h-full w-full max-w-[500px] items-center justify-center"><div className="w-full rounded-[10px] bg-white px-6 py-7 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Support request</p><h2 id="resolve-ticket-title" className="mt-2 text-[24px] font-bold text-admin-ink">Resolve ticket?</h2><p className="mt-1 text-[14px] font-medium text-admin-muted">{ticket.ticketNumber} - {ticket.subject}</p></div><Link href={"/support-management?ticket=" + ticket.id} aria-label="Close resolve ticket" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></div><form action={resolveSupportTicketAction}><input type="hidden" name="ticketId" value={ticket.id} />{error ? <div className="mt-5 rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[13px] leading-5 text-admin-red">Unable to resolve this ticket. Check its current status and try again.</div> : updated ? <div className="mt-5 rounded-[8px] border border-admin-green/30 bg-admin-green-soft px-4 py-3 text-[13px] leading-5 text-admin-success">Ticket status updated successfully.</div> : null}<div className="mt-6 rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-[13px] leading-5 text-admin-muted">This will mark the ticket as resolved and record the action in the support activity trail.</div><label className="mt-5 block"><span className="text-[14px] font-bold text-admin-ink">Resolution note <span className="font-medium text-admin-muted">(optional)</span></span><textarea name="reason" rows={4} placeholder="Add a resolution note" className="mt-2 w-full resize-none rounded-[8px] border border-admin-border px-4 py-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" /></label><div className="mt-6 flex justify-end gap-3 border-t border-admin-border pt-5"><Link href={"/support-management?ticket=" + ticket.id} className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Resolve ticket</button></div></form></div></div></div>;
}function SupportOverview({ showFilters, selectedTicket, showAttachment, showResolve, resolveError, resolveUpdated, attachmentAccess, tickets, summary, dataAvailable, total, page, pages, search }: { showFilters: boolean; selectedTicket?: SupportTicket; showAttachment: boolean; showResolve: boolean; resolveError: boolean; resolveUpdated: boolean; attachmentAccess: AdminSupportAttachmentAccess | null; tickets: SupportTicket[]; summary: AdminSupportSummary | null; dataAvailable: boolean; total: number; page: number; pages: number; search?: string }) {
  const statusTone = (status: SupportTicket["status"]): "neutral" | "warning" | "success" | "danger" | "info" => status === "Resolved" ? "success" : status === "New" ? "info" : status === "In progress" ? "warning" : status === "Closed" ? "neutral" : "danger";
  const pageHref = (nextPage: number) => "/support-management?" + new URLSearchParams({ ...(search ? { search } : {}), ...(nextPage > 1 ? { page: String(nextPage) } : {}) }).toString();
  return <main className="px-6 py-7 lg:px-8"><div><h2 className="text-[26px] font-bold text-admin-ink">Support Requests</h2><p className="mt-2 text-[16px] font-medium text-admin-muted">Manage and track support requests from Tracmedy users and hospitals.</p></div><section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard title="New submissions" value={summary ? summary.new.toString() : "--"} note="Needs attention" tone="orange" /><MetricCard title="In progress" value={summary ? summary.inProgress.toString() : "--"} note="Active work" /><MetricCard title="Awaiting user" value={summary ? summary.open.toString() : "--"} note="Waiting on user" tone="orange" /><MetricCard title="Resolved" value={summary ? summary.resolved.toString() : "--"} note="Completed" tone="green" /></section><section className="mt-8 overflow-hidden rounded-[10px] bg-white admin-panel-shadow"><div className="flex flex-col gap-4 px-5 py-7 xl:flex-row xl:items-center xl:justify-between"><form method="get" className="relative w-full max-w-[640px]"><span className="sr-only">Search support requests</span><SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-admin-muted" /><input name="search" defaultValue={search ?? ""} placeholder="Search by ticket, user, email, hospital, or issue..." className="h-14 w-full rounded-[8px] border border-admin-border bg-white pl-12 pr-4 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted focus:border-admin-blue" /></form><Link href="/support-management?filters=1" className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] border border-admin-border px-5 text-[14px] font-medium text-admin-muted"><span>Filters</span><FilterIcon className="h-5 w-5" /></Link></div>{!dataAvailable ? <SupportUnavailableState /> : tickets.length === 0 ? <EmptyRequestsState /> : <><div className="overflow-x-auto px-5"><table className="w-full min-w-[1180px] border-collapse text-left"><thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted"><tr><th className="px-5 py-4">Ticket ID</th><th className="px-5 py-4">User</th><th className="px-5 py-4">Source</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Issue</th><th className="px-5 py-4">Submitted</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Action</th></tr></thead><tbody className="text-[14px]">{tickets.map((ticket) => <tr key={ticket.id} className="border-b border-admin-border last:border-b-0"><td className="whitespace-nowrap px-5 py-5 font-medium text-admin-text">{ticket.ticketNumber}</td><td className="px-5 py-5"><p className="font-bold text-admin-ink">{ticket.requester}</p></td><td className="px-5 py-5"><StatusPill>{ticket.source}</StatusPill></td><td className="px-5 py-5 text-admin-text">{ticket.category}</td><td className="max-w-[260px] px-5 py-5 text-admin-text">{ticket.subject}</td><td className="whitespace-nowrap px-5 py-5 text-admin-text">{ticket.createdAt}</td><td className="px-5 py-5"><StatusPill tone={statusTone(ticket.status)}>{ticket.status}</StatusPill></td><td className="px-5 py-5"><Link href={"/support-management?ticket=" + ticket.id} className="inline-flex items-center gap-2 font-semibold text-admin-blue"><EyeActionIcon className="h-5 w-5" />View</Link></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-admin-border px-5 py-5 text-[14px] text-admin-muted"><span>Showing {tickets.length ? 1 : 0}-{tickets.length} of {total} Requests</span>{pages > 1 ? <div className="flex items-center gap-2"><Link href={pageHref(Math.max(1, page - 1))} aria-label="Previous page" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border"><ChevronLeftIcon className="h-5 w-5" /></Link><span className="px-2 font-bold text-admin-ink">{page}</span><Link href={pageHref(Math.min(pages, page + 1))} aria-label="Next page" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-blue text-admin-blue"><ChevronRightIcon className="h-5 w-5" /></Link></div> : null}</div></>}</section>{showFilters ? <FiltersPanel /> : null}{selectedTicket ? <SupportRequestDetailsPanel ticket={selectedTicket} /> : null}{showAttachment && selectedTicket ? <AttachmentPreviewPanel ticket={selectedTicket} access={attachmentAccess} /> : null}{showResolve && selectedTicket ? <ResolveTicketPanel ticket={selectedTicket} error={resolveError} updated={resolveUpdated} /> : null}</main>;
}

export default async function SupportManagementPage({ searchParams }: SupportPageProps) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const [ticketPage, summary] = await Promise.all([getAdminSupportTickets(token, { status: params.status, priority: params.priority, search: params.search, page: String(page), limit: "6" }), getAdminSupportSummary(token)]);
  const ticketRows = ticketPage?.items.map(toSupportTicket) ?? [];
  const listTicket = ticketRows.find((ticket) => ticket.id === params.ticket);
  const detailSource = params.ticket ? await getAdminSupportTicket(token, params.ticket) : null
  const selectedTicket = detailSource ? toSupportTicket(detailSource) : listTicket
  const attachmentAccess = params.ticket && params.attachmentId ? await getAdminSupportAttachmentUrl(token, params.ticket, params.attachmentId) : null
  return <SupportOverview showFilters={params.filters === "1"} selectedTicket={selectedTicket} showAttachment={params.attachment === "1"} showResolve={params.resolve === "1"} resolveError={params.error === "1"} resolveUpdated={params.updated === "1"} attachmentAccess={attachmentAccess} tickets={ticketRows} summary={summary} dataAvailable={ticketPage !== null && summary !== null} total={ticketPage?.total ?? 0} page={ticketPage?.page ?? page} pages={ticketPage?.pages ?? 1} search={params.search} />;
}

















