/** Nhóm cột của bảng kê phiếu dịch vụ, khớp `COMPLETED_CASES_COLUMNS` phía API. */
export const GARAGE_CASES_EXPORT_GROUP_KEYS = [
  "general",
  "receivable",
  "payable",
  "profit",
] as const;

export type GarageCasesExportGroupKey =
  (typeof GARAGE_CASES_EXPORT_GROUP_KEYS)[number];

export interface GarageCasesExportColumnItem {
  key: string;
  group: GarageCasesExportGroupKey;
  /** Nhãn mặc định (fallback khi thiếu khóa i18n). */
  defaultLabel: string;
}

export const ALL_GARAGE_CASES_EXPORT_COLUMNS: GarageCasesExportColumnItem[] = [
  { key: "index", group: "general", defaultLabel: "STT" },
  { key: "soChungTu", group: "general", defaultLabel: "Số phiếu" },
  { key: "bienSoXe", group: "general", defaultLabel: "Biển số xe" },
  { key: "khachHangCode", group: "general", defaultLabel: "Mã KH" },
  { key: "khachHangName", group: "general", defaultLabel: "Tên khách hàng" },
  { key: "tenTinhTrangDichVu", group: "general", defaultLabel: "Trạng thái" },
  { key: "classification", group: "general", defaultLabel: "Phân loại" },
  { key: "ngayTiepNhan", group: "general", defaultLabel: "Ngày tiếp nhận" },
  {
    key: "ngayHoanThanhCongViec",
    group: "general",
    defaultLabel: "Ngày hoàn thành",
  },
  { key: "branchName", group: "general", defaultLabel: "Chi nhánh" },

  { key: "phaiThuBaoHiem", group: "receivable", defaultLabel: "Phải thu BH" },
  { key: "phaiThuKhachHang", group: "receivable", defaultLabel: "Phải thu KH" },
  { key: "phaiThu", group: "receivable", defaultLabel: "Phải thu" },
  { key: "daThu", group: "receivable", defaultLabel: "Đã thu" },
  { key: "conPhaiThu", group: "receivable", defaultLabel: "Còn lại phải thu" },
  { key: "ghiChuThu", group: "receivable", defaultLabel: "Ghi chú thu" },
  { key: "duThu", group: "receivable", defaultLabel: "Dự thu" },

  {
    key: "chiPhiNhanCong",
    group: "payable",
    defaultLabel: "Chi phí nhân công",
  },
  { key: "chiPhiPhuTung", group: "payable", defaultLabel: "Chi phí phụ tùng" },
  { key: "phaiTra", group: "payable", defaultLabel: "Phải trả" },
  { key: "daTra", group: "payable", defaultLabel: "Đã trả" },
  { key: "conPhaiTra", group: "payable", defaultLabel: "Còn lại phải trả" },
  { key: "ghiChuTra", group: "payable", defaultLabel: "Ghi chú trả" },
  { key: "duChi", group: "payable", defaultLabel: "Dự chi" },

  { key: "doanhThu", group: "profit", defaultLabel: "Doanh thu" },
  { key: "chiPhi", group: "profit", defaultLabel: "Chi phí / Giá vốn" },
  { key: "loiNhuan", group: "profit", defaultLabel: "Lợi nhuận gộp" },
  { key: "margin", group: "profit", defaultLabel: "Biên LN (%)" },
  {
    key: "linkedInvoices",
    group: "profit",
    defaultLabel: "Hóa đơn VAT liên kết",
  },
];

/** Mặc định xuất đủ mọi cột, khớp hành vi khi API không nhận `selectedColumns`. */
export const DEFAULT_GARAGE_CASES_EXPORT_COLUMNS =
  ALL_GARAGE_CASES_EXPORT_COLUMNS.map((column) => column.key);

export const GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY =
  "garage_cases_export_columns_v1";

export function loadSavedGarageCasesExportColumns(): string[] {
  try {
    const saved = localStorage.getItem(GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((key): key is string => typeof key === "string");
      }
    }
  } catch {
    /* localStorage không khả dụng: dùng mặc định */
  }
  return DEFAULT_GARAGE_CASES_EXPORT_COLUMNS;
}

export function saveGarageCasesExportColumns(columns: string[]): void {
  try {
    localStorage.setItem(
      GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY,
      JSON.stringify(columns),
    );
  } catch {
    /* localStorage không khả dụng: bỏ qua */
  }
}
