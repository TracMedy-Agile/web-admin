import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeIcon, SettingsIcon, ShieldIcon } from "@/components/admin/AdminIcons";
import { getAdminSessionToken } from "@/lib/server/admin-overview";
import { getAdminSettingRevisions, getAdminSettings, updateAdminSettings, type AdminPolicyRevision, type AdminSettings } from "@/lib/server/admin-settings";
import { revalidatePath } from "next/cache";

type SearchParams = { section?: string; error?: string; saved?: string };
type Props = { searchParams: Promise<SearchParams> };
type Section = "general" | "security" | "home_care" | "integrations" | "platform_info" | "revisions";

function stringSetting(settings: Record<string, unknown>, key: string, fallback = ""): string {
  const value = settings[key];
  return typeof value === "string" ? value : fallback;
}
function numberSetting(settings: Record<string, unknown>, key: string, fallback: number): number {
  const value = settings[key];
  return typeof value === "number" ? value : fallback;
}
function boolSetting(settings: Record<string, unknown>, key: string): boolean {
  return settings[key] === true;
}
function numberField(form: FormData, key: string, fallback: number): number {
  const value = Number(form.get(key));
  return Number.isFinite(value) ? value : fallback;
}

async function saveSettingsAction(form: FormData): Promise<void> {
  "use server";
  const section = form.get("section");
  if (section !== "general" && section !== "security" && section !== "home_care" && section !== "integrations") redirect("/settings?error=1");
  const reasonValue = form.get("reason");
  const reason = typeof reasonValue === "string" ? reasonValue.trim() : "";
  const changes = section === "general"
    ? [
        { section, key: "platform_name", value: String(form.get("platform_name") ?? "").trim(), reason },
        { section, key: "support_email", value: String(form.get("support_email") ?? "").trim(), reason },
        { section, key: "maintenance_mode", value: form.get("maintenance_mode") === "on", reason },
        { section, key: "caregiver_alert_fatigue_hours", value: numberField(form, "caregiver_alert_fatigue_hours", 24), reason },
      ]
    : section === "security"
    ? [
        { section, key: "password_min_length", value: numberField(form, "password_min_length", 8), reason },
        { section, key: "otp_max_attempts", value: numberField(form, "otp_max_attempts", 5), reason },
        { section, key: "otp_expiry_seconds", value: numberField(form, "otp_expiry_seconds", 300), reason },
        { section, key: "jwt_access_minutes", value: numberField(form, "jwt_access_minutes", 15), reason },
        { section, key: "password_history_count", value: numberField(form, "password_history_count", 3), reason },
        { section, key: "session_timeout_minutes", value: numberField(form, "session_timeout_minutes", 1440), reason },
      ]
    : section === "home_care"
    ? [
        { section, key: "radius_km", value: numberField(form, "radius_km", 20), reason },
        { section, key: "payout_hold_value", value: numberField(form, "payout_hold_value", 3), reason },
        { section, key: "payout_hold_unit", value: String(form.get("payout_hold_unit") ?? "DAYS"), reason },
        { section, key: "payout_hold_until_distance_km", value: numberField(form, "payout_hold_until_distance_km", 5), reason },
        { section, key: "verification_level", value: String(form.get("verification_level") ?? "basic"), reason },
        { section, key: "cost_split_patient_percent", value: numberField(form, "cost_split_patient_percent", 100), reason },
      ]
    : [
        { section, key: "one_signal_app_id", value: String(form.get("one_signal_app_id") ?? "").trim(), reason },
        { section, key: "posthog_events_enabled", value: form.get("posthog_events_enabled") === "on", reason },
      ];
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const message = await updateAdminSettings(token, changes);
  if (!message) redirect("/settings?section=" + section + "&error=1");
  revalidatePath("/settings");
  redirect("/settings?section=" + section + "&saved=1");
}

