import {
  createExportProgressStore,
  type ExportJobScope,
} from "@/shared/export-jobs";

const BASE = "/api/v1/greenway";

function makeScope(key: string, root: string): ExportJobScope {
  return {
    key,
    startPath: `${root}/background`,
    historyPath: `${root}/background/history`,
    streamPath: `${root}/progress/stream`,
    downloadPath: (jobId) =>
      `${root}/background/${encodeURIComponent(jobId)}/download`,
  };
}

/** Xuất bảng kê phiếu dịch vụ (`GARAGE`). */
export const garageCasesExportScope = makeScope(
  "garage-cases",
  `${BASE}/cases/export/excel`,
);
/** Báo cáo Garage theo kỳ ở tab Tổng quan (`GARAGE` + `GARAGE_DEBTS`). */
export const garageDashboardExportScope = makeScope(
  "garage-dashboard",
  `${BASE}/dashboard/export`,
);
/** Xuất công nợ tổng hợp - cả khách hàng và nhà cung cấp (`GARAGE_DEBTS`). */
export const garageAllDebtsExportScope = makeScope(
  "garage-all-debts",
  `${BASE}/debts/all/export`,
);
/** Xuất công nợ phải thu - khách hàng (`GARAGE_DEBTS`). */
export const garageCustomersDebtExportScope = makeScope(
  "garage-customers-debt",
  `${BASE}/cases/customers-debt/export`,
);
/** Xuất công nợ phải trả - nhà cung cấp (`GARAGE_DEBTS`). */
export const garageSuppliersDebtExportScope = makeScope(
  "garage-suppliers-debt",
  `${BASE}/payables/suppliers-debt/export`,
);
/** Xuất chi phí vận hành Garage (`GARAGE`). */
export const garageOpexExportScope = makeScope(
  "garage-opex",
  `${BASE}/opex/export`,
);

export const useGarageCasesExportStore = createExportProgressStore();
export const useGarageDashboardExportStore = createExportProgressStore();
export const useGarageAllDebtsExportStore = createExportProgressStore();
export const useGarageCustomersDebtExportStore = createExportProgressStore();
export const useGarageSuppliersDebtExportStore = createExportProgressStore();
export const useGarageOpexExportStore = createExportProgressStore();

/** Body xuất nền cases (khớp `GarageCasesExportDto`, không thêm field lạ). */
export interface GarageCasesExportPayload {
  mode: "by-period" | "by-current-filter";
  date_from?: string;
  date_to?: string;
  date_type?: "completion_date" | "case_date";
  classification?: string;
  status?: string;
  q?: string;
  sorts?: string[];
  filtersStr?: string;
}

/** Body xuất nền báo cáo Garage theo kỳ (khớp `GarageDashboardExportDto`). */
export interface GarageDashboardExportPayload {
  from?: string;
  to?: string;
}

/** Body xuất nền công nợ (khớp `GarageDebtsExportDto`). */
export interface GarageDebtsExportPayload {
  mode: "by-period" | "by-current-filter";
  from?: string;
  to?: string;
  q?: string;
  sorts?: string[];
  filtersStr?: string;
  column_filters?: string;
  column_search?: string;
}

/** Body xuất nền chi phí vận hành (khớp `GarageOpexExportDto`). */
export interface GarageOpexExportPayload {
  mode: "by-period" | "by-current-filter";
  date_from?: string;
  date_to?: string;
  year?: number;
  month?: number;
  cost_group?: string;
  category_key?: string;
  sorts?: string[];
  column_filters?: string;
  column_search?: string;
}

/** Điều kiện của bảng đang xem, truyền từ bảng sang drawer. */
export type GarageDebtsTableQuery = Omit<GarageDebtsExportPayload, "mode">;
export type GarageCasesTableQuery = Pick<
  GarageCasesExportPayload,
  "date_from" | "date_to" | "q" | "sorts" | "filtersStr"
>;
export type GarageOpexTableQuery = Omit<GarageOpexExportPayload, "mode">;

export function branchHeaders(branchId?: string): Record<string, string> {
  return { "x-greenway-branch-id": branchId || "" };
}
