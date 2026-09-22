import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CloseIcon, EditIcon, PlusIcon } from "@/components/admin/AdminIcons";
import { getAdminSessionToken } from "@/lib/server/admin-overview";
import { createAdminRoleTemplate, getAdminPermissionOptions, getAdminRoleTemplates, getAdminRoleUsers, updateAdminRoleTemplate, updateAdminRoleUser, type AdminPermissionOption, type AdminRoleTemplate, type AdminRoleUser, createAdminInvite } from "@/lib/server/admin-roles";

type RolesSearchParams = {
  edit?: string; addRole?: string; actionError?: string; actionUpdated?: string;
  saved?: string;
  add?: string;
  view?: string;
  admin?: string;
  remove?: string;
  editAdmin?: string;
  suspend?: string;
};

type RolesPageProps = {
  searchParams: Promise<RolesSearchParams>;
};

type Admin = { id: string; name: string; email: string; role: string; status: string; lastActive: string; permissions: string[] };
type Role = {
  id: string;
  key: string;
  name: string;
  description: string;
  admins: string;
  permissions: string[];
  status: "Active" | "System";
};


function permissionGroupsFromOptions(options: AdminPermissionOption[]): Array<{ name: string; items: AdminPermissionOption[] }> { const groups = new Map<string, AdminPermissionOption[]>(); for (const option of options) groups.set(option.module, [...(groups.get(option.module) ?? []), option]); return Array.from(groups, ([name, items]) => ({ name, items })); }

function StatusPill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" }) {
  return <span className={["inline-flex rounded-full px-3 py-1.5 text-[12px] font-bold", tone === "green" ? "bg-admin-green-soft text-admin-success" : "bg-admin-blue-soft text-admin-blue"].join(" ")}>{children}</span>;
}


function PanelShell({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-30 bg-admin-ink/30 p-4 backdrop-blur-[3px] sm:p-8" role="dialog" aria-modal="true"><div className="ml-auto flex h-full w-full max-w-[620px] flex-col overflow-y-auto rounded-[10px] bg-white shadow-2xl"><header className="flex items-start justify-between gap-4 border-b border-admin-border px-6 py-6"><div><p className="text-[13px] font-bold uppercase text-admin-muted">{eyebrow}</p><h2 className="mt-2 text-[24px] font-bold text-admin-ink">{title}</h2><p className="mt-1 text-[14px] font-medium text-admin-muted">{description}</p></div><Link href="/roles-permissions" aria-label="Close panel" className="grid h-10 w-10 place-items-center rounded-[8px] border border-admin-border text-admin-muted"><CloseIcon className="h-5 w-5" /></Link></header>{children}</div></div>;
}

function UnavailableNotice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[8px] border border-admin-border bg-admin-soft px-4 py-3 text-[13px] leading-5 text-admin-muted">{children}</div>;
}

async function createRoleTemplateAction(formData: FormData): Promise<void> {
  "use server";

  const key = formData.get("key");
  const name = formData.get("name");
  const description = formData.get("description");
  const permissions = formData.getAll("permissions").filter((value): value is string => typeof value === "string");
  if (typeof key !== "string" || !key.trim() || typeof name !== "string" || !name.trim() || permissions.length === 0) redirect("/roles-permissions?addRole=1&actionError=1");
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const created = await createAdminRoleTemplate(token, { key: key.trim(), name: name.trim(), description: typeof description === "string" ? description.trim() : "", permissions });
  if (!created) redirect("/roles-permissions?addRole=1&actionError=1");
  revalidatePath("/roles-permissions");
  redirect("/roles-permissions?actionUpdated=1");
}

