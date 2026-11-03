/** Nhóm cột của bảng kê phiếu dịch vụ, khớp `COMPLETED_CASES_COLUMNS` phía API. */
export const GARAGE_CASES_EXPORT_GROUP_KEYS = [
  "general",
  "receivable",
  "payable",
  "profit",
  "system",
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

  { key: "vatAmount", group: "profit", defaultLabel: "Thuế GTGT" },
  { key: "doanhThu", group: "profit", defaultLabel: "Doanh thu" },
  { key: "chiPhi", group: "profit", defaultLabel: "Chi phí / Giá vốn" },
  { key: "loiNhuan", group: "profit", defaultLabel: "Lợi nhuận gộp" },
  { key: "margin", group: "profit", defaultLabel: "Biên LN (%)" },
  {
    key: "linkedInvoices",
    group: "profit",
    defaultLabel: "Hóa đơn VAT liên kết",
  },

  // Cột tùy chọn: không nằm trong mặc định, chỉ có khi người dùng chọn.
  { key: "exclusionRules", group: "system", defaultLabel: "Quy tắc loại trừ" },
  { key: "createdAt", group: "system", defaultLabel: "Ngày tạo" },
  { key: "updatedAt", group: "system", defaultLabel: "Ngày cập nhật" },
  { key: "dataAsOf", group: "system", defaultLabel: "Dữ liệu lúc" },
];

/** Các cột nằm ngoài bộ mặc định 30 cột (chỉ xuất khi người dùng chọn). */
const OPTIONAL_GARAGE_CASES_EXPORT_KEYS = new Set([
  "exclusionRules",
  "createdAt",
  "updatedAt",
  "dataAsOf",
]);

/** Mặc định xuất đủ mọi cột, khớp hành vi khi API không nhận `selectedColumns`. */
export const DEFAULT_GARAGE_CASES_EXPORT_COLUMNS =
  ALL_GARAGE_CASES_EXPORT_COLUMNS.filter(
    (column) => !OPTIONAL_GARAGE_CASES_EXPORT_KEYS.has(column.key),
  ).map((column) => column.key);

export const GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY =
  "garage_cases_export_columns_v2";

/** Key v1 đã lưu trước khi Thuế GTGT thành cột mặc định; chỉ đọc để chuyển sang v2. */
const LEGACY_GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY =
  "garage_cases_export_columns_v1";

function readStoredColumns(storageKey: string): string[] | null {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((key): key is string => typeof key === "string");
      }
    }
  } catch {
    /* localStorage không khả dụng hoặc dữ liệu hỏng: bỏ qua */
  }
  return null;
}

/** Chèn Thuế GTGT ngay trước Doanh thu; thiếu Doanh thu thì thêm cuối. */
function insertVatColumn(columns: string[]): string[] {
  if (columns.includes("vatAmount")) return columns;
  const next = [...columns];
  const revenueIdx = next.indexOf("doanhThu");
  if (revenueIdx < 0) next.push("vatAmount");
  else next.splice(revenueIdx, 0, "vatAmount");
  return next;
}

export function loadSavedGarageCasesExportColumns(): string[] {
  const current = readStoredColumns(GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY);
  if (current) return current;

  const legacy = readStoredColumns(
    LEGACY_GARAGE_CASES_EXPORT_COLUMNS_STORAGE_KEY,
  );
  if (legacy) {
    // Chuyển một lần: sau khi lưu v2, người dùng bỏ tick VAT sẽ không bị chèn lại.
    const migrated = insertVatColumn(legacy);
    saveGarageCasesExportColumns(migrated);
    return migrated;
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
