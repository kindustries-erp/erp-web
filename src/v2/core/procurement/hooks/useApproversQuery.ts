import { useQuery } from "@tanstack/react-query";
import { fetchApprovers } from "../approval/approval.api";

/** Người có quyền duyệt, chỉ tải khi `enabled` (lúc mở modal gửi duyệt). */
export function useApproversQuery(
  configPath: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["v2-procurement", "approvers", configPath],
    queryFn: () => fetchApprovers(configPath as string),
    enabled: enabled && Boolean(configPath),
    staleTime: 60_000,
  });
}
