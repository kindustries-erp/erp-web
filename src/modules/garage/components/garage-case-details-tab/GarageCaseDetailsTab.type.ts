export type GarageCaseDetailViewMode = "details" | "partner";

export interface GarageCasePartnerActionOptions {
  tabKey?: "quote_details" | "financials" | "linked_docs" | "sync_history";
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
}
