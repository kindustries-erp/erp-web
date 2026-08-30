import React from "react";
import {
  GarageCaseReconciliationDrawer,
  type SettlementSubmissionItem,
  type ReconciliationTabKey,
} from "./GarageCaseReconciliationDrawer";

export type { SettlementSubmissionItem, ReconciliationTabKey };

export interface GarageCaseSettlementDrawerModalProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  caseCode?: string;
  initialTab?: ReconciliationTabKey;
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
  initialTab = "bank_cash",
  defaultType = "RECEIPT",
  suggestedAmount = 0,
  remainingReceivable,
  remainingPayable,
  existingTxnIds = [],
  editingItem = null,
  onSubmit,
}: GarageCaseSettlementDrawerModalProps) {
  return (
    <GarageCaseReconciliationDrawer
      open={open}
      onClose={onClose}
      caseId={caseId}
      caseCode={caseCode}
      initialTab={initialTab}
      defaultType={defaultType}
      suggestedAmount={suggestedAmount}
      remainingReceivable={remainingReceivable}
      remainingPayable={remainingPayable}
      existingTxnIds={existingTxnIds}
      editingItem={editingItem}
      onSubmitSettlements={onSubmit}
    />
  );
}
