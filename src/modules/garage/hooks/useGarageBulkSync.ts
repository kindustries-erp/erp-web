import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { garageApi } from "../api/garageApi";

export type GarageBulkSyncScope =
  | "all"
  | "cases"
  | "gross-profit"
  | "case-details";

export interface GarageBulkSyncStatus {
  status: "idle" | "running" | "completed" | "failed";
  scope: GarageBulkSyncScope | null;
  startedAt: string | null;
  finishedAt: string | null;
  totalBranches: number;
  completedBranches: number;
  currentBranch: { branchExternalId: string; accountKey: string } | null;
  accounts: { accountKey: string; ok: boolean; error?: string }[];
  results: {
    branchExternalId: string;
    accountKey: string;
    ok: boolean;
    error?: string;
  }[];
  message: string | null;
}

export const GARAGE_BULK_SYNC_STATUS_KEY = ["garage-bulk-sync-status"] as const;

/** Bắt đầu job đồng bộ nền cho mọi chi nhánh; trả trạng thái ngay. */
export function useStartGarageBulkSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      scope: GarageBulkSyncScope;
      from?: string;
      to?: string;
      includeDetails?: boolean;
      forceDetails?: boolean;
    }) => garageApi.startAllBranchesSync(payload),
    onSuccess: (status: GarageBulkSyncStatus) => {
      queryClient.setQueryData(GARAGE_BULK_SYNC_STATUS_KEY, status);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể bắt đầu đồng bộ",
      );
    },
  });
}

/**
 * Theo dõi job nền: poll 2 giây khi đang chạy. Khi job chuyển từ đang chạy sang xong
 * thì làm mới dữ liệu garage và báo kết quả một lần.
 */
export function useGarageBulkSyncStatus(
  enabled: boolean,
  onCompleted?: () => void,
) {
  const queryClient = useQueryClient();
  const query = useQuery<GarageBulkSyncStatus>({
    queryKey: GARAGE_BULK_SYNC_STATUS_KEY,
    queryFn: garageApi.getAllBranchesSyncStatus,
    enabled,
    refetchInterval: (q) => (q.state.data?.status === "running" ? 2000 : false),
  });

  const status = query.data?.status;
  const previousStatus = useRef(status);
  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;

  useEffect(() => {
    const wasRunning = previousStatus.current === "running";
    previousStatus.current = status;
    if (!wasRunning || (status !== "completed" && status !== "failed")) return;

    queryClient.invalidateQueries({ queryKey: ["garage"] });
    const data = query.data;
    const hasFailures = !!data?.results.some((r) => !r.ok);
    if (status === "failed" || hasFailures) {
      toast.error(data?.message || "Đồng bộ có lỗi");
    } else {
      toast.success(data?.message || "Đồng bộ hoàn tất");
    }
    onCompletedRef.current?.();
  }, [status, query.data, queryClient]);

  return query;
}
