import { useQuery } from "@tanstack/react-query";
import type { DrawerAuditItem } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline/DrawerAuditTimeline.type";
import type { UserAuditEntryDto } from "../dtos/user.dto";
import type { UserApi } from "../userApi.type";
import type { UserKeys } from "../userKeys";

type Translate = (key: string, fallback?: string) => string;

/** Đổi dòng audit của backend sang dòng timeline của drawer. Hành động lạ giữ nguyên mã gốc. */
export function toUserAuditItems(
  entries: UserAuditEntryDto[],
  t: Translate,
): DrawerAuditItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    action: t(`v2.users.history.actions.${entry.actionType}`, entry.actionType),
    actor: entry.actorEmail ?? undefined,
    timestamp: entry.createdAt,
    details: entry.message ?? undefined,
    variant: entry.status === "SUCCESS" ? "default" : "danger",
  }));
}

export interface UseUserAuditTimelineQueryParams {
  api: UserApi;
  keys: UserKeys;
  userId: string | null;
  enabled: boolean;
}

/** Nhật ký audit của một tài khoản; chỉ gọi khi drawer mở và có id */
export function useUserAuditTimelineQuery({
  api,
  keys,
  userId,
  enabled,
}: UseUserAuditTimelineQueryParams) {
  return useQuery({
    queryKey: keys.audit(userId ?? "new"),
    queryFn: () => api.timeline(userId!),
    enabled: enabled && Boolean(userId),
    staleTime: 15_000,
  });
}
