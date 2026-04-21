"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  checkAdminPassword,
  signAdminSession,
} from "@/lib/admin-session";

export interface LoginState {
  error?: string;
}

/**
 * Server action backing the admin login form. Validates the password in
 * constant time, signs a short-lived session JWT, and stores it as an
 * httpOnly cookie.
 *
 * On success we redirect to the requested `next` path (or `/admin`).
 * On failure we return a state object with a generic error message —
 * never leak whether the password was wrong vs. empty.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  if (!password) {
    return { error: "Enter your password." };
  }

  let ok: boolean;
  try {
    ok = checkAdminPassword(password);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Admin panel is not configured correctly.",
    };
  }

  if (!ok) {
    return { error: "Incorrect password." };
  }

  const token = await signAdminSession("admin");
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  const safeNext = nextPath.startsWith("/admin") ? nextPath : "/admin";
  redirect(safeNext);
}
