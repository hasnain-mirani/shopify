import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

/**
 * Clear the admin session cookie and bounce the user to /admin/login.
 *
 * Exposed as a GET so plain <Link> navigation works. Also responds to POST
 * for clients that prefer not to trigger a cache lookup on sign-out.
 */
function clearAndRedirect(requestUrl: string) {
  const url = new URL("/admin/login", requestUrl);
  const response = NextResponse.redirect(url);
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function GET(request: Request) {
  return clearAndRedirect(request.url);
}

export function POST(request: Request) {
  return clearAndRedirect(request.url);
}
