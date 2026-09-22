import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarIcon, CardIcon, HeartPulseIcon, HomeIcon, UserCheckIcon } from "@/components/admin/AdminIcons";
import { getAdminClinicalMonitoringOverview, type AdminClinicalMonitoringOverview, type AdminClinicalRecentActivity } from "@/lib/server/admin-clinical-monitoring";
import { getAdminSessionToken } from "@/lib/server/admin-overview";

type SearchParams = { view?: string; range?: string };
type Props = { searchParams: Promise<SearchParams> };
type MetricIcon = React.ReactNode;
const ranges = [{ key: "today", label: "Daily" }, { key: "7d", label: "Weekly" }, { key: "30d", label: "Monthly" }, { key: "90d", label: "All Time" }];

function formatCount(value: number): string { return new Intl.NumberFormat("en-US").format(value); }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 16).replace("T", " "); }
function labelValue(value: string): string { return value.split(/[_-]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }
function roleCount(overview: AdminClinicalMonitoringOverview, role: string): number { return overview.userDistribution.byRole.find((item) => item.key === role)?.count ?? 0; }
function eventTypeCount(events: AdminClinicalRecentActivity[], words: string[]): number { return events.filter((event) => words.some((word) => event.type.toLowerCase().includes(word) || event.label.toLowerCase().includes(word))).length; }
function trend(value: number | null): string { return value === null ? "No Data" : (value > 0 ? "+" : "") + value.toFixed(1) + "%"; }

function MetricCard({ title, value, trendValue, icon, tone }: { title: string; value: string; trendValue: string; icon: MetricIcon; tone: "blue" | "green" | "red" }) {
  const trendClass = trendValue.startsWith("-") ? "bg-admin-red-soft text-admin-red" : trendValue === "No Data" ? "bg-admin-neutral-soft text-admin-muted" : "bg-admin-green-soft text-admin-success";
  const iconClass = tone === "green" ? "bg-admin-green-soft text-admin-success" : tone === "red" ? "bg-admin-red-soft text-admin-red" : "bg-admin-blue-soft text-admin-blue";
  return <article className="rounded-[10px] border border-admin-border bg-white px-6 py-6 admin-panel-shadow"><div className={["grid h-12 w-12 place-items-center rounded-[10px]", iconClass].join(" ")}>{icon}</div><p className="mt-4 text-[11px] font-bold uppercase tracking-[0.04em] text-admin-ink/80">{title}</p><div className="mt-4 flex items-center justify-between gap-3"><p className="text-[24px] font-bold leading-none text-admin-ink">{value}</p><span className={["rounded-full px-2 py-1 text-[10px] font-bold", trendClass].join(" ")}>{trendValue}</span></div></article>;
}
function Filters({ view, range, activities, facilities }: { view: string; range: string; activities: string[]; facilities: string[] }) {
  return <section className="rounded-[10px] border border-admin-border bg-white px-6 py-6 admin-panel-shadow"><div className="grid gap-6 lg:grid-cols-3"><label className="block"><span className="text-[13px] font-bold text-admin-ink">Facilities</span><select name="facility" defaultValue="" className="mt-4 h-11 w-full rounded-[8px] border border-admin-border bg-white px-4 text-[13px] text-admin-muted outline-none"><option value="">All facilities</option>{facilities.map((facility) => <option key={facility} value={facility}>{facility}</option>)}</select></label><label className="block"><span className="text-[13px] font-bold text-admin-ink">Activities</span><select name="activity" defaultValue="" className="mt-4 h-11 w-full rounded-[8px] border border-admin-border bg-white px-4 text-[13px] text-admin-muted outline-none"><option value="">All Activities</option>{activities.map((activity) => <option key={activity} value={activity}>{activity}</option>)}</select></label><label className="block"><span className="text-[13px] font-bold text-admin-ink">Date Range</span><div className="relative mt-4"><input type="date" name="dateRange" aria-label="Date Range" className="h-11 w-full rounded-[8px] border border-admin-border bg-white px-4 pr-12 text-[13px] text-admin-muted outline-none" /></div></label></div><input type="hidden" name="view" value={view} /><input type="hidden" name="range" value={range} /></section>;
}
function ActivityTabs({ view, range }: { view: string; range: string }) {
  return <div className="flex items-center gap-6 border-b border-admin-border px-6 pt-5"><Link href={{ pathname: "/clinical-monitoring", query: { view: "patients", range } }} className={["relative pb-4 text-[12px] font-bold", view === "patients" ? "text-admin-blue after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-admin-blue" : "text-admin-muted"].join(" ")}><span aria-hidden="true" className="mr-3 text-[10px]">.</span>Patient Activity</Link><Link href={{ pathname: "/clinical-monitoring", query: { view: "facilities", range } }} className={["relative pb-4 text-[12px] font-bold", view === "facilities" ? "text-admin-blue after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-admin-blue" : "text-admin-muted"].join(" ")}><span aria-hidden="true" className="mr-3 text-[10px]">.</span>Facility Activity</Link></div>;
}
function PatientLog({ events }: { events: AdminClinicalRecentActivity[] }) {
  const rows = events.filter((event) => event.subjectType === "user" || event.type.includes("user") || event.type.includes("patient"));
  return <LogTable title="Patient Activity Events Log" headers={["Event ID", "Activity Type", "Date & Time"]} rows={rows.map((event) => [event.eventCode ?? "--", event.label, formatDate(event.timestamp)])} emptyLabel="No patient activity available." />;
}
function FacilityLog({ overview }: { overview: AdminClinicalMonitoringOverview }) {
  const facilities = new Map(overview.topFacilities.map((facility) => [facility.facilityId, facility.name]));
  const rows = overview.recentActivity.filter((event) => event.subjectType === "facility" || event.type.includes("facility")).map((event) => [event.eventCode ?? "--", facilities.get(event.subjectId ?? "") ?? "--", event.label, formatDate(event.timestamp)]);
  return <LogTable title="Facility Activity Monitoring Log" headers={["Event ID", "Facility Name", "Activity Type", "Date & Time"]} rows={rows} emptyLabel="No facility activity available." />;
}
function LogTable({ title, headers, rows, emptyLabel }: { title: string; headers: string[]; rows: string[][]; emptyLabel: string }) {
  return <section className="overflow-hidden rounded-[10px] border border-admin-border bg-white admin-panel-shadow"><div className="px-6 py-6"><h2 className="text-[17px] font-bold text-admin-ink">{title}</h2><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="bg-admin-table-head text-[11px] font-medium uppercase text-admin-ink/80"><tr>{headers.map((header) => <th key={header} className="px-4 py-4">{header}</th>)}</tr></thead><tbody className="text-[12px] text-admin-ink">{rows.length ? rows.map((row, index) => <tr key={row[0] + index} className="border-b border-admin-border last:border-b-0">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="px-5 py-12 text-center text-[12px] text-admin-muted">{emptyLabel}</td></tr>}</tbody></table></div><div className="flex items-center justify-between border-t border-admin-border pt-4 text-[11px] text-admin-muted"><span>Showing {rows.length ? "1-" + rows.length : "0"} of {rows.length} {headers.length === 3 ? "Patient Activity" : "Facility Activity"}</span><div className="flex items-center gap-5 text-admin-ink"><button type="button" disabled className="text-admin-muted">&lt;</button><span className="grid h-9 w-9 place-items-center rounded-[8px] bg-admin-blue font-bold text-white">1</span><span>2</span><span>3</span><span>...</span><span>29</span><button type="button" className="grid h-9 w-9 place-items-center rounded-[8px] border border-admin-blue text-admin-blue">&gt;</button></div></div></div></section>;
}
function Cards({ overview }: { overview: AdminClinicalMonitoringOverview }) {
  const events = overview.recentActivity;
  const caregivers = roleCount(overview, "caregiver");
  const values = [
    ["Caregivers Added", caregivers ? formatCount(caregivers) : "--", trend(caregivers ? null : null), <UserCheckIcon key="caregivers" className="h-8 w-8" />, "blue"],
    ["Medications Logged", eventTypeCount(events, ["medication"]) ? formatCount(eventTypeCount(events, ["medication"])) : "--", "No Data", <CardIcon key="medications" className="h-8 w-8" />, "blue"],
    ["Health Reports", "--", "No Data", <HeartPulseIcon key="health-reports" className="h-8 w-8" />, "red"],
    ["Medical Records", "--", "No Data", <CardIcon key="medical-records" className="h-8 w-8" />, "blue"],
    ["Symptoms Tracked", "--", "No Data", <HeartPulseIcon key="symptoms" className="h-8 w-8" />, "blue"],
    ["Care Episodes", "--", "No Data", <HomeIcon key="care-episodes" className="h-8 w-8" />, "blue"],
    ["Appointments Booked", "--", "No Data", <CalendarIcon key="appointments" className="h-8 w-8" />, "blue"],
  ] as const;
  return <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{values.map(([title, value, trendValue, icon, tone]) => <MetricCard key={title} title={title} value={value} trendValue={trendValue} icon={icon} tone={tone} />)}</section>;
}
export default async function ClinicalMonitoringPage({ searchParams }: Props) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const params = await searchParams;
  const view = params.view === "facilities" ? "facilities" : "patients";
  const range = ranges.some((item) => item.key === params.range) ? params.range! : "today";
  const overview = await getAdminClinicalMonitoringOverview(token, { range, metric: view === "facilities" ? "facility_growth" : "user_growth" });
  const activities = overview?.recentActivity.map((event) => labelValue(event.type)) ?? [];
  const facilities = overview?.topFacilities.map((facility) => facility.name) ?? [];
  return <main className="px-6 py-7 lg:px-8"><div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between"><div><h1 className="text-[28px] font-bold text-admin-ink">Clinical Monitoring</h1><p className="mt-2 text-[16px] text-admin-muted">Real-time view of patient and facility clinical activity</p></div><div className="flex rounded-[10px] bg-admin-blue-soft p-1.5">{ranges.map((item) => <Link key={item.key} href={{ pathname: "/clinical-monitoring", query: { view, range: item.key } }} className={["rounded-[8px] px-5 py-2.5 text-[12px] font-bold", range === item.key ? "bg-white text-admin-blue shadow-sm" : "text-admin-ink"].join(" ")}>{item.label}</Link>)}</div></div><div className="mt-9"><Filters view={view} range={range} activities={[...new Set(activities)]} facilities={[...new Set(facilities)]} /></div>{overview ? <><div className="mt-9"><Cards overview={overview} /></div><div className="mt-12"><section className="overflow-hidden rounded-[10px] border border-admin-border bg-white admin-panel-shadow"><ActivityTabs view={view} range={range} /><div className="px-6 py-6"><h2 className="text-[17px] font-bold text-admin-ink">{view === "patients" ? "Patient Activity Events Log" : "Facility Activity Monitoring Log"}</h2><div className="mt-9">{view === "patients" ? <PatientLog events={overview.recentActivity} /> : <FacilityLog overview={overview} />}</div></div></section></div></> : <section className="mt-9 grid min-h-[300px] place-items-center rounded-[10px] border border-admin-border bg-white text-[14px] text-admin-muted">Clinical Monitoring data is unavailable.</section>}</main>;
}