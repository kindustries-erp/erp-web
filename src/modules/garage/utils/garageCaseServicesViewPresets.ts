import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

export const DEFAULT_GARAGE_SERVICE_COLUMN_VISIBILITY: Record<string, boolean> =
  {
    caseDate: true,
    completionDate: false,
    soChungTu: true,
    bienSoXe: true,
    khachHangName: true,
    loaiSanPhamCode: true,
    sanPhamCode: true,
    sanPhamName: true,
    donViTinhText: true,
    soLuongHoaDon: true,
    donGia: true,
    tienChuaThue: false,
    thueSuat: false,
    tienCoThue: true,
    tienDichVu: false,
    tienPhuTung: false,
    giaVonPhuTung: false,
    tienChietKhauCt: false,
    khoCode: false,
    branchName: false,
    statusName: true,
    classification: false,
  };

export const ALL_GARAGE_SERVICE_COLUMN_VISIBILITY: Record<string, boolean> = {
  caseDate: true,
  completionDate: true,
  soChungTu: true,
  bienSoXe: true,
  khachHangName: true,
  loaiSanPhamCode: true,
  sanPhamCode: true,
  sanPhamName: true,
  donViTinhText: true,
  soLuongHoaDon: true,
  donGia: true,
  tienChuaThue: true,
  thueSuat: true,
  tienCoThue: true,
  tienDichVu: true,
  tienPhuTung: true,
  giaVonPhuTung: true,
  tienChietKhauCt: true,
  khoCode: true,
  branchName: true,
  statusName: true,
  classification: true,
};

export const FINANCIAL_GARAGE_SERVICE_COLUMN_VISIBILITY: Record<
  string,
  boolean
> = {
  caseDate: true,
  completionDate: true,
  soChungTu: true,
  bienSoXe: true,
  khachHangName: true,
  loaiSanPhamCode: true,
  sanPhamCode: true,
  sanPhamName: true,
  donViTinhText: true,
  soLuongHoaDon: true,
  donGia: true,
  tienChuaThue: true,
  thueSuat: true,
  tienCoThue: true,
  tienDichVu: true,
  tienPhuTung: true,
  giaVonPhuTung: true,
  tienChietKhauCt: true,
  khoCode: false,
  branchName: false,
  statusName: false,
  classification: false,
};

export const GARAGE_SERVICE_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "all_columns",
    label: "Tất cả cột",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...ALL_GARAGE_SERVICE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...DEFAULT_GARAGE_SERVICE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
  {
    key: "financial",
    label: "Chi phí & Giá vốn",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...FINANCIAL_GARAGE_SERVICE_COLUMN_VISIBILITY,
    },
    isCustom: false,
  },
];
