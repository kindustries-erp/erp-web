import axiosInstance from "@/core/api/axiosInstance";
import type { ListParams, PaginatedResponse } from "@/shared/types/pagination";

export interface ActivityLogUser {
  id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface ActivityLog {
  id: number;
  action: string;
  user: string | ActivityLogUser | null;
  user_name?: string | null;
  user_email?: string | null;
  timestamp: string;
  ip: string | null;
  user_agent: string | null;
  collection: string | null;
  item: string | null;
  comment: string | null;
  origin: string | null;
}

export interface ActivityLogParams extends ListParams {
  action?: string;
  collection?: string;
  date_from?: string;
  date_to?: string;
}

export interface UserInfo {
  id: string;
  directus_user_id?:
    | string
    | { users?: string[]; role?: { users?: string[] } }
    | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

/** Returns a map of user id → display name for the activity log page */
export async function getUsersMapApi(): Promise<Record<string, string>> {
  try {
    const { data } = await axiosInstance.get<Record<string, unknown>>(
      "/api/v1/employees",
      { params: { pageSize: 500 } },
    );
    const payload = (data.items ?? data.data ?? data) as
      | UserInfo[]
      | { items?: UserInfo[]; data?: UserInfo[] };
    const list = Array.isArray(payload)
      ? payload
      : ((payload.items ?? payload.data ?? []) as UserInfo[]);
    const map: Record<string, string> = {};
    for (const u of list) {
      const name =
        u.full_name ||
        [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
      const directusKeys =
        typeof u.directus_user_id === "string"
          ? [u.directus_user_id]
          : Array.isArray(u.directus_user_id?.users)
            ? u.directus_user_id.users
            : Array.isArray(u.directus_user_id?.role?.users)
              ? u.directus_user_id.role.users
              : [];
      const keys = [...directusKeys, u.id].filter(Boolean);
      for (const key of keys) {
        map[key] = name || u.email || key;
      }
    }
    return map;
  } catch {
    return {};
  }
}

export async function getActivityLogsApi(
  params: ActivityLogParams,
): Promise<PaginatedResponse<ActivityLog>> {
  const { data } = await axiosInstance.get<Record<string, unknown>>(
    "/api/v1/activity-logs",
    { params },
  );
  // API may return `data` key instead of `items`
  const total = (data.total as number) ?? 0;
  const ps = (data.pageSize as number) ?? params.pageSize ?? 20;
  return {
    items: (data.items ?? data.data ?? []) as ActivityLog[],
    total,
    page: (data.page as number) ?? params.page ?? 1,
    pageSize: ps,
    totalPages: (data.totalPages as number) ?? (Math.ceil(total / ps) || 1),
  };
}
