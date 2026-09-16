export type ApiResult<T> =
  | { ok: true; data: T; message: string }
  | { ok: false; message: string; status: number };

export type AdminProfile = {
  id: string;
  email: string;
  phone?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  initials: string;
  role: string;
  subRole?: string | null;
  status: string;
  permissions: string[];
  createdAt: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: AdminProfile | null;
};

type MessageResponse = {
  message?: string;
};

type AuthEnvelope = {
  message?: string;
  data?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function messageFromPayload(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) {
    return fallback;
  }

  const message = payload.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const first = message.find((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (first) {
      return first;
    }
  }

  return fallback;
}

async function readPayload(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) as unknown : null;
  } catch {
    return null;
  }
}

function unwrapData(payload: unknown): unknown {
  return isRecord(payload) && "data" in payload ? payload.data : payload;
}

function stringFrom(value: unknown, keys: string[]): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}

function numberFrom(value: unknown, keys: string[]): number | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
      return candidate;
    }
  }

  return undefined;
}

function loginResponseFromPayload(payload: unknown): LoginResponse | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) {
    return null;
  }

  const accessToken = stringFrom(data, ["accessToken", "access_token", "token"]);
  if (!accessToken) {
    return null;
  }

  const user = isRecord(data.user) || data.user === null ? data.user as AdminProfile | null : isRecord(data.admin) || data.admin === null ? data.admin as AdminProfile | null : null;
  return {
    accessToken,
    refreshToken: stringFrom(data, ["refreshToken", "refresh_token"]),
    expiresIn: numberFrom(data, ["expiresIn", "expires_in", "accessTokenExpiresIn"]),
    user,
  };
}

async function requestJson<T>(url: string, init: RequestInit, fallback: string): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    credentials: "include",
  });
  const payload = await readPayload(response);

  if (!response.ok) {
    return { ok: false, message: messageFromPayload(payload, fallback), status: response.status };
  }

  const message = messageFromPayload(payload, "Success");
  return { ok: true, data: payload as T, message };
}

export async function loginAdmin(email: string, password: string): Promise<ApiResult<LoginResponse>> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return { ok: false, message: "Admin API URL is not configured.", status: 500 };
  }

  const response = await fetch(apiBase.replace(/\/$/, "") + "/auth/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await readPayload(response) as AuthEnvelope | null;

  if (!response.ok) {
    return { ok: false, message: messageFromPayload(payload, "Invalid admin credentials."), status: response.status };
  }

  const data = loginResponseFromPayload(payload);
  if (!data) {
    return { ok: false, message: "Admin login response did not include an access token.", status: 502 };
  }

  return { ok: true, data, message: messageFromPayload(payload, "Success") };
}

export async function requestAdminPasswordReset(email: string): Promise<ApiResult<MessageResponse>> {
  return requestJson<MessageResponse>(
    "/api/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    "Unable to send reset link.",
  );
}

export async function resetAdminPassword(token: string, newPassword: string): Promise<ApiResult<MessageResponse>> {
  return requestJson<MessageResponse>(
    "/api/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    },
    "Unable to update password.",
  );
}

export async function logoutAdmin(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}
