export type CaseLineType = "DV" | "PT" | "RECEIVABLE";
export type CaseLinePayer = "KH" | "BH" | "GARAGE";

export interface CaseLinePaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  caseId: string;
  caseCode?: string;
  caseData?: any;
  lineId?: string;
  lineCode?: string;
  lineName?: string;
  lineAmount?: number;
  lineType?: CaseLineType;
  payer?: CaseLinePayer;
  direction?: "REVENUE" | "COST";
  activeSettlements?: any[];
  activeLinkedInvoices?: any[];
  onSuccess?: () => void;
  onAddSettlement?: (items: any[]) => void;
  onRemoveSettlement?: (id: string) => void;
  onAddInvoice?: (payload: any) => void;
  onRemoveInvoice?: (id: string) => void;
}
