import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow access to login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Verify admin session
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSession(token);

  if (!session) {
    // Redirect to login with the original path as next parameter
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
