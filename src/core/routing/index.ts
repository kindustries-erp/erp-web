import type { PageKey } from "@/shared/types";

/**
 * Flat list of all application routes.
 * Each entry maps a PageKey to its human-readable label and
 * the module/group it belongs to.
 */
export interface RouteConfig {
  key: PageKey;
  label: string;
  group: string;
}

export const ROUTES: RouteConfig[] = [
  { key: "dashboard", label: "Bảng điều khiển", group: "dashboard" },
  { key: "dongtien", label: "Tổng hợp dòng tiền", group: "cashflow" },
  { key: "tienmat", label: "Tiền mặt", group: "cashflow" },
  { key: "tiengui", label: "UNT / UNC", group: "cashflow" },
  { key: "dinhkem", label: "Tài liệu đính kèm", group: "cashflow" },
  { key: "thietlap-quy", label: "Quỹ tiền mặt", group: "settings" },
  { key: "thietlap-nh", label: "Tài khoản ngân hàng", group: "settings" },
  { key: "thietlap-tk", label: "Hệ thống tài khoản", group: "settings" },
  { key: "phaithu", label: "Phải thu", group: "debt" },
  { key: "phaittra", label: "Phải trả", group: "debt" },
  { key: "socat", label: "Sổ cái", group: "reports" },
  { key: "nhatkyechung", label: "Nhật ký chung", group: "reports" },
  { key: "doitac", label: "Đối tác", group: "partners" },
  { key: "nhansu", label: "Nhân sự", group: "hr" },
  { key: "banhang", label: "Bán hàng", group: "sales" },
  { key: "khachhang", label: "Khách hàng", group: "sales" },
  { key: "muahang", label: "Mua hàng", group: "purchasing" },
  { key: "nhacungcap", label: "Nhà cung cấp", group: "purchasing" },
  { key: "phanquyen", label: "Phân quyền & Vai trò", group: "system" },
];
