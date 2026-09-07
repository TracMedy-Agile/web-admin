import { NextResponse } from "next/server";

export const ACCESS_COOKIE = "adminAccessToken";
export const REFRESH_COOKIE = "adminRefreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export type BackendTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

export function backendUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  if (!value) {
    throw new Error("NEXT_PUBLIC_API_URL or API_URL is required for admin auth.");
  }

  return value.replace(/\/$/, "");
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function envelopeData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) {
    return payload.data;
  }

  return payload;
}

export function envelopeMessage(payload: unknown, fallback: string): string {
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

function tokenFrom(value: unknown, keys: string[]): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  return undefined;
}

export function extractTokens(payload: unknown): BackendTokens | null {
  const data = envelopeData(payload);
  const accessToken = tokenFrom(data, ["accessToken", "access_token", "token"]);
  const refreshToken = tokenFrom(data, ["refreshToken", "refresh_token"]);
  const expiresIn = numberFrom(data, ["expiresIn", "expires_in", "accessTokenExpiresIn"]);

  if (!accessToken) {
    return null;
  }

  return { accessToken, refreshToken, expiresIn };
}

export function extractUser(payload: unknown): unknown {
  const data = envelopeData(payload);
  if (isRecord(data) && "user" in data) {
    return data.user;
  }

  if (isRecord(data) && "admin" in data) {
    return data.admin;
  }

  return null;
}

export function setAuthCookies(response: NextResponse, tokens: BackendTokens): void {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...cookieOptions,
    maxAge: tokens.expiresIn ?? 60 * 60,
  });

  if (tokens.refreshToken) {
    response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export function apiError(payload: unknown, status: number, fallback = "Request failed."): NextResponse {
  return NextResponse.json(
    { message: envelopeMessage(payload, fallback), data: null },
    { status: status >= 400 && status <= 599 ? status : 500 },
  );
}
