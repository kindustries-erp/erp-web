import React, { createContext, useContext } from "react";
import { useGarageCaseReconciliationLogic } from "../../GarageCaseReconciliationDrawer/useGarageCaseReconciliationLogic";
import type { GarageCaseFinancialsTabProps } from "../types";

type GarageCaseReconciliationLogicReturn = ReturnType<
  typeof useGarageCaseReconciliationLogic
>;

const GarageCaseFinancialsContext =
  createContext<GarageCaseReconciliationLogicReturn | null>(null);

export function useGarageCaseFinancials() {
  const context = useContext(GarageCaseFinancialsContext);
  if (!context) {
    throw new Error(
      "useGarageCaseFinancials must be used within a GarageCaseFinancialsProvider",
    );
  }
  return context;
}

export interface GarageCaseFinancialsProviderProps extends GarageCaseFinancialsTabProps {
  children: React.ReactNode;
}

export function GarageCaseFinancialsProvider({
  children,
  caseId,
  caseCode,
  caseData,
  editMode = false,
  onStartEdit,
  activeSettlements,
  activeLinkedInvoices,
  activeSummary,
  onAddSettlement,
  onRemoveSettlement,
  onAddInvoice,
  onRemoveInvoice,
  initialSubTab = "invoices_out",
}: GarageCaseFinancialsProviderProps) {
  void onStartEdit;
  const logic = useGarageCaseReconciliationLogic({
    open: true,
    onClose: () => {},
    caseId,
    caseCode,
    caseData,
    initialTab: initialSubTab,
    defaultType: "RECEIPT",
    editMode,
    activeLinkedInvoices,
    activeSettlements,
    activeSummary,
    onSubmitSettlements: onAddSettlement,
    onRemoveSettlement,
    onSubmitInvoices: onAddInvoice,
    onRemoveInvoice,
  });

  return (
    <GarageCaseFinancialsContext.Provider value={logic}>
      {children}
    </GarageCaseFinancialsContext.Provider>
  );
}
