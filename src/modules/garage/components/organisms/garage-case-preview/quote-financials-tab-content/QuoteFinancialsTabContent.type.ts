import type {
  CaseLinePayer,
  CaseLineType,
} from "../../../organisms/case-line-payment-drawer";

export interface PaymentDrawerTarget {
  lineId?: string;
  lineCode?: string;
  lineName?: string;
  lineAmount?: number;
  lineType: CaseLineType;
  payer: CaseLinePayer;
  direction?: "REVENUE" | "COST";
}

export interface QuoteFinancialsTabContentProps {
  caseId: string;
  caseCode?: string;
  caseData: any;
  grossProfit?: any;
  className?: string;
  editMode?: boolean;
  activeSettlements?: any[];
  activeLinkedInvoices?: any[];
  onPaymentSaved?: () => void;
}
