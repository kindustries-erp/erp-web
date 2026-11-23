import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { showProcurementError } from "../procurement.toast";
import type {
  ProcurementApi,
  ProcurementRequestDetail,
} from "../procurement.types";

/** Field liên kết của PR garage: tên chi nhánh hiển thị trên phiếu. */
export const REQUEST_BRANCH_LINK_FIELD = "branchName";

export interface ProcurementBranchLink {
  /** Tên chi nhánh nguồn đã lưu (snapshot server), `undefined` khi chưa biết. */
  sourceValue: string | null | undefined;
  /** Server báo `branchName` đang bị sửa khác chi nhánh. */
  overridden: boolean;
  /** Đọc lại chi nhánh ở server; chỉ có khi phiếu đã lưu. */
  onRefresh?: () => Promise<unknown>;
}

interface Input {
  api: ProcurementApi<unknown, unknown, unknown, unknown>;
  documentId?: string | null;
  creating: boolean;
  detail?: ProcurementRequestDetail;
  /** Chi nhánh đang chọn trong form (có thể chưa lưu). */
  branchId: string;
  /** Gọi sau khi làm mới: form phải nhận tên chi nhánh mới (và coi như đã lưu). */
  onRefreshed: (branchName: string) => void;
}

/**
 * Trạng thái field chi nhánh liên kết (link-override) cho drawer PR.
 * Trả `undefined` khi họ chứng từ không hỗ trợ (api không có `refreshLink`).
 * Làm mới ghi thẳng lên server rồi đẩy giá trị mới về form; không refetch để không mất phần đang sửa.
 * Chỉ làm mới được khi chi nhánh trong form trùng chi nhánh đã lưu: server đọc theo chi nhánh đã lưu,
 * nên làm mới lúc đã chọn chi nhánh khác (chưa lưu) sẽ ghép tên chi nhánh cũ với id mới.
 */
export function useProcurementRequestBranchLink({
  api,
  documentId,
  creating,
  detail,
  branchId,
  onRefreshed,
}: Input): ProcurementBranchLink | undefined {
  const { t } = useV2Translation();
  const snapshotValue = detail?.sourceSnapshot?.[REQUEST_BRANCH_LINK_FIELD];
  const fromSnapshot =
    typeof snapshotValue === "string" ? snapshotValue : undefined;
  // Giá trị vừa làm mới chỉ có hiệu lực khi snapshot đã lưu chưa đổi kể từ lúc làm mới.
  const [refreshed, setRefreshed] = React.useState<{
    value: string;
    basedOn: string | undefined;
  } | null>(null);
  const refreshLink = api.refreshLink;

  const refresh = useMutation({
    mutationFn: () => refreshLink!(documentId!, REQUEST_BRANCH_LINK_FIELD),
    onSuccess: (data) => {
      const name = data.branchName ?? "";
      setRefreshed({ value: name, basedOn: fromSnapshot });
      onRefreshed(name);
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.linkedField.refreshFailed", "Không cập nhật được từ nguồn"),
      ),
  });

  if (!refreshLink) return undefined;

  const sourceValue =
    refreshed && refreshed.basedOn === fromSnapshot
      ? refreshed.value
      : fromSnapshot;
  const savedBranchId = detail?.branchId ?? "";
  const canRefresh = !creating && Boolean(detail) && branchId === savedBranchId;

  return {
    sourceValue,
    overridden: Boolean(
      detail?.overriddenFields?.includes(REQUEST_BRANCH_LINK_FIELD),
    ),
    onRefresh: canRefresh ? () => refresh.mutateAsync() : undefined,
  };
}
