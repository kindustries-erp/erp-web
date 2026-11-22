/**
 * Hình dạng dữ liệu hiển thị của dashboard garage (lõi UI).
 * Lõi không import kiểu của module: module ánh xạ DTO sang các kiểu này.
 * Mọi số xe là số biển khác nhau; số lệnh và tiền cộng theo lệnh.
 */

export type CasesDashboardFunnelStageKey =
  | "quotation"
  | "inProgress"
  | "completed"
  | "cancelled";

export type CasesDashboardClassKey =
  | "SUA_CHUA_CHUNG"
  | "KY_GUI_NOI_BO"
  | "OJ_NGOAI"
  | "KHAC";

/** Số liệu một thẻ KPI: xe, lệnh và tiền. */
export interface CasesDashboardKpiView {
  vehicles: number;
  /** Bỏ trống khi nguồn không có số lệnh (ví dụ dự thu). */
  cases?: number;
  amount: number;
}

/** Một dòng phễu: số xe, tiền và tỷ lệ (%) so với tổng nhóm. */
export interface CasesDashboardFunnelRowView {
  key: CasesDashboardFunnelStageKey;
  vehicles: number;
  amount: number;
  rate: number;
}

/** Một dòng bảng phân loại. */
export interface CasesDashboardClassRowView {
  key: CasesDashboardClassKey;
  vehicles: number;
  cases: number;
  amount: number;
}