async function updateRoleTemplateAction(formData: FormData): Promise<void> {
  "use server";

  const templateId = formData.get("templateId");
  const name = formData.get("name");
  const description = formData.get("description");
  const permissions = formData.getAll("permissions").filter((value): value is string => typeof value === "string");
  if (typeof templateId !== "string" || !templateId || typeof name !== "string" || !name.trim() || permissions.length === 0) redirect("/roles-permissions?edit=" + encodeURIComponent(String(templateId)) + "&actionError=1");
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const updated = await updateAdminRoleTemplate(token, templateId, { name: name.trim(), description: typeof description === "string" ? description.trim() : "", permissions });
  if (!updated) redirect("/roles-permissions?edit=" + encodeURIComponent(templateId) + "&actionError=1");
  revalidatePath("/roles-permissions");
  redirect("/roles-permissions?edit=" + encodeURIComponent(templateId) + "&actionUpdated=1");
}async function createAdminInviteAction(formData: FormData): Promise<void> {
  "use server";

  const email = formData.get("email");
  const roleTemplateKey = formData.get("roleTemplateKey");
  if (typeof email !== "string" || !email.trim() || typeof roleTemplateKey !== "string" || !roleTemplateKey) redirect("/roles-permissions?add=1&actionError=1");
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const created = await createAdminInvite(token, { email: email.trim(), roleTemplateKey });
  if (!created) redirect("/roles-permissions?add=1&actionError=1");
  revalidatePath("/roles-permissions");
  redirect("/roles-permissions?view=admins&actionUpdated=1");
}
async function updateAdminUserAction(formData: FormData): Promise<void> {
  "use server";

  const adminId = formData.get("adminId");
  const adminRole = formData.get("adminRole");
  if (typeof adminId !== "string" || !adminId || typeof adminRole !== "string" || !adminRole) redirect("/roles-permissions?view=admins&actionError=1");
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const updated = await updateAdminRoleUser(token, adminId, { adminRole });
  if (!updated) redirect("/roles-permissions?view=admins&admin=" + encodeURIComponent(adminId) + "&editAdmin=1&actionError=1");
  revalidatePath("/roles-permissions");
  redirect("/roles-permissions?view=admins&admin=" + encodeURIComponent(adminId) + "&editAdmin=1&actionUpdated=1");
}
function EditRolePanel({ role, permissionOptions, error, updated }: { role: Role; permissionOptions: AdminPermissionOption[]; error: boolean; updated: boolean }) {
  return <PanelShell eyebrow="Roles and permissions" title={"Edit " + role.name} description="Choose the permissions assigned to this role."><form action={updateRoleTemplateAction} className="space-y-6 px-6 py-6"><input type="hidden" name="templateId" value={role.id} />{error ? <div className="rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[13px] text-admin-red">Unable to update this role template. System templates may be read-only.</div> : null}{updated ? <div className="rounded-[8px] border border-admin-green/30 bg-admin-green-soft px-4 py-3 text-[13px] text-admin-success">Role template updated successfully.</div> : null}<label className="block text-[13px] font-bold text-admin-ink">Name<input required name="name" defaultValue={role.name} className="mt-2 h-11 w-full rounded-[8px] border border-admin-border px-3 text-[14px] text-admin-ink" /></label><label className="block text-[13px] font-bold text-admin-ink">Description<textarea name="description" defaultValue={role.description} rows={3} className="mt-2 w-full resize-none rounded-[8px] border border-admin-border px-3 py-3 text-[14px] text-admin-ink" /></label><div className="rounded-[8px] border border-admin-border bg-white"><div className="border-b border-admin-border px-5 py-4"><p className="text-[15px] font-bold text-admin-ink">Permissions</p></div><div className="divide-y divide-admin-border">{permissionGroupsFromOptions(permissionOptions).map((group) => <fieldset key={group.name} className="px-5 py-5"><legend className="text-[14px] font-bold text-admin-ink">{group.name}</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{group.items.map((item) => <label key={item.key} className="flex items-center gap-3 text-[14px] font-medium text-admin-ink"><input type="checkbox" name="permissions" value={item.key} defaultChecked={role.permissions.includes(item.key)} className="h-4 w-4 accent-admin-blue" />{item.label}</label>)}</div></fieldset>)}</div></div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href="/roles-permissions" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Save changes</button></div></form></PanelShell>;
}
function CreateRoleTemplatePanel({ permissionOptions, error, updated }: { permissionOptions: AdminPermissionOption[]; error: boolean; updated: boolean }) {
  return <PanelShell eyebrow="Roles and permissions" title="Add role template" description="Create a custom administrator role."><form action={createRoleTemplateAction} className="space-y-5 px-6 py-6">{error ? <div className="rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[13px] text-admin-red">Unable to create this role template.</div> : null}{updated ? <div className="rounded-[8px] border border-admin-green/30 bg-admin-green-soft px-4 py-3 text-[13px] text-admin-success">Role template created successfully.</div> : null}<label className="block text-[13px] font-bold text-admin-ink">Key<input required name="key" placeholder="records_admin" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border px-3 text-[14px] text-admin-ink" /></label><label className="block text-[13px] font-bold text-admin-ink">Name<input required name="name" placeholder="Records Admin" className="mt-2 h-11 w-full rounded-[8px] border border-admin-border px-3 text-[14px] text-admin-ink" /></label><label className="block text-[13px] font-bold text-admin-ink">Description<textarea name="description" rows={3} className="mt-2 w-full resize-none rounded-[8px] border border-admin-border px-3 py-3 text-[14px] text-admin-ink" /></label><div className="rounded-[8px] border border-admin-border bg-white"><p className="border-b border-admin-border px-5 py-4 text-[15px] font-bold text-admin-ink">Permissions</p><div className="grid gap-3 px-5 py-5 sm:grid-cols-2">{permissionOptions.map((option) => <label key={option.key} className="flex items-center gap-3 text-[14px] font-medium text-admin-ink"><input type="checkbox" required={false} name="permissions" value={option.key} className="h-4 w-4 accent-admin-blue" />{option.label}</label>)}</div></div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href="/roles-permissions" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Create role</button></div></form></PanelShell>;
}function SavePermissionPanel({ role }: { role: Role }) {
  return <PanelShell eyebrow="Permission changes" title="Save Permission Changes" description={"Review changes for " + role.name + " before saving."}><div className="space-y-6 px-6 py-6"><UnavailableNotice>The role permission update endpoint is not available yet. No changes were saved.</UnavailableNotice><div className="rounded-[8px] border border-admin-border px-5 py-5"><p className="text-[15px] font-bold text-admin-ink">Permission update unavailable</p><p className="mt-2 text-[14px] leading-6 text-admin-muted">Once the admin role-management contract is available, this confirmation state will submit the selected permission changes.</p></div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href={"/roles-permissions?edit=" + role.id} className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Back to permissions</Link><button type="button" disabled className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white opacity-60">Confirm and Save</button></div></div></PanelShell>;
}

