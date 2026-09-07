import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/server/auth-response";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAdminSession = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);

  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/users") || pathname.startsWith("/facilities")) && !hasAdminSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasAdminSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/users/:path*", "/facilities/:path*", "/login"],
};
