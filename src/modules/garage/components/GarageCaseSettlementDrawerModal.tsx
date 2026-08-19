import React from "react";
import {
  VoucherNetoffSelectionModal,
  type SettlementSubmissionItem,
} from "@/modules/erp-invoices-core/components/VoucherNetoffSelectionModal";

export type { SettlementSubmissionItem };

export interface GarageCaseSettlementDrawerModalProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  caseCode?: string;
  defaultType?: "RECEIPT" | "PAYMENT";
  suggestedAmount?: number;
  remainingReceivable?: number;
  remainingPayable?: number;
  existingTxnIds?: string[];
  editingItem?: SettlementSubmissionItem | null;
  onSubmit: (items: SettlementSubmissionItem[]) => Promise<void> | void;
}

export function GarageCaseSettlementDrawerModal({
  open,
  onClose,
  caseId,
  caseCode,
  defaultType = "RECEIPT",
  suggestedAmount = 0,
  remainingReceivable,
  remainingPayable,
  existingTxnIds = [],
  editingItem = null,
  onSubmit,
}: GarageCaseSettlementDrawerModalProps) {
  return (
    <VoucherNetoffSelectionModal
      open={open}
      onClose={onClose}
      caseId={caseId}
      caseCode={caseCode}
      defaultType={defaultType}
      suggestedAmount={suggestedAmount}
      remainingReceivable={remainingReceivable}
      remainingPayable={remainingPayable}
      editingItem={editingItem}
      existingVoucherIds={existingTxnIds}
      mode="tabs"
      onSubmitItems={onSubmit}
    />
  );
}
