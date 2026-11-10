import * as React from "react";
import {
  consumeProcurementRequestIntent,
  useProcurementIntentStore,
} from "../procurement.intent";
import type { ProcurementListConfig } from "./procurementListConfig.type";

/**
 * Nhận ý định "lập đơn mua từ đề nghị" và mở drawer tạo đơn mua điền sẵn.
 * Chỉ danh sách đơn mua (có `requestApi`) được nhận ý định. Danh sách đề nghị bỏ qua,
 * để không lấy mất ý định của đơn mua cùng trang.
 */
export function useProcurementOrderIntent<T extends { id: string }>(
  config: ProcurementListConfig<T>,
  canCreate: boolean,
  openOrderDraft: (fromRequestId: string) => void,
) {
  const pendingRequestId = useProcurementIntentStore((s) => s.pendingRequestId);
  const acceptsIntent = Boolean(config.requestApi);

  React.useEffect(() => {
    if (!canCreate || !acceptsIntent) return;
    const fromRequestId = consumeProcurementRequestIntent();
    if (fromRequestId) openOrderDraft(fromRequestId);
  }, [canCreate, acceptsIntent, pendingRequestId, openOrderDraft]);
}
