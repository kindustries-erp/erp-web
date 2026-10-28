import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import type { VinfastSyncStatus } from "./vinfastSyncStatus";

/**
 * Hỏi trạng thái đồng bộ định kỳ: nhanh (2 giây) khi đang chạy, chậm (5 giây) khi không.
 * Không phụ thuộc SSE nên vẫn cập nhật được khi luồng sự kiện bị proxy giữ lại.
 */
export function useVinfastPartsSyncStatus(enabled: boolean) {
  return useQuery({
    queryKey: ["vinfast-parts", "sync-status"],
    queryFn: async () =>
      (await api.get<VinfastSyncStatus>("/api/v1/vinfast-parts/sync/status"))
        .data,
    enabled,
    refetchInterval: (query) =>
      query.state.data?.running ? 2000 : enabled ? 5000 : false,
  });
}