function Notice({ error, saved }: { error: boolean; saved: boolean }) {
  if (error) return <div className="rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[13px] text-admin-red">Unable to save these settings. Check the values and your access level.</div>;
  if (saved) return <div className="rounded-[8px] border border-admin-green/30 bg-admin-green-soft px-4 py-3 text-[13px] text-admin-success">Settings saved successfully.</div>;
  return null;
}
function Field({ label, name, defaultValue, type = "text", min, step }: { label: string; name: string; defaultValue: string | number; type?: string; min?: number; step?: number }) {
  return <label className="block"><span className="text-[14px] font-bold text-admin-ink">{label}</span><input required name={name} type={type} min={min} step={step} defaultValue={defaultValue} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border px-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue focus:ring-4 focus:ring-admin-blue/10" /></label>;
}
function GeneralForm({ settings, error, saved }: { settings: Record<string, unknown>; error: boolean; saved: boolean }) {
  return <form action={saveSettingsAction} className="space-y-6"><input type="hidden" name="section" value="general" /><Notice error={error} saved={saved} /><div className="grid gap-5 md:grid-cols-2"><Field label="Platform name" name="platform_name" defaultValue={stringSetting(settings, "platform_name", "Tracmedy")} /><Field label="Support email" name="support_email" type="email" defaultValue={stringSetting(settings, "support_email")} /><Field label="Caregiver alert fatigue window (hours)" name="caregiver_alert_fatigue_hours" type="number" min={1} defaultValue={numberSetting(settings, "caregiver_alert_fatigue_hours", 24)} /></div><label className="flex items-center gap-3 rounded-[8px] border border-admin-border px-4 py-4 text-[14px] font-semibold text-admin-ink"><input type="checkbox" name="maintenance_mode" defaultChecked={boolSetting(settings, "maintenance_mode")} className="h-4 w-4 accent-admin-blue" />Enable maintenance mode</label><ReasonField /><SaveActions /></form>;
}
function SecurityForm({ settings, error, saved }: { settings: Record<string, unknown>; error: boolean; saved: boolean }) {
  return <form action={saveSettingsAction} className="space-y-6"><input type="hidden" name="section" value="security" /><Notice error={error} saved={saved} /><div className="grid gap-5 md:grid-cols-2"><Field label="Minimum password length" name="password_min_length" type="number" min={8} defaultValue={numberSetting(settings, "password_min_length", 8)} /><Field label="Maximum OTP attempts" name="otp_max_attempts" type="number" min={1} defaultValue={numberSetting(settings, "otp_max_attempts", 5)} /><Field label="OTP expiry (seconds)" name="otp_expiry_seconds" type="number" min={1} defaultValue={numberSetting(settings, "otp_expiry_seconds", 300)} /><Field label="JWT access duration (minutes)" name="jwt_access_minutes" type="number" min={1} defaultValue={numberSetting(settings, "jwt_access_minutes", 15)} /><Field label="Password history count" name="password_history_count" type="number" min={0} defaultValue={numberSetting(settings, "password_history_count", 3)} /><Field label="Session timeout (minutes)" name="session_timeout_minutes" type="number" min={1} defaultValue={numberSetting(settings, "session_timeout_minutes", 1440)} /></div><ReasonField /><SaveActions /></form>;
}
function HomeCareForm({ settings, error, saved }: { settings: Record<string, unknown>; error: boolean; saved: boolean }) {
  return <form action={saveSettingsAction} className="space-y-6"><input type="hidden" name="section" value="home_care" /><Notice error={error} saved={saved} /><div className="grid gap-5 md:grid-cols-2"><Field label="Provider radius (km)" name="radius_km" type="number" min={1} defaultValue={numberSetting(settings, "radius_km", 20)} /><Field label="Payout hold value" name="payout_hold_value" type="number" min={1} defaultValue={numberSetting(settings, "payout_hold_value", 3)} /><label><span className="text-[14px] font-bold text-admin-ink">Payout hold unit</span><select name="payout_hold_unit" defaultValue={stringSetting(settings, "payout_hold_unit", "DAYS")} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border px-3 text-[14px]"><option value="DAYS">Days</option><option value="HOURS">Hours</option></select></label><Field label="Hold until distance (km)" name="payout_hold_until_distance_km" type="number" min={0} defaultValue={numberSetting(settings, "payout_hold_until_distance_km", 5)} /><label><span className="text-[14px] font-bold text-admin-ink">Verification level</span><select name="verification_level" defaultValue={stringSetting(settings, "verification_level", "basic")} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border px-3 text-[14px]"><option value="basic">Basic</option><option value="enhanced">Enhanced</option></select></label><Field label="Patient cost split (%)" name="cost_split_patient_percent" type="number" min={0} defaultValue={numberSetting(settings, "cost_split_patient_percent", 100)} /></div><ReasonField /><SaveActions /></form>;
}
function IntegrationsForm({ settings, error, saved }: { settings: Record<string, unknown>; error: boolean; saved: boolean }) {
  return <form action={saveSettingsAction} className="space-y-6"><input type="hidden" name="section" value="integrations" /><Notice error={error} saved={saved} /><Field label="OneSignal app ID" name="one_signal_app_id" defaultValue={stringSetting(settings, "one_signal_app_id")} /><label className="flex items-center gap-3 rounded-[8px] border border-admin-border px-4 py-4 text-[14px] font-semibold text-admin-ink"><input type="checkbox" name="posthog_events_enabled" defaultChecked={boolSetting(settings, "posthog_events_enabled")} className="h-4 w-4 accent-admin-blue" />Enable PostHog events</label><div className="rounded-[8px] border border-admin-border bg-admin-soft px-4 py-4"><p className="text-[12px] font-bold uppercase text-admin-muted">Paystack webhook secret</p><p className="mt-1 text-[14px] text-admin-ink">{stringSetting(settings, "paystack_webhook_secret_changed_at", "Not configured")}</p><p className="mt-1 text-[13px] text-admin-muted">Managed by the backend integration flow.</p></div><ReasonField /><SaveActions /></form>;
}
function PlatformInfo({ settings }: { settings: Record<string, unknown> }) {
  const values = [
    ["Version", stringSetting(settings, "version", "--")],
    ["Environment", stringSetting(settings, "environment", "--")],
    ["Support phone", stringSetting(settings, "support_phone", "--")],
    ["Admin email", stringSetting(settings, "admin_email", "--")],
  ];
  return <section className="rounded-[10px] bg-white px-6 py-7 admin-panel-shadow"><div className="mb-6"><div className="flex items-center gap-3"><SettingsIcon className="h-5 w-5 text-admin-ink" /><h3 className="text-[18px] font-bold text-admin-ink">Platform Information</h3></div><p className="mt-1 text-[14px] text-admin-muted">Read-only system information.</p></div><dl>{values.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-6 border-b border-admin-border py-4 last:border-b-0"><dt className="text-[14px] text-admin-muted">{label}</dt><dd className="text-[15px] font-semibold text-admin-ink">{value}</dd></div>)}</dl></section>;
}
function ReasonField() {
  return <label className="block"><span className="text-[14px] font-bold text-admin-ink">Change reason <span className="font-medium text-admin-muted">(optional)</span></span><textarea name="reason" rows={3} placeholder="Describe why these settings are changing" className="mt-2 w-full resize-none rounded-[8px] border border-admin-border px-3 py-3 text-[14px] text-admin-ink outline-none focus:border-admin-blue focus:ring-4 focus:ring-admin-blue/10" /></label>;
}
function SaveActions() {
  return <div className="flex justify-end border-t border-admin-border pt-5"><button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Save settings</button></div>;
}
function Revisions({ revisions }: { revisions: { data: AdminPolicyRevision[]; total: number; pages: number } | null }) {
  if (!revisions) return <SettingsUnavailable />;
  if (!revisions.data.length) return <div className="rounded-[10px] border border-admin-border bg-white px-6 py-12 text-center admin-panel-shadow"><h3 className="text-[20px] font-bold text-admin-ink">No policy revisions found</h3><p className="mt-2 text-[14px] text-admin-muted">Changes will appear here after settings are updated.</p></div>;
  return <section className="overflow-hidden rounded-[10px] bg-white admin-panel-shadow"><div className="border-b border-admin-border px-6 py-5"><h3 className="text-[18px] font-bold text-admin-ink">Policy revisions</h3><p className="mt-1 text-[14px] text-admin-muted">{revisions.total} recorded changes</p></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted"><tr><th className="px-5 py-4">Changed</th><th className="px-5 py-4">Section</th><th className="px-5 py-4">Setting</th><th className="px-5 py-4">Previous value</th><th className="px-5 py-4">New value</th><th className="px-5 py-4">Reason</th></tr></thead><tbody className="text-[14px]">{revisions.data.map((revision) => <tr key={revision.id} className="border-b border-admin-border"><td className="whitespace-nowrap px-5 py-5 text-admin-muted">{new Date(revision.changedAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-5 py-5 font-semibold text-admin-ink">{revision.section}</td><td className="px-5 py-5 text-admin-ink">{revision.settingKey}</td><td className="max-w-[180px] px-5 py-5 text-admin-muted">{JSON.stringify(revision.previousValue)}</td><td className="max-w-[180px] px-5 py-5 text-admin-muted">{JSON.stringify(revision.newValue)}</td><td className="max-w-[220px] px-5 py-5 text-admin-muted">{revision.reason || "--"}</td></tr>)}</tbody></table></div></section>;
}
function SettingsUnavailable() {
  return <div className="grid min-h-[300px] place-items-center rounded-[8px] border border-admin-border bg-white px-6 text-center"><div><SettingsIcon className="mx-auto h-10 w-10 text-admin-neutral" /><h3 className="mt-4 text-[20px] font-bold text-admin-ink">Settings unavailable</h3><p className="mt-2 text-[14px] text-admin-muted">The admin settings endpoint could not be loaded.</p></div></div>;
}
export default async function SettingsPage({ searchParams }: Props) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const params = await searchParams;
  const section: Section = params.section === "security" ? "security" : params.section === "home_care" ? "home_care" : params.section === "integrations" ? "integrations" : params.section === "platform_info" ? "platform_info" : params.section === "revisions" ? "revisions" : "general";
  const result: AdminSettings | null = await getAdminSettings(token);
  const revisions = section === "revisions" ? await getAdminSettingRevisions(token) : null;
  const sectionSettings = result?.data[section] ?? {};
  const editable = result?.editableSections.includes(section) ?? false;
  const error = params.error === "1";
  const saved = params.saved === "1";
  const tabClass = (active: boolean) => ["flex items-center gap-4 px-7 py-5 text-[14px] font-bold", active ? "bg-admin-blue-soft text-admin-blue" : "text-admin-ink"].join(" ");
  const content = section === "revisions" ? <Revisions revisions={revisions} /> : section === "platform_info" ? <PlatformInfo settings={sectionSettings} /> : !result ? <SettingsUnavailable /> : !editable ? <div className="rounded-[8px] border border-admin-danger/20 bg-admin-danger-soft px-5 py-4 text-[14px] text-admin-danger">You do not have permission to edit this settings section.</div> : <section className="rounded-[10px] bg-white px-6 py-7 admin-panel-shadow"><div className="mb-6 border-b border-admin-border pb-5"><h3 className="text-[18px] font-bold text-admin-ink">{section === "general" ? "Platform Details" : section === "security" ? "Security settings" : section === "home_care" ? "Home Care settings" : "System & Integration"}</h3><p className="mt-1 text-[14px] text-admin-muted">{section === "general" ? "Core platform identity and contact information." : section === "security" ? "Configure authentication and session policy defaults." : section === "home_care" ? "Configure provider coverage, payout holds, and verification policy." : "Read-only summary of platform integrations."}</p></div>{section === "general" ? <GeneralForm settings={sectionSettings} error={error} saved={saved} /> : section === "security" ? <SecurityForm settings={sectionSettings} error={error} saved={saved} /> : section === "home_care" ? <HomeCareForm settings={sectionSettings} error={error} saved={saved} /> : <IntegrationsForm settings={sectionSettings} error={error} saved={saved} />}</section>;
  return <main className="px-6 py-7 lg:px-8"><header className="border-b border-admin-border pb-7"><h2 className="text-[26px] font-bold text-admin-ink">Settings</h2><p className="mt-2 text-[16px] text-admin-muted">Platform-wide configuration, security, and system information</p></header><div className="mt-7 grid gap-0 xl:grid-cols-[300px_minmax(0,1fr)]"><aside className="overflow-hidden rounded-[8px] bg-white admin-panel-shadow"><Link href="/settings?section=general" className={tabClass(section === "general")}><SettingsIcon className="h-6 w-6" />General</Link><Link href="/settings?section=security" className={tabClass(section === "security")}><ShieldIcon className="h-6 w-6" />Security</Link><Link href="/settings?section=home_care" className={tabClass(section === "home_care")}><HomeIcon className="h-6 w-6" />Home Care</Link><Link href="/settings?section=integrations" className={tabClass(section === "integrations")}><span className="text-[22px] leading-none">&lt;/&gt;</span>System &amp; Integrations</Link><Link href="/settings?section=platform_info" className={tabClass(section === "platform_info")}><span className="grid h-6 w-6 place-items-center rounded-full border border-current text-[13px]">i</span>Platform Information</Link></aside><div className="min-w-0 xl:pl-8">{content}</div></div></main>;
}