import { users } from "@/data/users";

export const AUTH_COOKIE_NAME = "auth_session_user_id";
export const AUTH_LOGIN_PATH = "/auth/v1";
export const AUTH_DASHBOARD_PATH = "/dashboard/default";

const userIds = new Set(users.map((user) => user.id));
const usersByEmail = new Map(users.map((user) => [user.email.trim().toLowerCase(), user]));

export function findUserByCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = usersByEmail.get(normalizedEmail);

  if (!user) {
    return null;
  }

  return user.username.toLowerCase() === password.trim().toLowerCase() ? user : null;
}

export function isAllowedSession(sessionUserId: string | undefined): boolean {
  return typeof sessionUserId === "string" && userIds.has(sessionUserId);
}

export function getSafeDashboardRedirect(pathname: string | null): string {
  if (!pathname) {
    return AUTH_DASHBOARD_PATH;
  }

  return pathname === "/dashboard" || pathname.startsWith("/dashboard/") ? pathname : AUTH_DASHBOARD_PATH;
}
