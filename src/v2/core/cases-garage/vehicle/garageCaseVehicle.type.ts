/** Trường xe và đối tượng thanh toán của phiếu dịch vụ (tên trùng API V1 `/greenway/cases` và V2 `cases-garage`). */
export interface GarageCaseVehicleFields {
  soKhung?: string | null;
  hangXeCode?: string | null;
  hangXeName?: string | null;
  dongXeCode?: string | null;
  dongXeName?: string | null;
  namSanXuat?: number | null;
  doiTuongThanhToanCode?: string | null;
  doiTuongThanhToanName?: string | null;
}

export type GarageCaseVehicleColumnKey =
  | "soKhung"
  | "hangXe"
  | "dongXe"
  | "namSanXuat"
  | "doiTuongThanhToan";

export interface GarageCaseVehicleColumnConfig {
  key: GarageCaseVehicleColumnKey;
  /** Khóa chữ trong locale core (`v2.garageCases.vehicle.*`) */
  localeKey: string;
  defaultLabel: string;
  sortable: boolean;
  filterable: boolean;
  defaultVisible: boolean;
  /** Độ rộng gợi ý (px) */
  size: number;
}

export interface GarageCaseVehicleInfoRow {
  key: GarageCaseVehicleColumnKey;
  localeKey: string;
  defaultLabel: string;
  value: string | null;
  /** Mã phụ hiển thị cạnh giá trị (nếu có) */
  code: string | null;
}
