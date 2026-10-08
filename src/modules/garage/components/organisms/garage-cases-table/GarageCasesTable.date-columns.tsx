import React from "react";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildDateColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const { t, dateRanges, onDateRangeChange } = ctx;

  const makeDateCol = (key: string, label: string, size = 130) => ({
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
    size,
    className: "text-right",
    cell: (item: any) => {
      // Ngày tiếp nhận: ưu tiên caseDate, fallback ngayTiepNhan || ngayPhatSinh
      // Ngày kết thúc: lấy 100% từ KGara (ngayHoanThanhCongViec), tuyệt đối không fallback sang ngày tiếp nhận
      const rawDate =
        key === "caseDate"
          ? item.caseDate || item.ngayTiepNhan || item.ngayPhatSinh
          : key === "ngayHoanThanhCongViec" || key === "completionDate"
            ? item.ngayHoanThanhCongViec ||
              item.rawData?.NgayHoanThanhCongViec ||
              null
            : item[key];

      return <TableDateCell date={rawDate} className="justify-end w-full" />;
    },
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
