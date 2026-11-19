import type { GarageCaseVehicleColumnConfig } from "./garageCaseVehicle.type";

const K = "v2.garageCases.vehicle.";

/**
 * Cấu hình 5 cột xe/đối tượng thanh toán. `key` cũng là khóa lọc/sắp xếp phía API
 * (`getCaseColumnSelectExpr`), bảng V1 và V2 cùng đọc mảng này.
 */
export const GARAGE_CASE_VEHICLE_COLUMNS: readonly GarageCaseVehicleColumnConfig[] =
  [
    {
      key: "soKhung",
      localeKey: `${K}soKhung`,
      defaultLabel: "Số khung",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      size: 170,
    },
    {
      key: "hangXe",
      localeKey: `${K}hangXe`,
      defaultLabel: "Hãng xe",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      size: 130,
    },
    {
      key: "dongXe",
      localeKey: `${K}dongXe`,
      defaultLabel: "Dòng xe",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      size: 130,
    },
    {
      key: "namSanXuat",
      localeKey: `${K}namSanXuat`,
      defaultLabel: "Năm SX",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      size: 90,
    },
    {
      key: "doiTuongThanhToan",
      localeKey: `${K}doiTuongThanhToan`,
      defaultLabel: "Đối tượng thanh toán",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      size: 190,
    },
  ];

export const GARAGE_CASE_VEHICLE_COLUMN_KEYS = GARAGE_CASE_VEHICLE_COLUMNS.map(
  (c) => c.key,
);
