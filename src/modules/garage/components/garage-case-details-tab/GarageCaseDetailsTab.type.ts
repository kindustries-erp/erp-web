import React from "react";

export type GarageCaseDetailSubTabKey =
  | "details"
  | "financials"
  | "linked_docs";
export type GarageCaseDetailViewMode = GarageCaseDetailSubTabKey | "partner";

export interface GarageCasePartnerActionOptions {
  tabKey?:
    | "quote_details"
    | "customer_details"
    | "partner_details"
    | "financials"
    | "linked_docs"
    | "sync_history";
  subTabKey?: GarageCaseDetailViewMode;
  editMode?: boolean;
}

export interface GarageCaseDetailsTabProps {
  selectedCase: any;
  grossProfit?: any;
  selectedBranchId?: string;
  defaultViewMode?: GarageCaseDetailViewMode;
  viewMode?: GarageCaseDetailViewMode;
  onViewModeChange?: (mode: GarageCaseDetailViewMode) => void;
  onSelectCase?: (
    caseCode: string,
    options?: GarageCasePartnerActionOptions,
  ) => void;
  financialsBadgeCount?: number;
  linkedDocsBadgeCount?: number;
  financialsSlot?: React.ReactNode;
  linkedDocsSlot?: React.ReactNode;
}