function AddAdminPanel({ roles, error, updated }: { roles: Role[]; error: boolean; updated: boolean }) {
  return <PanelShell eyebrow="Administrator directory" title="Add Admin" description="Invite a new administrator to the Tracmedy platform."><form action={createAdminInviteAction} className="space-y-6 px-6 py-6">{error ? <div className="rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[13px] text-admin-red">Unable to send this administrator invite.</div> : null}{updated ? <div className="rounded-[8px] border border-admin-green/30 bg-admin-green-soft px-4 py-3 text-[13px] text-admin-success">Administrator invite sent successfully.</div> : null}<div className="space-y-5"><label className="block"><span className="text-[14px] font-bold text-admin-ink">Email address</span><input required name="email" type="email" placeholder="admin@example.com" className="mt-2 w-full rounded-[8px] border border-admin-border px-4 py-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted" /></label><label className="block"><span className="text-[14px] font-bold text-admin-ink">Role</span><select required name="roleTemplateKey" defaultValue="" className="mt-2 w-full rounded-[8px] border border-admin-border px-4 py-3 text-[14px] text-admin-muted outline-none"><option value="">Select a role</option>{roles.map((role) => <option key={role.id} value={role.key}>{role.name}</option>)}</select></label></div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href="/roles-permissions" className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Send Invite</button></div></form></PanelShell>;
}
function AdminDetailPanel({ admin }: { admin: Admin }) {
  return <PanelShell eyebrow="Administrator details" title={admin.name} description="Review administrator profile, role, and account access."><div className="space-y-6 px-6 py-6"><div className="rounded-[8px] border border-admin-green/30 bg-admin-green-soft px-4 py-3 text-[13px] text-admin-success">Live administrator data loaded from the role users endpoint.</div><div className="grid gap-5 sm:grid-cols-2"><div><p className="text-[12px] font-bold uppercase text-admin-muted">Email address</p><p className="mt-2 text-[14px] font-bold text-admin-ink">{admin.email}</p></div><div><p className="text-[12px] font-bold uppercase text-admin-muted">Account status</p><div className="mt-2"><StatusPill tone={admin.status === "Active" ? "green" : "blue"}>{admin.status}</StatusPill></div></div><div><p className="text-[12px] font-bold uppercase text-admin-muted">Assigned role</p><p className="mt-2 text-[14px] font-bold text-admin-ink">{admin.role}</p></div><div><p className="text-[12px] font-bold uppercase text-admin-muted">Last active</p><p className="mt-2 text-[14px] font-bold text-admin-ink">{admin.lastActive}</p></div></div><div className="rounded-[8px] border border-admin-border px-5 py-5"><p className="text-[15px] font-bold text-admin-ink">Account actions</p><p className="mt-2 text-[14px] leading-6 text-admin-muted">Edit, suspend, and remove actions will become available when the admin-directory contract is added.</p><div className="mt-5 flex flex-wrap gap-3"><Link href={"/roles-permissions?view=admins&admin=" + admin.id + "&editAdmin=1"} className="rounded-[8px] border border-admin-blue px-4 py-3 text-[14px] font-bold text-admin-blue">Edit Admin</Link><Link href={"/roles-permissions?view=admins&admin=" + admin.id + "&suspend=1"} className="rounded-[8px] border border-admin-danger px-4 py-3 text-[14px] font-bold text-admin-danger">Suspend Admin</Link><Link href={"/roles-permissions?view=admins&admin=" + admin.id + "&remove=1"} className="rounded-[8px] border border-admin-danger px-4 py-3 text-[14px] font-bold text-admin-danger">Remove Admin</Link></div></div></div></PanelShell>;
}

