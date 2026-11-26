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
  soKhung?: string | null;
  hangXeCode?: string | null;
  hangXeName?: string | null;
  dongXeCode?: string | null;
  dongXeName?: string | null;
  namSanXuat?: number | null;
  khachHangName: string;
  khachHangCode?: string | null;
  /** Tên khách in trên phiếu KGara (có thể khác tên danh mục). */
  tenKhachHang?: string | null;
  payerType: "KH" | "BH";
  partnerType: "insurance" | "enterprise" | "individual";
  debtorName: string;
  invoiceNo?: string;
  /** Đã xuất hóa đơn nhưng API không trả số hóa đơn (checkpoint). */
  hasInvoice?: boolean;
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
  /** Khóa xe; có ở danh sách checkpoint để gom theo xe. */
  vehicleKey?: string;
  /** Hàng gom theo xe: số lệnh của xe trong bộ lọc hiện tại. */
  caseCount?: number;
  /** Hàng gom theo xe: các lệnh (mới nhất trước) để mở rộng. */
  childCases?: GarageCaseDetailRow[];
}

export interface FunnelStageCounts {
  total: number;
  quotation: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface GarageCasesTableTabProps {
  cases: GarageCaseDetailRow[];
  initialDebtType?: "receivables" | "payables";
  onOpenCaseDetail?: (caseCode: string) => void;
  showProfitMetrics?: boolean;
  filterMode?: "partner" | "classification";
  classification?: string;
  funnelCounts?: FunnelStageCounts;
  isFunnelScope?: boolean;
  initialCategoryFilter?: string;
  /** Tổng số xe theo API (checkpoint); lớn hơn số đã tải thì báo bị cắt. */
  vehicleTotal?: number;
}
