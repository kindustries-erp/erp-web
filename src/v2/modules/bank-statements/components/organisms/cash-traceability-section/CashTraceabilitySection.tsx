import * as React from "react";
import {
  V2DocumentTraceability,
  type TraceabilityNode,
} from "@/v2/shared/components/organisms/v2-document-traceability";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { cashTransactionApi } from "../../../api/cashTransactionApi";
import { useInvoiceNetOffMutations } from "../../../api/mutations/useInvoiceNetOffMutations";
import { CashInvoiceNetOffModal } from "../cash-invoice-netoff-modal";
import type { NetOffPayloadItem } from "../cash-invoice-netoff-modal";
import { toOpenDocumentDetail } from "./cashTraceability.helper";

export interface CashTraceabilitySectionProps {
  transactionId: string;
  editMode: boolean;
  /** Chiều hóa đơn cấn trừ: thu (OUT) là hóa đơn đầu ra, chi (IN) là đầu vào */
  direction: "IN" | "OUT";
  existingInvoiceIds: string[];
  /** Số tiền còn có thể cấn trừ của giao dịch */
  maxAvailableAmount: number;
}

/** Tab Chứng từ liên kết: sơ đồ truy vết (bản V2) với thêm và gỡ hóa đơn cấn trừ khi sửa */
export function CashTraceabilitySection({
  transactionId,
  editMode,
  direction,
  existingInvoiceIds,
  maxAvailableAmount,
}: CashTraceabilitySectionProps) {
  const { t } = useV2Translation();
  const { link, unlink } = useInvoiceNetOffMutations(transactionId);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const fail = (error: unknown) =>
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title:
        (error as { message?: string })?.message ||
        t("v2.bankStatements.cashDetail.error.updateInfo"),
    });

  /** Liên kết từng hóa đơn đã chọn; một khoản lỗi thì dừng và báo */
  const handleSelect = async (items: NetOffPayloadItem[]) => {
    for (const item of items) {
      try {
        await link.mutateAsync(item);
      } catch (error) {
        fail(error);
        return;
      }
    }
  };

  const handleUnlink = (node: TraceabilityNode) => {
    unlink.mutate(node.id, { onError: fail });
  };

  const handleOpenDocument = (node: TraceabilityNode) => {
    const detail = toOpenDocumentDetail(node.docType, node.id);
    if (detail)
      window.dispatchEvent(new CustomEvent("open_erp_document", { detail }));
  };

  return (
    <>
      <V2DocumentTraceability
        rootId={transactionId}
        fetchGraph={(id) => cashTransactionApi.getTraceabilityGraph(id)}
        editMode={editMode}
        allowedDocTypes={["INVOICE"]}
        onAddLink={() => setPickerOpen(true)}
        onUnlinkNode={handleUnlink}
        onOpenDocument={handleOpenDocument}
      />
      <CashInvoiceNetOffModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        direction={direction}
        existingInvoiceIds={existingInvoiceIds}
        maxAvailableAmount={maxAvailableAmount}
      />
    </>
  );
}
