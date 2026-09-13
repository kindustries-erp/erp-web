import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

export interface GarageCaseStatusTabDef {
  value: string;
  labelKey: string;
  defaultLabel: string;
}

export const GARAGE_CASE_STATUS_TABS: GarageCaseStatusTabDef[] = [
  { value: "all", labelKey: "cases.tabs.all", defaultLabel: "Tất cả" },
  {
    value: "quotation",
    labelKey: "cases.tabs.quotation",
    defaultLabel: "Báo giá",
  },
  {
    value: "in_progress",
    labelKey: "cases.tabs.inProgress",
    defaultLabel: "Đang làm",
  },
  {
    value: "completed",
    labelKey: "cases.tabs.completed",
    defaultLabel: "Kết thúc",
  },
];

export const DEFAULT_GARAGE_CASE_COLUMN_VISIBILITY: Record<string, boolean> = {
  caseDate: true,
  ngayHoanThanhCongViec: true,
  caseCode: true,
  licensePlate: true,
  customerCode: true,
  customerName: true,
  doanhThu: true,
  chiPhi: true,
  loiNhuan: true,
  margin: true,
  classification: true,
  statusName: true,
  collectionProgress: true,
  costProgress: true,
  isInsuranceClaim: true,
  branchName: false,
  createdAt: false,
  updatedAt: false,
  dataAsOf: false,
};

export const AUDIT_GARAGE_CASE_COLUMN_VISIBILITY: Record<string, boolean> = {
  caseDate: false,
  ngayHoanThanhCongViec: false,
  caseCode: true,
  licensePlate: true,
  customerName: true,
  doanhThu: true,
  chiPhi: true,
  loiNhuan: true,
  statusName: true,
  collectionProgress: true,
  costProgress: true,
  // Ẩn các cột không thuộc đối soát dòng tiền
  classification: false,
  customerCode: false,
  margin: false,
  isInsuranceClaim: false,
  branchName: false,
  createdAt: false,
  updatedAt: false,
  dataAsOf: false,
};

export const FINANCIAL_PROGRESS_COLUMN_VISIBILITY =
  AUDIT_GARAGE_CASE_COLUMN_VISIBILITY;

export const GARAGE_CASE_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...DEFAULT_GARAGE_CASE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
  {
    key: "audit",
    label: "Đối soát",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...AUDIT_GARAGE_CASE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
];

export interface ColumnGroupDef {
  groupKey: "general" | "financial";
  titleKey: string;
  defaultTitle: string;
  columns: Array<{
    key: string;
    labelKey: string;
    defaultLabel: string;
    defaultVisible?: boolean;
  }>;
}

export const GARAGE_CASE_COLUMN_GROUPS: ColumnGroupDef[] = [
  {
    groupKey: "general",
    titleKey: "cases.viewConfig.groupGeneral",
    defaultTitle: "Thông tin chung",
    columns: [
      {
        key: "caseDate",
        labelKey: "cases.columns.caseDate",
        defaultLabel: "Ngày tiếp nhận",
        defaultVisible: true,
      },
      {
        key: "ngayHoanThanhCongViec",
        labelKey: "cases.columns.completionDate",
        defaultLabel: "Ngày kết thúc",
        defaultVisible: true,
      },
      {
        key: "caseCode",
        labelKey: "cases.columns.caseCode",
        defaultLabel: "Số chứng từ",
        defaultVisible: true,
      },
      {
        key: "licensePlate",
        labelKey: "cases.columns.licensePlate",
        defaultLabel: "Biển số xe",
        defaultVisible: true,
      },
      {
        key: "customerCode",
        labelKey: "cases.columns.customerCode",
        defaultLabel: "Mã KH",
        defaultVisible: true,
      },
      {
        key: "customerName",
        labelKey: "cases.columns.customerName",
        defaultLabel: "Tên khách hàng",
        defaultVisible: true,
      },
      {
        key: "isInsuranceClaim",
        labelKey: "cases.columns.insurance",
        defaultLabel: "BH",
        defaultVisible: true,
      },
      {
        key: "branchName",
        labelKey: "cases.columns.branchName",
        defaultLabel: "Chi nhánh",
        defaultVisible: false,
      },
      {
        key: "createdAt",
        labelKey: "cases.columns.createdAt",
        defaultLabel: "Ngày tạo",
        defaultVisible: false,
      },
      {
        key: "updatedAt",
        labelKey: "cases.columns.updatedAt",
        defaultLabel: "Ngày cập nhật",
        defaultVisible: false,
      },
      {
        key: "dataAsOf",
        labelKey: "cases.columns.dataAsOf",
        defaultLabel: "Dữ liệu lúc",
        defaultVisible: false,
      },
    ],
  },
  {
    groupKey: "financial",
    titleKey: "cases.viewConfig.groupFinancial",
    defaultTitle: "Tài chính & Dòng tiền",
    columns: [
      {
        key: "doanhThu",
        labelKey: "cases.columns.doanhThu",
        defaultLabel: "Doanh thu",
        defaultVisible: true,
      },
      {
        key: "chiPhi",
        labelKey: "cases.columns.chiPhi",
        defaultLabel: "Chi phí",
        defaultVisible: true,
      },
      {
        key: "loiNhuan",
        labelKey: "cases.columns.loiNhuan",
        defaultLabel: "Lợi nhuận",
        defaultVisible: true,
      },
      {
        key: "margin",
        labelKey: "cases.columns.margin",
        defaultLabel: "Biên LN",
        defaultVisible: true,
      },
      {
        key: "classification",
        labelKey: "cases.columns.classification",
        defaultLabel: "Phân loại",
        defaultVisible: true,
      },
      {
        key: "statusName",
        labelKey: "cases.columns.status",
        defaultLabel: "Trạng thái",
        defaultVisible: true,
      },
      {
        key: "collectionProgress",
        labelKey: "cases.columns.collectionProgress",
        defaultLabel: "Tiến độ thu",
        defaultVisible: true,
      },
      {
        key: "costProgress",
        labelKey: "cases.columns.costProgress",
        defaultLabel: "Tiến độ chi",
        defaultVisible: true,
      },
    ],
  },
];

export function isQuotationStatus(
  statusName?: string,
  statusCode?: number,
): boolean {
  if (statusCode === 1) return true;
  if (!statusName) return false;
  const s = statusName.toLowerCase();
  return (
    s.includes("báo giá") ||
    s.includes("nháp") ||
    s.includes("chờ") ||
    s.includes("phụ tùng") ||
    s.includes("khách")
  );
}

export function isInProgressStatus(
  statusName?: string,
  statusCode?: number,
): boolean {
  if (statusCode === 0 || statusCode === 2) return true;
  if (!statusName) return false;
  const s = statusName.toLowerCase();
  if (
    isCompletedStatus(statusName, statusCode) ||
    s.includes("hủy") ||
    s.includes("từ chối")
  ) {
    return false;
  }
  return (
    s.includes("đang sửa") ||
    s.includes("đang làm") ||
    s.includes("tiếp nhận") ||
    s.includes("đang xử lý") ||
    s.includes("kiểm tra") ||
    s.includes("sửa chữa") ||
    s.includes("xử lý") ||
    s.includes("đang")
  );
}

export function isCompletedStatus(
  statusName?: string,
  statusCode?: number,
): boolean {
  if (statusCode === 3) return true;
  if (!statusName) return false;
  const s = statusName.toLowerCase();
  return (
    s.includes("kết thúc") ||
    s.includes("hoàn thành") ||
    s.includes("hoàn tất") ||
    s.includes("giao xe") ||
    s.includes("xong") ||
    s.includes("đã thanh toán")
  );
}
