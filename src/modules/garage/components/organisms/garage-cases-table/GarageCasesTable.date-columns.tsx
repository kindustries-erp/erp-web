import React from "react";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildDateColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const { t, dateRanges, onDateRangeChange } = ctx;

  const makeDateCol = (key: string, label: string) => ({
    key,
    label,
    header: makeHdr(key, label, {
      hideFilter: true,
      isActive: Boolean(dateRanges[key]?.from || dateRanges[key]?.to),
      dateRangeSlot: ({ close }: { close: () => void }) => (
        <DateRangeColumnSlot
          dateFrom={dateRanges[key]?.from}
          dateTo={dateRanges[key]?.to}
          onChange={(f, to) => {
            onDateRangeChange(key, f, to);
            close();
          }}
          onClose={close}
        />
      ),
    }),
    size: 150,
    className: "text-right",
    cell: (item: any) => (
      <TableDateCell
        date={item[key] || item.ngayTiepNhan || item.ngayPhatSinh}
        className="justify-end w-full"
      />
    ),
  });

  return {
    caseDate: makeDateCol(
      "caseDate",
      t("cases.columns.caseDate", "Ngày tiếp nhận"),
    ),
    completionDate: makeDateCol(
      "ngayHoanThanhCongViec",
      t("cases.columns.completionDate", "Ngày kết thúc"),
    ),
    createdAt: makeDateCol(
      "createdAt",
      t("cases.columns.createdAt", "Ngày tạo"),
    ),
    updatedAt: makeDateCol(
      "updatedAt",
      t("cases.columns.updatedAt", "Ngày cập nhật"),
    ),
    dataAsOf: makeDateCol(
      "dataAsOf",
      t("cases.columns.dataAsOf", "Dữ liệu lúc"),
    ),
  };
}
