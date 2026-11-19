export type PartnerDebtCategory =
  | "all"
  | "insurance"
  | "enterprise"
  | "individual";

export interface DebtRemainingCaseRow {
  rowKey: string;
  id: string;
  soChungTu: string;
  ngayHoanThanh?: string;
  bienSoXe: string;
  khachHangName: string;
  khachHangCode?: string | null;
  payerType: "KH" | "BH";
  partnerType: "insurance" | "enterprise" | "individual";
  debtorName: string;
  invoiceNo?: string;
  vatWarning?: boolean;
  billed: number;
  paid: number;
  remaining: number;
  cost: number;
  paidCost: number;
  remainingCost: number;
}

export interface DebtRemainingCasesTabProps {
  cases: DebtRemainingCaseRow[];
  initialDebtType?: "receivables" | "payables";
  onOpenCaseDetail?: (caseCode: string) => void;
}
