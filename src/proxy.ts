import { type NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  AUTH_DASHBOARD_PATH,
  AUTH_LOGIN_PATH,
  getSafeDashboardRedirect,
  isAllowedSession,
} from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionUserId = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = isAllowedSession(sessionUserId);
  const isDashboardPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isLoginPath = pathname === AUTH_LOGIN_PATH || pathname === "/auth/v1/login";

  if (isDashboardPath && !isAuthenticated) {
    const loginUrl = new URL(AUTH_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath && isAuthenticated) {
    const redirectToParam = request.nextUrl.searchParams.get("redirectTo");
    const nextPath = getSafeDashboardRedirect(redirectToParam);
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (pathname === "/auth/v1/login") {
    return NextResponse.redirect(new URL(AUTH_LOGIN_PATH, request.url));
  }

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(AUTH_DASHBOARD_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/v1", "/auth/v1/login"],
};
