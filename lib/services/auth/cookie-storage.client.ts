export type AdminAuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

export async function storeAdminTokens(tokens: AdminAuthTokens): Promise<void> {
  const response = await fetch("/api/auth/set-tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(tokens),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function deleteAdminTokens(): Promise<void> {
  const response = await fetch("/api/auth/set-tokens", {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}
