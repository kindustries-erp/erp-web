import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2SearchParams } from "@/v2/shared/hooks/useV2SearchParams";
import { updateV2SearchParams } from "@/v2/shared/utils/v2Url";
import {
  applyApprovalGate,
  type ApprovalGate,
  type ApprovalSubject,
} from "../approval/approval.gate";
import { showProcurementError } from "../procurement.toast";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import type { ProcurementListState } from "./useProcurementList";

export const DEEP_LINK_OPEN_PARAM = "open";
export const DEEP_LINK_ACTION_PARAM = "action";

type DeepLinkRow = { id: string; status?: string; createdBy?: string | null };

const subjectOf = (row: DeepLinkRow): ApprovalSubject => {
  const r = row as DeepLinkRow & { approval?: { approverId?: string | null } };
  return {
    approverId: r.approval?.approverId ?? null,
    createdBy: r.createdBy ?? null,
  };
};

/**
 * Mở chứng từ từ URL (`?open=<id>&action=APPROVE`), dùng khi bấm thông báo.
 * - Đúng người duyệt được chỉ định và phiếu đang chờ duyệt: mở modal duyệt.
 * - Yêu cầu duyệt nhưng phiếu đã không còn chờ duyệt: hiện modal "đã xử lý" (không mở drawer im lặng).
 * - Còn lại: mở drawer xem phiếu. Backend vẫn kiểm quyền khi duyệt thật.
 * Sau khi xử lý, xóa `open` và `action` khỏi URL để tải lại không mở lại.
 */
export function useProcurementDeepLink<T extends DeepLinkRow>(
  config: ProcurementListConfig<T>,
  state: Pick<
    ProcurementListState<T>,
    "start" | "openView" | "approval" | "showAlreadyDecided"
  >,
): void {
  const { t } = useV2Translation();
  const params = useV2SearchParams();
  const openId = params.get(DEEP_LINK_OPEN_PARAM);
  const action = params.get(DEEP_LINK_ACTION_PARAM);
  const handledRef = React.useRef<string | null>(null);

  const detail = useQuery({
    queryKey: [config.queryKey, "deep-link", openId],
    queryFn: () => config.api.get(openId as string),
    enabled: Boolean(openId),
    retry: false,
  });

  const { start, openView, showAlreadyDecided } = state;
  const gate: ApprovalGate = state.approval.gate;
  const rowLabel = config.rowLabel;

  React.useEffect(() => {
    if (!openId) {
      handledRef.current = null;
      return;
    }
    if (handledRef.current === openId) return;

    const clearParams = () =>
      updateV2SearchParams((search) => {
        search.delete(DEEP_LINK_OPEN_PARAM);
        search.delete(DEEP_LINK_ACTION_PARAM);
      }, "replace");

    if (detail.isError) {
      handledRef.current = openId;
      showProcurementError(
        detail.error,
        t(
          "v2.procurement.deepLink.notFound",
          "Không tìm thấy chứng từ hoặc bạn không có quyền xem",
        ),
      );
      clearParams();
      return;
    }
    if (!detail.data) return;

    handledRef.current = openId;
    const row = detail.data as T;
    const canApprove =
      action === "APPROVE" &&
      row.status === "PENDING_APPROVAL" &&
      applyApprovalGate(["approve"], gate, subjectOf(row)).includes("approve");

    if (canApprove) start(row, "approve");
    else if (action === "APPROVE" && row.status !== "PENDING_APPROVAL") {
      showAlreadyDecided({
        rowLabel: rowLabel(row),
        status: row.status ?? null,
      });
    } else openView(openId);
    clearParams();
  }, [
    openId,
    action,
    detail.data,
    detail.isError,
    detail.error,
    gate,
    start,
    openView,
    showAlreadyDecided,
    rowLabel,
    t,
  ]);
}
