import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import { buildProcurementRowActions } from "./procurementRowActions.builder";

export interface ProcurementRowActionsInput<T extends { id: string }> {
  config: ProcurementListConfig<T>;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  currentUserId?: string | null;
  currentUserEmail?: string | null;
  /** Mở drawer của một chứng từ ở chế độ xem hoặc sửa */
  openDrawer: (id: string, mode: "view" | "edit") => void;
  /** Mở modal lý do hoặc xác nhận cho một hành động chuyển trạng thái */
  start: (row: T, action: ProcurementActionKey) => void;
  /** Mở modal xóa nháp */
  openDelete: (row: T) => void;
  /** Chuyển sang lập PO từ PR */
  orderFromRequest: (row: T) => void;
  /** Nhân bản phiếu đã từ chối/hủy */
  cloneRow?: (row: T) => void;
  /** Quyền nhập kho và hành động mở trang nhập kho từ đơn mua */
  canReceive?: boolean;
  receive?: (row: T) => void;
}

/** Trả về hàm dựng menu theo dòng (xem `buildProcurementRowActions`), được memo theo quyền và cấu hình. */
export function useProcurementRowActions<T extends { id: string }>({
  config,
  canCreate,
  canUpdate,
  canDelete,
  currentUserId,
  currentUserEmail,
  openDrawer,
  start,
  openDelete,
  orderFromRequest,
  cloneRow,
  canReceive,
  receive,
}: ProcurementRowActionsInput<T>) {
  const { t } = useV2Translation();

  return React.useMemo(
    () =>
      buildProcurementRowActions<T>({
        t,
        config,
        canCreate,
        canUpdate,
        canDelete,
        currentUserId,
        currentUserEmail,
        openDrawer,
        start,
        openDelete,
        orderFromRequest,
        cloneRow,
        canReceive,
        receive,
      }),
    [
      canCreate,
      canDelete,
      canUpdate,
      currentUserId,
      currentUserEmail,
      config,
      openDelete,
      openDrawer,
      orderFromRequest,
      cloneRow,
      start,
      t,
      canReceive,
      receive,
    ],
  );
}
