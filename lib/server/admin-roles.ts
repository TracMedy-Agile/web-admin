type JsonRecord = Record<string, unknown>;

export type AdminRoleTemplate = {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
};

export type AdminPermissionOption = {
  key: string;
  label: string;
  module: string;
};

function backendUrl(): string {
  return process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
}
function isRecord(value: unknown): value is JsonRecord { return typeof value === "object" && value !== null && !Array.isArray(value); }
function stringValue(value: unknown): string | null { return typeof value === "string" && value.length > 0 ? value : null; }
function envelopeData(value: unknown): unknown { return isRecord(value) && "data" in value ? value.data : value; }
async function readJson(response: Response): Promise<unknown> { try { return await response.json(); } catch { return null; } }

function normalizeTemplate(value: unknown): AdminRoleTemplate | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const key = stringValue(value.key);
  const name = stringValue(value.name);
  if (!id || !key || !name) return null;
  return { id, key, name, description: stringValue(value.description) ?? "", permissions: Array.isArray(value.permissions) ? value.permissions.filter((item): item is string => typeof item === "string") : [], isSystem: value.isSystem === true };
}
function normalizeOption(value: unknown): AdminPermissionOption | null {
  if (!isRecord(value)) return null;
  const key = stringValue(value.key);
  const label = stringValue(value.label);
  const permissionModule = stringValue(value.module);
  return key && label && permissionModule ? { key, label, module: permissionModule } : null;
}
export async function getAdminRoleTemplates(token: string): Promise<AdminRoleTemplate[] | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/roles/templates", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return Array.isArray(payload) ? payload.map(normalizeTemplate).filter((item): item is AdminRoleTemplate => item !== null) : null;
  } catch { return null; }
}
export async function getAdminPermissionOptions(token: string): Promise<AdminPermissionOption[] | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/roles/permission-options", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    return Array.isArray(payload) ? payload.map(normalizeOption).filter((item): item is AdminPermissionOption => item !== null) : null;
  } catch { return null; }
}
export type AdminRoleTemplateCreateInput = {
  key: string;
  name: string;
  description?: string;
  permissions: string[];
};

export async function createAdminRoleTemplate(token: string, input: AdminRoleTemplateCreateInput): Promise<AdminRoleTemplate | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/roles/templates", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
    if (!response.ok) return null;
    return normalizeTemplate(envelopeData(await readJson(response)));
  } catch { return null; }
}

export async function updateAdminRoleTemplate(token: string, templateId: string, input: { name?: string; description?: string; permissions?: string[] }): Promise<AdminRoleTemplate | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/roles/templates/" + encodeURIComponent(templateId), { method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
    if (!response.ok) return null;
    return normalizeTemplate(envelopeData(await readJson(response)));
  } catch { return null; }
}
export type AdminRoleUser = {
  id: string;
  name: string;
  email: string;
  adminRole: string;
  adminPermissions: string[];
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
};

function normalizeRoleUser(value: unknown): AdminRoleUser | null {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  const name = stringValue(value.name);
  const email = stringValue(value.email);
  const adminRole = stringValue(value.adminRole);
  if (!id || !name || !email || !adminRole) return null;
  return { id, name, email, adminRole, adminPermissions: Array.isArray(value.adminPermissions) ? value.adminPermissions.filter((item): item is string => typeof item === "string") : [], status: stringValue(value.status) ?? "unknown", lastLoginAt: typeof value.lastLoginAt === "string" ? value.lastLoginAt : null, createdAt: stringValue(value.createdAt) ?? "" };
}

export async function getAdminRoleUsers(token: string): Promise<AdminRoleUser[] | null> {
  try {
    const response = await fetch(backendUrl() + "/admin/roles/users", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
    if (!response.ok) return null;
    const payload = envelopeData(await readJson(response));
    const rows = isRecord(payload) && Array.isArray(payload.data) ? payload.data : payload;
    return Array.isArray(rows) ? rows.map(normalizeRoleUser).filter((item): item is AdminRoleUser => item !== null) : null;
  } catch { return null; }
}

export async function updateAdminRoleUser(token: string, userId: string, input: { adminRole?: string; adminPermissions?: string[] }): Promise<boolean> {
  try {
    const response = await fetch(backendUrl() + "/admin/roles/users/" + encodeURIComponent(userId), { method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
    return response.ok;
  } catch { return false; }
}
export type AdminInviteCreateInput = {
  email: string;
  roleTemplateKey: string;
  permissions?: string[];
};

export async function createAdminInvite(token: string, input: AdminInviteCreateInput): Promise<boolean> {
  try {
    const response = await fetch(backendUrl() + "/admin/roles/invites", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store" });
    return response.ok;
  } catch { return false; }
}
