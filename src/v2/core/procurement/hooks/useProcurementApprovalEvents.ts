import { useQuery } from "@tanstack/react-query";
import type {
  ProcurementApi,
  ProcurementApprovalEvent,
} from "../procurement.types";

/** Nhật ký duyệt của một chứng từ. Không có `documentId` (đang tạo mới) thì không gọi API. */
export function useProcurementApprovalEvents(
  documentId: string | null | undefined,
  api: ProcurementApi<unknown>,
  queryKey: string,
) {
  return useQuery<ProcurementApprovalEvent[]>({
    queryKey: [queryKey, "approval-events", documentId],
    queryFn: async () => {
      if (!documentId || !api.approvalEvents) return [];
      return api.approvalEvents(documentId);
    },
    enabled: Boolean(documentId),
  });
}
