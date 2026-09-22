import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, ClipboardIcon, CloseIcon, DownloadIcon, EyeActionIcon } from "@/components/admin/AdminIcons";
import { getAdminSessionToken } from "@/lib/server/admin-overview";
import { AUDIT_MODULES, getAdminAuditLog, getAdminAuditLogs, type AdminAuditLog } from "@/lib/server/admin-audit";

type SearchParams = { log?: string; module?: string; actorId?: string; action?: string; from?: string; to?: string; facilityId?: string; page?: string };
type Props = { searchParams: Promise<SearchParams> };

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const valueOrDash = (value: string | null | undefined) => value?.trim() || "--";
const formatDate = (value: string) => new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
function target(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    const type = typeof item.type === "string" ? item.type : "";
    const id = typeof item.id === "string" ? item.id : "";
    if (type || id) return [type, id].filter(Boolean).join(" / ");
  }
  return value ? "Recorded event" : "--";
}
function href(params: SearchParams, page: number): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (key !== "page" && value) query.set(key, value);
  if (page > 1) query.set("page", String(page));
  return "/audit-logs?" + query.toString();
}
function localDateTimeValue(value: string | undefined): string {
  return value ? value.slice(0, 16) : "";
}
function apiDateValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
function Filters({ params }: { params: SearchParams }) {
  return <form method="get" className="grid gap-3 border-b border-admin-border px-4 py-4 xl:grid-cols-[minmax(220px,1fr)_155px_155px_130px_150px_80px] xl:items-center">
    <label className="relative"><span className="sr-only">Search by actor ID</span><input name="actorId" defaultValue={params.actorId ?? ""} placeholder="Search by actor ID..." className="h-10 w-full rounded-[8px] border border-admin-border bg-white pl-3 pr-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue" /></label>
    <label><span className="sr-only">Date range start</span><input name="from" type="datetime-local" defaultValue={localDateTimeValue(params.from)} aria-label="From date and time" className="h-10 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted" /></label>
    <label><span className="sr-only">Date range end</span><input name="to" type="datetime-local" defaultValue={localDateTimeValue(params.to)} aria-label="To date and time" className="h-10 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted" /></label>
    <label><span className="sr-only">Filter by action</span><input name="action" defaultValue={params.action ?? ""} placeholder="Action" className="h-10 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted outline-none focus:border-admin-blue" /></label>
    <label><span className="sr-only">Filter by module</span><select name="module" defaultValue={params.module ?? ""} className="h-10 w-full rounded-[8px] border border-admin-border bg-white px-3 text-[14px] text-admin-muted"><option value="">All Modules</option>{AUDIT_MODULES.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label>
    <button type="submit" className="h-10 justify-self-start rounded-[8px] bg-admin-blue px-5 text-[14px] font-bold text-white xl:mr-1">Apply</button>
  </form>;
}
function Table({ rows }: { rows: AdminAuditLog[] }) {
  if (!rows.length) return <div className="grid min-h-[300px] place-items-center px-6 text-center"><div><ClipboardIcon className="mx-auto h-10 w-10 text-admin-neutral" /><h3 className="mt-4 text-[20px] font-bold">No audit events found</h3><p className="mt-2 text-[14px] text-admin-muted">No events match the current filters.</p></div></div>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[1260px] text-left"><thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted"><tr><th className="px-5 py-4">Log ID</th><th className="px-5 py-4">Admin Name</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Module</th><th className="px-5 py-4">Action</th><th className="px-5 py-4">Timestamp</th><th className="px-5 py-4">IP Address</th><th className="px-5 py-4">Action</th></tr></thead><tbody className="text-[14px]">{rows.map((row) => <tr key={row.id} className="border-b border-admin-border"><td className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap px-5 py-5 font-medium text-admin-text" title={row.actorId ?? undefined}>{valueOrDash(row.actorId)}</td><td className="px-5 py-5 font-bold text-admin-ink">{valueOrDash(row.actorName)}</td><td className="px-5 py-5 text-admin-text">{valueOrDash(row.actorRole)}</td><td className="px-5 py-5 text-admin-text">{label(row.module)}</td><td className="px-5 py-5"><p className="font-semibold text-admin-ink">{row.action}</p><p className="mt-1 text-[12px] text-admin-muted">{target(row.targetEntity)}</p></td><td className="whitespace-nowrap px-5 py-5 text-admin-text">{formatDate(row.createdAt)}</td><td className="px-5 py-5 text-admin-text">{valueOrDash(row.ipAddress)}</td><td className="px-5 py-5"><Link href={"/audit-logs?log=" + row.id} className="inline-flex items-center gap-2 font-semibold text-admin-blue"><EyeActionIcon className="h-5 w-5" />View</Link></td></tr>)}</tbody></table></div>;
}
function AuditDetails({ audit }: { audit: AdminAuditLog | null }) {
  return <div className="fixed inset-0 z-30 grid place-items-center bg-admin-ink/40 p-4 backdrop-blur-[4px] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="audit-detail-title"><div className="flex max-h-[90dvh] w-full max-w-[800px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl"><header className="flex items-start justify-between gap-4 px-6 py-7 sm:px-8"><div><h2 id="audit-detail-title" className="text-[24px] font-bold text-admin-ink">Audit Log Details</h2><p className="mt-1 text-[16px] text-admin-muted">{audit ? "Full record for log entry " + valueOrDash(audit.actorId) : "Audit event unavailable"}</p></div><Link href="/audit-logs" aria-label="Close audit event details" className="grid h-10 w-10 place-items-center text-[26px] leading-none text-admin-ink"><CloseIcon className="h-6 w-6" /></Link></header>{audit ? <><dl className="grid gap-x-10 gap-y-6 px-6 pb-8 sm:grid-cols-2 sm:px-8"><div><dt className="text-[14px] text-admin-muted">Admin</dt><dd className="mt-2 text-[16px] font-semibold text-admin-ink">{valueOrDash(audit.actorName)}</dd></div><div><dt className="text-[14px] text-admin-muted">Role</dt><dd className="mt-2 text-[16px] font-semibold text-admin-ink">{valueOrDash(audit.actorRole)}</dd></div><div><dt className="text-[14px] text-admin-muted">Module</dt><dd className="mt-2 text-[16px] font-semibold text-admin-ink">{label(audit.module)}</dd></div><div><dt className="text-[14px] text-admin-muted">Log ID</dt><dd className="mt-2 break-all text-[16px] text-admin-ink">{valueOrDash(audit.actorId)}</dd></div><div className="sm:col-span-2"><dt className="text-[14px] text-admin-muted">Action</dt><dd className="mt-2 text-[16px] font-semibold text-admin-ink">{audit.action}</dd></div><div className="sm:col-span-2"><dt className="text-[14px] text-admin-muted">Target</dt><dd className="mt-2 text-[16px] text-admin-ink">{target(audit.targetEntity)}</dd></div><div><dt className="text-[14px] text-admin-muted">Timestamp</dt><dd className="mt-2 text-[16px] text-admin-ink">{formatDate(audit.createdAt)}</dd></div><div><dt className="text-[14px] text-admin-muted">IP Address</dt><dd className="mt-2 text-[16px] text-admin-ink">{valueOrDash(audit.ipAddress)}</dd></div>{audit.facilityId ? <div className="sm:col-span-2"><dt className="text-[14px] text-admin-muted">Facility ID</dt><dd className="mt-2 break-all text-[16px] text-admin-ink">{audit.facilityId}</dd></div> : null}{audit.metadata && typeof audit.metadata === "object" && Object.keys(audit.metadata as object).length ? <div className="sm:col-span-2"><dt className="text-[14px] text-admin-muted">Metadata</dt><dd className="mt-2 overflow-x-auto rounded-[8px] bg-admin-soft p-3 text-[12px] text-admin-ink"><pre>{JSON.stringify(audit.metadata, null, 2)}</pre></dd></div> : null}</dl><footer className="flex justify-end border-t border-admin-border px-6 py-5 sm:px-8"><Link href="/audit-logs" className="px-3 py-2 text-[16px] font-bold text-admin-ink">Cancel</Link></footer></> : <div className="grid min-h-[300px] place-items-center px-6 text-center"><div><h3 className="text-[20px] font-bold">Audit event unavailable</h3><p className="mt-2 text-[14px] text-admin-muted">The selected audit event could not be loaded.</p></div></div>}</div></div>;
}
function Pagination({ params, page, pages }: { params: SearchParams; page: number; pages: number }) {
  if (pages <= 1) return null;
  return <div className="flex items-center justify-between border-t border-admin-border px-5 py-4"><span className="text-[13px] text-admin-muted">Page {page} of {pages}</span><div className="flex gap-2"><Link aria-label="Previous page" href={href(params, page - 1)} className={["grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border", page === 1 ? "pointer-events-none opacity-40" : "text-admin-blue"].join(" ")}><ChevronLeftIcon className="h-5 w-5" /></Link><Link aria-label="Next page" href={href(params, page + 1)} className={["grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border", page === pages ? "pointer-events-none opacity-40" : "text-admin-blue"].join(" ")}><ChevronRightIcon className="h-5 w-5" /></Link></div></div>;
}
export default async function AuditLogsPage({ searchParams }: Props) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const query = { module: params.module, actorId: params.actorId, action: params.action, from: apiDateValue(params.from), to: apiDateValue(params.to), facilityId: params.facilityId, page, limit: 20 };
  const result = await getAdminAuditLogs(token, query);
  const detail = params.log ? await getAdminAuditLog(token, params.log) : null;
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== undefined && key !== "page" && key !== "limit") exportParams.set(key, String(value));
  exportParams.set("format", "csv");
  return <main className="px-6 py-7 lg:px-8"><div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div><p className="text-[13px] font-bold uppercase text-admin-muted">Audit Logs</p><h2 className="mt-2 text-[26px] font-bold">Audit Logs</h2><p className="mt-2 text-[16px] text-admin-muted">Track all administrative actions for accountability</p></div><div className="flex items-center gap-3"><span className={["rounded-full px-3 py-1.5 text-[12px] font-bold", result ? "bg-admin-green-soft text-admin-success" : "bg-admin-warning-soft text-admin-warning"].join(" ")}>{result ? "Connected" : "Unavailable"}</span><a href={"/api/admin/audit-logs/export?" + exportParams.toString()} className="inline-flex items-center gap-2 rounded-[8px] bg-admin-blue px-4 py-3 text-[14px] font-bold text-white"><DownloadIcon className="h-4 w-4" />Export</a></div></div><section className="mt-7 overflow-hidden rounded-[10px] bg-white admin-panel-shadow"><Filters params={params} />{result ? <Table rows={result.data} /> : <div className="grid min-h-[300px] place-items-center text-center"><div><h3 className="text-[20px] font-bold">Audit logs unavailable</h3><p className="mt-2 text-[14px] text-admin-muted">The admin audit endpoint could not be loaded.</p></div></div>}{result ? <Pagination params={params} page={result.page} pages={result.pages} /> : null}</section>{params.log ? <AuditDetails audit={detail} /> : null}</main>;
}