import React from "react";
import { money } from "@/shared/utils/format";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildFinancialColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const { t } = ctx;

  return [
    {
      key: "doanhThu",
      label: t("cases.columns.doanhThu", "Doanh thu"),
      header: makeHdr("doanhThu", t("cases.columns.doanhThu", "Doanh thu"), {
        align: "right",
        showBlankOption: true,
        formatOptionLabel: (v: string) =>
          v === "__BLANK__" ? "(Trống / 0 đ)" : money(Number(v) || 0),
      }),
      size: 160,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) => (item.doanhThu ? money(Number(item.doanhThu)) : "—"),
    },
    {
      key: "chiPhi",
      label: t("cases.columns.chiPhi", "Chi phí"),
      header: makeHdr("chiPhi", t("cases.columns.chiPhi", "Chi phí"), {
        align: "right",
        showBlankOption: true,
        formatOptionLabel: (v: string) =>
          v === "__BLANK__" ? "(Trống / 0 đ)" : money(Number(v) || 0),
      }),
      size: 160,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) => (item.chiPhi ? money(Number(item.chiPhi)) : "—"),
    },
    {
      key: "loiNhuan",
      label: t("cases.columns.loiNhuan", "Lợi nhuận"),
      header: makeHdr("loiNhuan", t("cases.columns.loiNhuan", "Lợi nhuận"), {
        align: "right",
        showBlankOption: true,
        formatOptionLabel: (v: string) =>
          v === "__BLANK__" ? "(Trống / 0 đ)" : money(Number(v) || 0),
      }),
      size: 160,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) => {
        const val = Number(item.loiNhuan) || 0;
        return (
          <span className={val >= 0 ? "text-emerald-600" : "text-rose-600"}>
            {money(val)}
          </span>
        );
      },
    },
    {
      key: "margin",
      label: t("cases.columns.margin", "Biên LN"),
      header: makeHdr("margin", t("cases.columns.margin", "Biên LN"), {
        align: "right",
      }),
      size: 110,
      className: "text-right tabular-nums",
      cell: (item: any) => {
        const m = Number(item.margin) || 0;
        return <span>{m > 0 ? `+${m.toFixed(1)}%` : `${m.toFixed(1)}%`}</span>;
      },
    },
    {
      key: "tienCoThue",
      label: t("cases.columns.totalAmount", "Tổng phải thu"),
      header: makeHdr(
        "tienCoThue",
        t("cases.columns.totalAmount", "Tổng phải thu"),
        {
          align: "right",
          formatOptionLabel: (v: string) => money(Number(v) || 0),
        },
      ),
      size: 160,
      className: "text-right tabular-nums",
      cell: (item: any) => money(Number(item.tienCoThue) || 0),
    },
    {
      key: "tienDaThanhToan",
      label: t("cases.columns.paidAmount", "Đã thu"),
      header: makeHdr(
        "tienDaThanhToan",
        t("cases.columns.paidAmount", "Đã thu"),
        {
          align: "right",
          formatOptionLabel: (v: string) => money(Number(v) || 0),
        },
      ),
      size: 160,
      className: "text-right tabular-nums text-emerald-600 font-medium",
      cell: (item: any) => money(Number(item.tienDaThanhToan) || 0),
    },
    {
      key: "tienConPhaiThanhToan",
      label: t("cases.columns.balanceAmount", "Còn phải thu"),
      header: makeHdr(
        "tienConPhaiThanhToan",
        t("cases.columns.balanceAmount", "Còn phải thu"),
        {
          align: "right",
          formatOptionLabel: (v: string) => money(Number(v) || 0),
        },
      ),
      size: 160,
      className: "text-right tabular-nums text-amber-600 font-medium",
      cell: (item: any) => money(Number(item.tienConPhaiThanhToan) || 0),
    },
  ];
}