function RemoveAdminPanel({ admin }: { admin: Admin }) {
  return <PanelShell eyebrow="Administrator directory" title="Remove Admin" description={"Remove " + admin.name + " from the administrator directory."}><div className="space-y-6 px-6 py-6"><div className="rounded-[8px] border border-admin-danger/20 bg-admin-danger-soft px-4 py-3 text-[13px] leading-5 text-admin-danger">The admin-directory remove endpoint is not available yet. No administrator will be removed.</div><div className="rounded-[8px] border border-admin-border px-5 py-5"><p className="text-[15px] font-bold text-admin-ink">Confirm removal</p><p className="mt-2 text-[14px] leading-6 text-admin-muted">This preview confirms the intended action for {admin.email}. The account and its access remain unchanged.</p></div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href={"/roles-permissions?view=admins&admin=" + admin.id} className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="button" disabled className="rounded-[8px] bg-admin-danger px-5 py-3 text-[14px] font-bold text-white opacity-60">Remove Admin</button></div></div></PanelShell>;
}

function EditAdminPanel({ admin, roles, error, updated }: { admin: Admin; roles: Role[]; error: boolean; updated: boolean }) {
  return <PanelShell eyebrow="Administrator directory" title="Edit Admin" description={"Update " + admin.name + "'s administrator profile."}><form action={updateAdminUserAction} className="space-y-6 px-6 py-6"><input type="hidden" name="adminId" value={admin.id} />{error ? <div className="rounded-[8px] border border-admin-red/30 bg-admin-red-soft px-4 py-3 text-[13px] text-admin-red">Unable to update this administrator role.</div> : null}{updated ? <div className="rounded-[8px] border border-admin-green/30 bg-admin-green-soft px-4 py-3 text-[13px] text-admin-success">Administrator role updated successfully.</div> : null}<div className="space-y-5"><label className="block"><span className="text-[14px] font-bold text-admin-ink">Full name</span><input disabled defaultValue={admin.name} className="mt-2 w-full rounded-[8px] border border-admin-border px-4 py-3 text-[14px] text-admin-ink outline-none" /></label><label className="block"><span className="text-[14px] font-bold text-admin-ink">Email address</span><input disabled type="email" defaultValue={admin.email} className="mt-2 w-full rounded-[8px] border border-admin-border px-4 py-3 text-[14px] text-admin-ink outline-none" /></label><label className="block"><span className="text-[14px] font-bold text-admin-ink">Role</span><select name="adminRole" required defaultValue={admin.role} className="mt-2 w-full rounded-[8px] border border-admin-border px-4 py-3 text-[14px] text-admin-ink outline-none">{roles.map((role) => <option key={role.id} value={role.key}>{role.name}</option>)}</select></label></div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href={"/roles-permissions?view=admins&admin=" + admin.id} className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="submit" className="rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white">Save Admin Changes</button></div></form></PanelShell>;
}
function SuspendAdminPanel({ admin }: { admin: Admin }) {
  return <PanelShell eyebrow="Administrator directory" title="Suspend Admin" description={"Suspend " + admin.name + "'s administrator access."}><div className="space-y-6 px-6 py-6"><div className="rounded-[8px] border border-admin-danger/20 bg-admin-danger-soft px-4 py-3 text-[13px] leading-5 text-admin-danger">The admin-directory status endpoint is not available yet. No administrator will be suspended.</div><div className="rounded-[8px] border border-admin-border px-5 py-5"><p className="text-[15px] font-bold text-admin-ink">Confirm suspension</p><p className="mt-2 text-[14px] leading-6 text-admin-muted">This preview confirms the intended action for {admin.email}. Their current account status and access remain unchanged.</p><label className="mt-5 block"><span className="text-[14px] font-bold text-admin-ink">Reason</span><textarea disabled rows={3} placeholder="Enter a reason for suspension" className="mt-2 w-full resize-none rounded-[8px] border border-admin-border px-4 py-3 text-[14px] text-admin-ink outline-none placeholder:text-admin-muted" /></label></div><div className="flex justify-end gap-3 border-t border-admin-border pt-5"><Link href={"/roles-permissions?view=admins&admin=" + admin.id} className="rounded-[8px] px-4 py-3 text-[14px] font-bold text-admin-muted">Cancel</Link><button type="button" disabled className="rounded-[8px] bg-admin-danger px-5 py-3 text-[14px] font-bold text-white opacity-60">Suspend Admin</button></div></div></PanelShell>;
}
function AdminTable({ admins, selectedAdmin }: { admins: Admin[]; selectedAdmin?: Admin }) {
  return <section className="mt-8 overflow-hidden rounded-[10px] bg-white"><div className="flex flex-col gap-4 border-b border-admin-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-[18px] font-bold text-admin-ink">Administrators</h3><p className="mt-1 text-[14px] font-medium text-admin-muted">Review administrator access and account status</p></div><Link href="/roles-permissions?view=admins&add=1" className="rounded-[8px] border border-admin-blue px-4 py-3 text-[14px] font-bold text-admin-blue">Add Admin</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted"><tr><th className="px-5 py-4">Administrator</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Last active</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="text-[14px]">{admins.map((admin) => <tr key={admin.id} className="border-b border-admin-border last:border-b-0"><td className="px-5 py-5"><p className="font-bold text-admin-ink">{admin.name}</p><p className="mt-1 text-[13px] text-admin-muted">{admin.email}</p></td><td className="px-5 py-5 text-admin-muted">{admin.role}</td><td className="px-5 py-5"><StatusPill tone={admin.status === "Active" ? "green" : "blue"}>{admin.status}</StatusPill></td><td className="px-5 py-5 text-admin-muted">{admin.lastActive}</td><td className="px-5 py-5 text-right"><Link href={"/roles-permissions?view=admins&admin=" + admin.id} className="font-bold text-admin-blue">View details</Link></td></tr>)}</tbody></table></div>{selectedAdmin ? <AdminDetailPanel admin={selectedAdmin} /> : null}</section>;
}
function RolesOverview({ roles, admins, permissionOptions, selectedRole, showSaved, showAddAdmin, showAddRole, showAdmins, selectedAdmin, showRemove, showEditAdmin, showSuspend, dataAvailable, actionError, actionUpdated }: { roles: Role[]; admins: Admin[]; permissionOptions: AdminPermissionOption[]; selectedRole?: Role; showSaved: boolean; showAddAdmin: boolean; showAddRole: boolean; showAdmins: boolean; selectedAdmin?: Admin; showRemove: boolean; showEditAdmin: boolean; showSuspend: boolean; dataAvailable: boolean; actionError: boolean; actionUpdated: boolean }) {
  const roleMemberCount = (role: Role) => admins.filter((admin) => admin.role === role.key || admin.role === role.name).length;
  const matrix = <section className="mt-7 overflow-hidden rounded-[10px] bg-white admin-panel-shadow"><div className="flex items-center justify-between gap-4 border-b border-admin-border px-5 py-6"><h3 className="text-[18px] font-bold text-admin-ink">Role &amp; Permission Overview</h3>{roles[0] ? <Link href={"/roles-permissions?edit=" + roles[0].id} className="inline-flex items-center gap-2 text-[14px] font-bold text-admin-blue"><EditIcon className="h-4 w-4" />Edit Permissions</Link> : null}</div><div className="overflow-x-auto px-5 pb-5"><table className="w-full min-w-[820px] border-collapse text-left"><thead className="bg-admin-table-head text-[12px] font-bold uppercase text-admin-muted"><tr><th className="px-3 py-4">Permission</th>{roles.map((role) => <th key={role.id} className="px-3 py-4 text-center"><span className="block">{role.name}</span><span className="mt-1 block text-[12px] font-medium normal-case tracking-normal text-admin-muted">{roleMemberCount(role)} Members</span></th>)}</tr></thead><tbody className="text-[14px]">{permissionOptions.length ? permissionOptions.map((option) => <tr key={option.key} className="border-b border-admin-border last:border-b-0"><td className="px-3 py-4 text-admin-text">{option.label}</td>{roles.map((role) => <td key={role.id} className="px-3 py-4 text-center text-[16px] text-admin-ink">{role.permissions.includes(option.key) ? <span aria-label="Permission enabled">&#10003;</span> : <span aria-label="Permission disabled">-</span>}</td>)}</tr>) : <tr><td colSpan={Math.max(roles.length + 1, 2)} className="px-3 py-12 text-center text-admin-muted">{dataAvailable ? "No permission options available." : "Role and permission data is unavailable."}</td></tr>}</tbody></table></div></section>;
  return <main className="px-6 py-7 lg:px-8"><div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div><h2 className="text-[26px] font-bold text-admin-ink">Roles &amp; Access Control</h2><p className="mt-2 text-[16px] font-medium text-admin-muted">Manage administrator accounts and control access</p></div><Link href="/roles-permissions?add=1" className="inline-flex items-center justify-center gap-2 self-start rounded-[8px] bg-admin-blue px-5 py-3 text-[14px] font-bold text-white"><PlusIcon className="h-4 w-4" />Add Admin</Link></div><section className="mt-7 overflow-hidden rounded-[10px] bg-white admin-panel-shadow"><nav className="flex items-center gap-7 border-b border-admin-border px-6" aria-label="Roles and permissions views"><Link href="/roles-permissions" className={["relative py-5 text-[14px] font-bold", !showAdmins ? "text-admin-blue after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-admin-blue" : "text-admin-muted"].join(" ")}> <span className="mr-2">&#8226;</span>Roles</Link><Link href="/roles-permissions?view=admins" className={["relative py-5 text-[14px] font-bold", showAdmins ? "text-admin-blue after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-admin-blue" : "text-admin-muted"].join(" ")}> <span className="mr-2">&#8226;</span>Admin Table</Link></nav>{showAdmins ? <AdminTable admins={admins} selectedAdmin={selectedAdmin} /> : matrix}</section>{showAddRole ? <CreateRoleTemplatePanel permissionOptions={permissionOptions} error={actionError} updated={actionUpdated} /> : showAddAdmin ? <AddAdminPanel roles={roles} error={actionError} updated={actionUpdated} /> : showRemove && selectedAdmin ? <RemoveAdminPanel admin={selectedAdmin} /> : showEditAdmin && selectedAdmin ? <EditAdminPanel admin={selectedAdmin} roles={roles} error={actionError} updated={actionUpdated} /> : showSuspend && selectedAdmin ? <SuspendAdminPanel admin={selectedAdmin} /> : showSaved && selectedRole ? <SavePermissionPanel role={selectedRole} /> : selectedRole ? <EditRolePanel role={selectedRole} permissionOptions={permissionOptions} error={actionError} updated={actionUpdated} /> : null}</main>;
}export default async function RolesPermissionsPage({ searchParams }: RolesPageProps) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/login");
  const params = await searchParams;
  const [templates, permissionOptions, roleUsers] = await Promise.all([getAdminRoleTemplates(token), getAdminPermissionOptions(token), getAdminRoleUsers(token)]);
  const roles: Role[] = (templates ?? []).map((template: AdminRoleTemplate) => ({ id: template.id, key: template.key, name: template.name, description: template.description || "No description provided", admins: (roleUsers ?? []).filter((user: AdminRoleUser) => user.adminRole === template.key || user.adminRole === template.name).length.toString(), permissions: template.permissions, status: template.isSystem ? "System" : "Active" }));
  const admins: Admin[] = (roleUsers ?? []).map((user: AdminRoleUser) => ({ id: user.id, name: user.name, email: user.email, role: user.adminRole, status: user.status, lastActive: user.lastLoginAt ?? "Never", permissions: user.adminPermissions }));
  const selectedRole = roles.find((role) => role.id === params.edit);
  const selectedAdmin = admins.find((admin) => admin.id === params.admin);
  return <RolesOverview roles={roles} permissionOptions={permissionOptions ?? []} dataAvailable={templates !== null && permissionOptions !== null && roleUsers !== null} selectedRole={selectedRole} admins={admins} showAddRole={params.addRole === "1"} showSaved={params.saved === "1"} showAddAdmin={params.add === "1"} showAdmins={params.view === "admins"} selectedAdmin={selectedAdmin} showRemove={params.remove === "1"} showEditAdmin={params.editAdmin === "1"} showSuspend={params.suspend === "1"} actionError={params.actionError === "1"} actionUpdated={params.actionUpdated === "1"} />;
}






