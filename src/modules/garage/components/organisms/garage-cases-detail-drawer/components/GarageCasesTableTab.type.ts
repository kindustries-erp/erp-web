export type PartnerDebtCategory =
  | "all"
  | "insurance"
  | "enterprise"
  | "individual";

export type GarageClassificationCategory =
  | "ALL"
  | "SUA_CHUA_CHUNG"
  | "KY_GUI_NOI_BO"
  | "OJ_NGOAI"
  | "KHAC";

export interface GarageCaseDetailRow {
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
  revenue?: number;
  profit?: number;
  classification?: string;
  tinhTrangDichVu?: number;
  serviceStatus?: string;
}

export interface GarageCasesTableTabProps {
  cases: GarageCaseDetailRow[];
  initialDebtType?: "receivables" | "payables";
  onOpenCaseDetail?: (caseCode: string) => void;
  showProfitMetrics?: boolean;
  filterMode?: "partner" | "classification";
  classification?: string;
  funnelCounts?: {
    total: number;
    quotation: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  isFunnelScope?: boolean;
  initialCategoryFilter?: string;
}
