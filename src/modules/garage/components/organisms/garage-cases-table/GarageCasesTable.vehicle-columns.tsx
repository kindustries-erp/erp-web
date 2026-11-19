import React from "react";
import {
  GARAGE_CASE_VEHICLE_COLUMNS,
  GarageCasePayerCell,
  GarageCaseVehicleCell,
  formatModelYear,
  formatPayer,
  formatVehicleBrand,
  formatVehicleModel,
  type GarageCaseVehicleColumnKey,
} from "@/v2/core/garage-cases";
import type { ColumnContext } from "./GarageCasesTable.type";

const renderers: Record<
  GarageCaseVehicleColumnKey,
  (item: any) => React.ReactNode
> = {
  soKhung: (item) => (
    <GarageCaseVehicleCell value={item.soKhung?.trim()} mono />
  ),
  hangXe: (item) => <GarageCaseVehicleCell value={formatVehicleBrand(item)} />,
  dongXe: (item) => <GarageCaseVehicleCell value={formatVehicleModel(item)} />,
  namSanXuat: (item) => <GarageCaseVehicleCell value={formatModelYear(item)} />,
  doiTuongThanhToan: (item) => (
    <GarageCasePayerCell
      name={formatPayer(item)}
      code={item.doiTuongThanhToanName ? item.doiTuongThanhToanCode : null}
    />
  ),
};

/** Cột xe/đối tượng thanh toán, dựng từ cấu hình dùng chung của core garage-cases. */
export function buildVehicleColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const { t, tableState } = ctx;
  return GARAGE_CASE_VEHICLE_COLUMNS.map((col) => {
    const label = t(`cases.columns.${col.key}`, col.defaultLabel);
    return {
      key: col.key,
      label,
      header: makeHdr(col.key, label, {
        align: "left",
        isActive: Boolean(tableState.columnFilters[col.key]?.length),
      }),
      size: col.size,
      className: "text-left",
      cell: renderers[col.key],
    };
  });
}
