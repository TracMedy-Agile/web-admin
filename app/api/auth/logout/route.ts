import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/server/auth-response";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out" });
  clearAuthCookies(response);
  return response;
}
