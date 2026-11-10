import { useQuery } from "@tanstack/react-query";
import { fetchApprovalSetting } from "../approval/approval.api";

/** Khóa duyệt của họ chứng từ. Không có `configPath` thì không gọi API. */
export function useApprovalSettingQuery(configPath: string | undefined) {
  return useQuery({
    queryKey: ["v2-procurement", "approval-setting", configPath],
    queryFn: () => fetchApprovalSetting(configPath as string),
    enabled: Boolean(configPath),
    staleTime: 30_000,
  });
}
